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

## mStudio Webhook Aufrufe

Das Setzen der Umgebungsvariable `MITTWALD_API_BASE_URL` in `src/middleware/auth.ts` **deaktiviert die Signaturprüfung**. Dadurch können Webhook-Aufrufe nachgestellt werden, im Repository gibt es zwei Beispiele dazu:

- `scripts/mock-extension-installation-webhook.sh`
- `scripts/mock-extension-uninstallation-webhook.sh`

Mit diesen Scripten kann bei deaktivierter Signaturprüfung mit Webhook-Aufrufen gearbeitet werden, um die Installation einer Extension-Instanz zu simulieren.

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

# Design und Migration

Die hier gezeigten Instrumente und Konzepte können auf andere Extensions übertragen werden. Sowohl der "Mock-Extension-Host" für das Frontend, als auch die "Mock-API" können ohne weiteres für andere Extensions benutzt werden. Das Muster, die Basis-URL des API-Clients über Umgebungsvariablen zu verändern, findet sich auch in anderen Repositorys wieder und ist übertragbar.
