# Extensions testen

Um die eigentliche Geschäftslogik der eigenen Extension zu testen kann es hilfreich sein, alle anderen Schnittstellen der Extension durch Mocks zu ersetzen, sodass keine externen Einflüsse stören können.

Dieser Guide zeigt Möglichkeiten auf, wie eine Extension komplett isoliert betrieben werden kann.

Im wesentlichen müssen drei mStudio-Schnittstellen isoliert werden:
1. mStudio API
2. mStudio Webhook-Aufrufe
3. mStudio Frontend-Einbindung

Alle drei Schnittstellen werden in den folgenden Kapiteln erklärt und ergeben gemeinsam die angesprochene Isolation.

## mStudio API

Im Rahmen anderer Projekte wurde bereits ein vollständiges Mocking-Schema in mockoon implementiert:

https://github.com/gandie/mw-api-mockoon-gen

Der Anleitung folgend kann hiermit die gesamte API nachgebildet werden, ggf. können Rückgabewerte der API in weiteren Ableitungen auf den eigenen Anwendungsfall angepasst werden ( z.B. bekannten Projektnamen zurückgeben, Services o.ä. ).

Der API-Client für diese API wird in dieser Extension zentral in einer Middleware erstellt und kann dort manipuliert werden:

`src/middleware/auth.ts`

Durch Setzen der Umgebungsvariable `MITTWALD_API_BASE_URL` kann der erstellte API-Client auf eine eigene URL umgestellt werden, sodass API-Aufrufe nicht länger gegen das produktive mStudio laufen.

**Wichtig:** Diese Variable ist kein reiner URL-Override, sondern aktiviert den Mock-Modus. Der Client sendet einen festen Mock-Session-Token; der Server ersetzt die Session-Verifikation durch eine feste Identität und überspringt den echten Access-Token-Austausch. Der API-Client erhält einen künstlichen Token, den die Mock-API akzeptieren muss. Zusätzlich wird die Webhook-Signaturprüfung deaktiviert. Das gilt unabhängig von `NODE_ENV`, also auch bei `production`.

Verwende diesen Modus ausschließlich in einer isolierten Testumgebung ohne echte Kundendaten und ohne öffentliche Freigabe der Extension. In produktiven Umgebungen muss `MITTWALD_API_BASE_URL` fehlen. Die übrigen Pflichtvariablen, insbesondere `EXTENSION_ID`, `EXTENSION_SECRET` und die Datenbank- und Verschlüsselungskonfiguration, bleiben auch im Mock-Modus erforderlich.

Die feste Server-Identität ist in `src/middleware/auth.ts` definiert:

| Wert | Mock-Identität |
| --- | --- |
| Session-ID | `mock-session-id` |
| User-ID | `MOCK_USER_ID` |
| Extension-ID der Mock-Session | `mock-extension-id` |
| Extension-Instanz-ID | `MOCK_EXTENSION_INSTANCE_ID` |
| Projekt-ID (`contextId`) | `MOCK_CONTEXT_ID` |
| Kontext | `project` |
| Scopes | leere Liste |

Die Mock-API muss das Projekt und den User unter diesen IDs bedienen. Verwende dieselbe User-, Instanz- und Projekt-ID im Config-Payload des Mock-Hosts, damit Frontend und Server denselben Kontext darstellen. Änderungen am Host-Payload oder an Script-Variablen ändern die feste Server-Identität nicht. Für andere IDs muss auch die Mock-Identität in der Middleware angepasst werden.

Vite übernimmt die Variable beim Start beziehungsweise beim Build in den Client-Code; der Server liest sie aus seiner Umgebung. Nach Änderungen den Dev-Server neu starten beziehungsweise den Produktionsbuild neu erstellen und mit passender Server-Konfiguration starten. Ein bereits mit Mock-Konfiguration gebautes Frontend nicht für den produktiven Betrieb wiederverwenden.

## mStudio Webhook Aufrufe

Ist `MITTWALD_API_BASE_URL` in der Server-Umgebung gesetzt, deaktiviert die Webhook-Route in `src/routes/api/webhooks.mittwald.ts` die Signaturprüfung. Dadurch können Webhook-Aufrufe nachgestellt werden, im Repository gibt es zwei Beispiele dazu:

- `scripts/mock-extension-installation-webhook.sh`
- `scripts/mock-extension-uninstallation-webhook.sh`

Mit diesen Scripten kann bei deaktivierter Signaturprüfung mit Webhook-Aufrufen gearbeitet werden, um die Installation einer Extension-Instanz zu simulieren.

Vom Repository-Verzeichnis aus:

```bash
bash scripts/mock-extension-installation-webhook.sh

# Erst nach den Funktionstests: Instanz und zugehörige Kommentare löschen
bash scripts/mock-extension-uninstallation-webhook.sh
```

Beide Scripts laden `.env` und benötigen `EXTENSION_ID` mit demselben Wert wie die laufende Anwendung. Diese Webhook-ID ist nicht die feste `mock-extension-id` der Mock-Session. Standardmäßig verwenden die Scripts `MOCK_EXTENSION_INSTANCE_ID`, `MOCK_CONTEXT_ID` und `MOCK_USER_ID`, passend zur Middleware. Die Override-Variablen gleichen Namens ändern nur den Webhook-Payload, nicht die Server-Identität. `APP_BASE_URL` ist standardmäßig `http://localhost:3000`; alternativ kann `WEBHOOK_URL` den vollständigen Endpunkt vorgeben.

Die Aufrufe schreiben tatsächlich in die Datenbank. Der Query-Parameter `dry-run=true` in den Scripts verhindert das nicht.

## mStudio Frontend Einbindung

Das Frontend einer Extension kann im mStudio nativ eingebunden werden. Dadurch ist das native mStudio-Frontend einer Extension so gestaltet, dass es eine äußere Anwendung benötigt, die dem Extension-Frontend einen Slot zuweist.

Diese Funktion kann nachgestellt werden:
- https://github.com/gandie/mittwald-extension-mock-host

Mit diesem Repository kann ein mStudio-Frontend auch separat betrieben werden. Das ist nützlich für erste simple Tests und kann mit den anderen Instrumenten zu einem vollen Integrationstest kombiniert werden.

## Testsequenz bei voller Isolation

Eine Sequenz zum **isolierten** Testen in dieser Extension sieht dann so aus:

1. Starte den `mittwald-extension-mock-host`
2. Starte die generierte mock-API, über `mockoon-cli` oder in der Desktop-App
3. Setze `MITTWALD_API_BASE_URL` auf die Adresse der Mock-API in `.env`
4. Starte die Extension, direkt lokal oder per `docker compose`
5. Öffne im Browser den mock-Host, und setze die URL auf das Frontend der Extension

**Erwartung:** Extension-Frontend wird fehlerfrei in den mock-Host geladen.

Für rein visuelle Tests und/oder Layouting-Arbeiten ist dieser Aufbau schon ausreichend. Für Tests der Funktionalität kann noch eine passende Extension-Instanz erstellt werden per Webhook-Aufruf: `scripts/mock-extension-installation-webhook.sh`.

Danach ist die Extension voll funktionsfähig, es können Kommentare für das Beispiel-Projekt aus der Mock-API geschrieben und wieder gelöscht werden.

# Bekannte Fehlerquellen

Die folgenden Fehlerbilder sind bei der Arbeit an dieser Extension tatsächlich aufgetreten. Sie sind hier gesammelt, weil die sichtbare Fehlermeldung in allen Fällen weit von der eigentlichen Ursache entfernt war. Die Liste ist eine Starthilfe, keine vollständige Diagnose-Referenz.

## Ext-Bridge: `ExtBridgeError: Ext Bridge not ready after 7500ms`

**Symptom:** Eine beliebige Komponente, die `useConfig()` oder `useLanguage()` benutzt, wirft nach 7,5 Sekunden einen Fehler. Häufig erst dann, wenn eine bestimmte Komponente das erste Mal gerendert wird — in dieser Extension war das `CommentMessage`, das nur mountet, wenn mindestens ein Kommentar existiert. Eine leere Liste beweist also nichts.

**Ursache:** `RemoteRoot` meldet dem Host beim ersten Commit die Bereitschaft. Dafür muss `globalThis.mwExtBridge` zu diesem Zeitpunkt bereits existieren. Ist es das nicht, wird der Handshake **stillschweigend übersprungen** — ohne Fehler und ohne Warnung. Seit `@mittwald/ext-bridge@1.x` wird das Global nicht mehr als Seiteneffekt beim Import gesetzt, sondern muss explizit initialisiert werden.

**Abhilfe:** `initExtBridge()` aus `@mittwald/ext-bridge/browser` auf Modulebene in `src/routes/__root.tsx` aufrufen, bevor irgendetwas gerendert wird. Das ist kein Workaround, sondern der vorgesehene Setup-Schritt.

**Prüfung:** In der Browser-Konsole des Extension-Iframes muss `globalThis.mwExtBridge` direkt nach dem Laden definiert sein.

## Doppelte Flow-Module

**Symptom:** Konsolenwarnung `mwExtBridge is already defined ... installed multiple times`, oder Fehler beim Registrieren der `flr-*` Custom Elements (`customElements.define`).

**Ursache:** Mehrere aufgelöste Kopien derselben Flow- oder Ext-Bridge-Pakete im Bundle. Eine zweite Instanz überschreibt dabei eine bereits verbundene Bridge. Typische Auslöser sind Versions-Drift zwischen den Flow-Paketen oder alte Verzeichnisse in `node_modules/.pnpm` nach einem Upgrade.

**Abhilfe:** Alle `@mittwald/flow-*`-, `ext-bridge`- und `mstudio-ext-*`-Pakete gemeinsam auf dieselbe Version setzen — einige Pakete pinnen sich gegenseitig exakt. Danach sauber neu installieren (`node_modules` und den Vite-Cache löschen) und in `pnpm-lock.yaml` prüfen, dass `@mittwald/ext-bridge` nur einmal aufgelöst wird. Die `resolve.dedupe`-Liste in `vite.config.ts` erfüllt hier ebenfalls einen Zweck und sollte beim Hinzufügen neuer Flow-Pakete gepflegt werden.

## Webhook-Signaturen

**Symptom:** Webhook-Aufrufe werden mit `401` abgelehnt, obwohl der Aufruf korrekt aussieht. Oder umgekehrt: offensichtlich ungültige Aufrufe werden mit `200` angenommen.

**Ursache:** Das Setzen von `MITTWALD_API_BASE_URL` deaktiviert die Signaturprüfung vollständig (siehe oben). Das ist für den isolierten Betrieb gewollt, in einer produktiven Umgebung aber ein ernsthaftes Problem. Die zweithäufigste Ursache ist eine `EXTENSION_ID`, die nicht zu der ID im Webhook-Payload passt.

**Abhilfe:** Sicherstellen, dass `MITTWALD_API_BASE_URL` in produktiven Umgebungen **nicht** gesetzt ist, und dass `EXTENSION_ID` mit der registrierten Extension übereinstimmt.

**Prüfung:** Die beiden Proben laufen gegen eine gesonderte Testumgebung mit aktiver Signaturprüfung. Entferne dort `MITTWALD_API_BASE_URL` aus der Server-Umgebung und starte die Anwendung neu. Beide Scripts laden `.env` aus dem aktuellen Verzeichnis; `EXTENSION_ID` muss zur laufenden Anwendung passen. `APP_BASE_URL` ist standardmäßig `http://localhost:3000`, `WEBHOOK_URL` kann den vollständigen Endpunkt überschreiben.

```bash
bash scripts/test-webhook-missing-signature.sh
```

Die zweite Probe benötigt `X-Marketplace-Signature-Serial` und `X-Marketplace-Signature` aus **demselben echten Webhook**. Ersetze die Platzhalter mit diesen Headerwerten. Der verwendete Algorithmus muss ebenfalls zum echten Webhook passen; Standard ist `ed25519`.

```bash
WEBHOOK_SIGNATURE_SERIAL='<Serial des echten Webhooks>' \
WEBHOOK_SIGNATURE='<Signatur desselben Webhooks>' \
WEBHOOK_SIGNATURE_ALGORITHM=ed25519 \
bash scripts/test-webhook-invalid-signature.sh
```

Die Probe verwendet diese Signatur mit einem anderen Body und erwartet deshalb eine Ablehnung. Der Server muss den öffentlichen Schlüssel zur angegebenen Serial abrufen können. Keine erfundenen Headerwerte verwenden: Eine Ablehnung wegen unbekannter Serial würde die eigentliche Signaturprüfung nicht testen.

| Probe | Ergebnis und Exit-Code |
| --- | --- |
| Fehlende Signatur | `401`: PASS, Exit `0`; jeder andere Status: FAIL, Exit `1` |
| Signatur mit verändertem Body | `401`: PASS, Exit `0`; `200`: VULNERABLE, Exit `1`; jeder andere Status: INCONCLUSIVE, Exit `2` |

Ein `200` ist ein Sicherheitsfehler, aber allein kein Beweis für dessen Ursache. Auch ein `401` beweist nur die Ablehnung: Die Middleware verwendet denselben Status etwa bei fehlenden Headern, falscher Extension-ID oder fehlgeschlagenem Schlüsselabruf. Prüfe zusätzlich das Serverlog auf den tatsächlichen Ablehnungsgrund. Für eine vollständige Prüfung gehört ein unveränderter, gültig signierter Webhook dazu, der erfolgreich verarbeitet wird. Verwende dafür eine dedizierte Testinstanz, da gültige Webhooks Daten verändern können. Die beiden negativen Proben ersetzen weder diesen Positivtest noch einen Test gegen das produktive mStudio.

## Authentifizierungs-Kontext und fehlende Extension-Instanz

**Symptom:** Serverfunktionen schlagen fehl, obwohl Frontend und API augenscheinlich korrekt arbeiten. Im Netzwerk-Tab ist ein `500` auf einen `_serverFn`-Aufruf zu sehen.

**Ursache:** Zur Session gibt es keine passende Extension-Instanz in der eigenen Datenbank. Im Mock-Modus verwendet der Server stets `MOCK_EXTENSION_INSTANCE_ID`, unabhängig von der Instanz-ID im Mock-Host.

**Abhilfe:** `bash scripts/mock-extension-installation-webhook.sh` mit den Standard-IDs ausführen, damit die von der Middleware verwendete Instanz angelegt wird. Mock-Host und Mock-API auf die oben dokumentierten IDs abstimmen. Falls Script-Overrides gesetzt wurden, müssen sie auch zur festen Server-Identität passen.

## API-Statusbehandlung

**Symptom:** Nach einem Update von `@mittwald/api-client` existiert eine benutzte Methode nicht mehr, oder ein Aufruf liefert stillschweigend nichts Brauchbares.

**Ursache:** Zwei getrennte Themen. Erstens wandert Funktionalität zwischen Releases: `project.updateProjectDescription` ist beispielsweise in `project.updateProject` aufgegangen, bei identischem Request-Format. Zweitens wirft der API-Client bei Fehlerstatus nicht automatisch — der `status` der Antwort muss selbst geprüft werden, sonst wird mit leeren oder unvollständigen Daten weitergearbeitet.

**Abhilfe:** Nach jedem Client-Update `tsc --noEmit` laufen lassen; entfernte Methoden fallen dabei sofort auf. Antworten immer über den `status` prüfen — etwa mit `assertStatus` — und bekannte Fehlerfälle in einen `PublicError` übersetzen, siehe `src/domain/project.ts` und `concepts/Errorhandling.md`.

## Serialisierung von Serverfunktions-Fehlern

**Symptom:** Eine Serverfunktion schlägt fehl, das Formular zeigt aber keinen Fehler an, sondern den Erfolgsfall — inklusive grünem Haken und zurückgesetztem Formular. Der fehlgeschlagene `500`-Aufruf ist nur in der Browser-Konsole sichtbar.

**Ursache:** Gibt die Fehler-Middleware eine `Response` mit Fehlerstatus zurück, statt zu werfen, macht der Client-Transport von TanStack Start daraus kein abgelehntes Promise. Die aufrufende Komponente folgt dann ihrem Erfolgspfad. Dieses Verhalten hat sich zwischen Start-Versionen geändert, ohne dass der Code angepasst werden musste — der Fehler entsteht also erst beim Upgrade.

**Abhilfe:** In `src/middleware/error-handling.ts` einen `Error` **werfen**, der den serialisierten öffentlichen Fehlerkörper enthält. Nur so erreichen `useFormErrorHandling` und `parsePublicError` die Anzeige. Die Regression ist in `src/middleware/error-handling.test.ts` abgesichert.

## Formularfelder werden nach dem Absenden nicht geleert

**Symptom:** Nach erfolgreichem Absenden bleibt der eingegebene Text im Feld stehen, obwohl die Anwendung das Feld intern als leer betrachtet und beim erneuten Absenden eine Pflichtfeld-Validierung auslöst.

**Ursache:** Wird React Hook Form ohne `defaultValues` initialisiert, setzt `form.reset()` den Wert auf `undefined`. Der Flow-`Field`-Adapter reicht das an die Remote-Komponente weiter, die dadurch unkontrolliert bleibt und ihren alten Inhalt behält.

**Abhilfe:** Alle Felder in `defaultValues` mit einem definierten Startwert anlegen, also etwa `defaultValues: { text: "" }`. Beispiel in `src/components/comments/CommentForm.tsx`.

# Design und Migration

Die hier gezeigten Instrumente und Konzepte können auf andere Extensions übertragen werden. Sowohl der "Mock-Extension-Host" für das Frontend, als auch die "Mock-API" können ohne weiteres für andere Extensions benutzt werden. Das Muster, die Basis-URL des API-Clients über Umgebungsvariablen zu verändern, findet sich auch in anderen Repositorys wieder und ist übertragbar.
