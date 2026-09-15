# Reference Extension

Eine umfassende Beispiel-Extension für den mittwald mStudio Marketplace.
Dieses Projekt richtet sich an Contributor, die ihre erste Extension entwickeln möchten
und einen vollständigen Überblick über die Konzepte, Mechanismen und Best Practices einer mittwald Extension erhalten wollen.

## 📖 Inhaltsverzeichnis

- [✨Überblick](#-überblick)
- [🔗Verwendeter Technologie-Stack](#-verwendeter-technologie-stack)
- [🔑Voraussetzungen](#-voraussetzungen)
- [📁Repository-Struktur](#-repository-struktur)
- [📦Implementierte Marktplatz-Mechanismen](#-implementierte-marktplatz-mechanismen)
- [💻Lokale Entwicklung](#-lokale-entwicklung)
- [💡Kern-Konzepte](#-kern-konzepte)
- [🔧Verfügbare Scripts](#-verfügbare-scripts)
- [⚠️Troubleshooting](#-troubleshooting)
- [✅Was kann mit diesem Extension-Template umgesetzt werden?](#-was-kann-mit-diesem-extension-template-umgesetzt-werden)
- [📚Weiterführende Ressourcen](#-weiterführende-ressourcen)

## ✨ Überblick

Diese Referenz Extension demonstriert die wichtigsten Funktionen einer mittwald Extension:

- **Lifecycle Webhooks**: Verwaltung von Extension-Instanzen über Webhook-Events
- **Frontend Fragments**: Rendering von UI-Komponenten im mStudio
- **Datenzugriff auf mStudio**: Abrufen und Bearbeiten von Project-Daten über die mittwald API
- **Eigene Datenhaltung**: Speicherung von Extension-spezifischen Daten in einer PostgreSQL-Datenbank
- **Error Handling**: Robuste Fehlerbehandlung für Server- und Client-seitige Fehler
- **Authentifizierung**: Sichere Authentifizierung über Session Tokens und Access Tokens

## 🔗 Verwendeter Technologie-Stack

Grundsätzlich ist der mStudio Marktplatz so konzipiert, dass der Technologiestack frei gewählt werden kann.
Dennoch entwickeln sich Libraries und Tools rund um häufig gewählte Technologiestack herum.
Wir haben uns darum entschieden die Technologien anhand 3 Faktoren auszuwählen:
    * der Verbreitung in der aktuellen Web-Entwicklung
    * dem Vorhandensein von bestehenden Libraries und Tools
    * den Synergieeffekten mit dem mStudio Marktplatz

### Frontend-Framework
- **React 19**: Die neueste Version von React für moderne UI-Entwicklung
- **TanStack Router**: Type-safe Routing mit Server-Side Rendering Support
- **TanStack Query**: Effizientes State Management für Server-Daten
- **React Ghostmaker**: Abstraktionsschicht über Tanstack Query, um das Caching und Abrufen von Daten erheblich zu erleichtern
- **TanStack Start**: Full-stack React Framework mit CSR by default und API Routen

**Begründung**: TanStack Start bietet ein einheitliches Framework für Frontend und Backend,
    was die Entwicklung vereinfacht und Type Safety über die gesamte Anwendung garantiert.
    Außerdem ist Tanstack Start im Gegensatz zu Next.js standardmäßig clientseitig gerendert,
    was für eine Extension von Vorteil ist, da das Beziehen von Session Tokens nur im Client funktioniert.

### UI-Komponenten
- **@mittwald/flow-remote-react-components**: mittwald's Flow Design System für Remote DOM Rendering
- **@mittwald/mstudio-ext-react-components**: Spezialisierte Komponenten für mStudio Extensions

**Begründung**: Diese Komponenten stellen sicher, dass die Extension nahtlos in das mStudio Design integriert wird.
    Da Frontend Fragmente auf ein Remote-DOM setzen, werden (fast) nur custom HTML Elemente akzeptiert.
    Die flow-remote-react-components bieten eine React Components Schicht für alle verfügbaren Custom HTML Elements.

### API & Authentifizierung
- **@mittwald/api-client**: Type-safe Client für die mStudio API
- **@mittwald/ext-bridge**: Bibliothek für Session Token Handling und Access Token Generierung

**Begründung**: Diese offiziellen mittwald Bibliotheken bieten vollständige TypeScript-Unterstützung und kümmern sich um die komplexe Authentifizierung.

### Datenbank
- **Drizzle ORM**: Type-safe SQL ORM für TypeScript
- **PostgreSQL**: Relationale Datenbank für Extension-spezifische Daten

**Begründung**: Drizzle bietet exzellente TypeScript-Unterstützung, ist performant und hat eine intuitive API.
    PostgreSQL ist eine bewährte, zuverlässige Datenbank.

### Webhook-Handling
- **@weissaufschwarz/mitthooks**: Bibliothek zur Verarbeitung von mittwald Lifecycle Webhooks

**Begründung**: Abstrahiert die komplexe Webhook-Verarbeitung und bietet einfache Interfaces für Extension Instance Management.
    Außerdem ist es modular aufgebaut und lässt sich einfach an eigene Technologieentscheidungen und Anwendungsfälle anpassen.

### Validierung & Type Safety
- **Zod**: Schema-Validierung für Runtime Type Checking
- **TypeScript**: Statische Typisierung für den gesamten Code

**Begründung**: Zod ermöglicht es, Types zur Runtime zu validieren und TypeScript-Types daraus abzuleiten,
    was maximale Type Safety garantiert.

### Build Tools & Code Quality
- **Vite**: Schnelles Build-Tool und Dev-Server
- **Biome**: Moderner Linter und Formatter (Alternative zu ESLint + Prettier)
- **Vitest**: Testing Framework basierend auf Vite

**Begründung**: Vite bietet extrem schnelle Build-Zeiten und Hot Module Replacement. Biome vereint Linting und Formatting in einem schnellen Tool.

## 🔑 Voraussetzungen

Bevor du mit der Entwicklung beginnst, stelle sicher, dass folgende Software installiert ist:

- **Node.js 22**: Diese Extension benötigt zwingend Node.js Version 22
  ```bash
  node --version  # Sollte v22.x.x ausgeben
  ```
- **pnpm 9.14.4+**: Package Manager (wird durch packageManager in package.json erzwungen)
  ```bash
  npm install -g pnpm
  ```
- **Docker & Docker Compose**: Für die lokale PostgreSQL-Datenbank (optional, aber empfohlen) oder vollständig containerisierte (Entwicklungs-) Umgebungen
  ```bash
  docker --version
  docker-compose --version
  ```
- **zrok Account** (optional): Für das Testen von Webhooks während der lokalen Entwicklung
  - Registrierung: [zrok.io](https://zrok.io/)
  - Alternative: [ngrok](https://ngrok.com/), jedoch closed source, nicht dokumentiert und ungetestet

Außerdem musst du [Contributor sein](https://developer.mittwald.de/de/docs/v2/contribution/how-to/become-contributor/) und [eine Extension erstellt haben](https://developer.mittwald.de/de/docs/v2/contribution/how-to/manage-extensions/)
Um die Extension testen zu können, muss außerdem ein Projekt innerhalb deiner Organisation existieren.

## 📁 Repository-Struktur

```
.
├── src/
│   ├── components/          # React UI-Komponenten
│   │   ├── comments/        # Kommentar-bezogene Komponenten
│   │   ├── project/         # Projekt-bezogene Komponenten
│   │   └── ...              # Weitere Komponenten
│   ├── db/                  # Datenbank-Schema und Konfiguration
│   │   ├── index.ts         # Drizzle Client Setup
│   │   └── schema.ts        # Datenbank-Tabellen (extension_instance, comments)
│   ├── domain/              # Business-Logik im eigenen Package, um Probleme mit clientseitigem Import zu umgehen
│   │   ├── comments/        # Kommentar-Domain-Logik
│   │   └── project.ts       # Projekt-Domain-Logik (mStudio API-Calls)
│   ├── hooks/               # Wiederverwendbare React Hooks
│   │   └── useFormErrorHandling.tsx
│   ├── middleware/          # TanStack Start Middleware
│   │   ├── auth.ts          # Authentifizierung (Session + Access Token)
│   │   └── error-handling.ts # Zentrale Fehlerbehandlung
│   ├── routes/              # TanStack Router Routes
│   │   ├── api/             # API-Endpunkte
│   │   │   └── webhooks.mittwald.ts  # Lifecycle Webhook Handler
│   │   ├── __root.tsx       # Root-Layout
│   │   └── index.tsx        # Haupt-UI-Route
│   ├── serverFunctions/     # Server Functions (TanStack Start)
│   │   ├── comments/        # Kommentar-Server-Funktionen
│   │   ├── edit-project-description.ts
│   │   └── get-project-of-extension-instance.ts
│   ├── env.ts               # Umgebungsvariablen-Validierung (envalid)
│   ├── ghosts.ts            # Frontend API für Server Functions (react-ghostmaker)
│   ├── global-errors.ts     # Zentrale Fehler-Definitionen
│   ├── router.tsx           # Router-Konfiguration
│   └── start.ts             # Einstiegspunkt
├── public/                  # Statische Assets
├── .env.example             # Beispiel-Umgebungsvariablen
├── docker-compose.yml       # Containerisierte Umgebung für Produktion
├── docker-compose.dev.yml   # Containerisierte Umgebung für Entwicklung
├── drizzle.config.ts        # Drizzle ORM Konfiguration
├── vite.config.ts           # Vite Build-Konfiguration
├── biome.json               # Linter/Formatter-Konfiguration
└── package.json             # Dependencies und Scripts
```

### Verantwortlichkeiten der Packages

- **[`src/components/`](src/components)**: Enthält alle React-Komponenten, die im mStudio gerendert werden. Nutzt ausschließlich `@mittwald/flow-remote-react-components` für UI-Elemente.

- **[`src/db/`](src/db)**: Datenbank-Layer mit Drizzle ORM. Definiert das Schema für Extension-Instanzen und Custom-Daten (Kommentare).

- **[`src/domain/`](src/domain)**: Business-Logik ohne Framework-Abhängigkeiten. Enthält die API-Calls zur mittwald API und Daten-Transformationen.

- **[`src/middleware/`](src/middleware)**: TanStack Start Middleware für Cross-Cutting Concerns:
  - Authentifizierung
  - Fehlerbehandlung
  - Request-Validierung

- **[`src/routes/`](src/routes)**: File-based Routing mit TanStack Router. API-Routes unter `routes/api/`, UI-Routes direkt unter `routes/`.

- **[`src/serverFunctions/`](src/serverFunctions)**: Server-seitige Funktionen, die vom Client aufgerufen werden können (ähnlich wie API Routes, aber mit Type Safety).

## 📦 Implementierte Marktplatz-Mechanismen

Diese Extension nutzt zwei zentrale Mechanismen des mittwald Marketplace:

### 1. Lifecycle Webhooks

**Was sind Lifecycle Webhooks?**

Lifecycle Webhooks sind HTTP-Callbacks, die vom mStudio Marketplace an deine Extension gesendet werden, wenn bestimmte Events auftreten.
Sie ermöglichen es der Extension, auf Änderungen zu reagieren, wie z.B. Installation, Deinstallation oder Scope-Updates.

**Implementierung in diesem Projekt:**

Die Webhook-Handler befinden sich in [`src/routes/api/webhooks.mittwald.ts`](src/routes/api/webhooks.mittwald.ts).

```typescript
// Vereinfachtes Beispiel
export const Route = createFileRoute("/api/webhooks/mittwald")({
    server: {
        handlers: {
            POST: async ({ request }) => {
                const combinedHandler = new CombinedWebhookHandlerFactory(
                    new DrizzleExtensionStorage(),
                    env.EXTENSION_ID,
                ).build();

                await combinedHandler(webhookContent);

                return new Response("Webhook handled successfully", {
                    status: 200,
                });
            },
        },
    },
});
```

**Verarbeitete Events:**

- **Extension Instance Created**: Wird aufgerufen, wenn ein User die Extension zu einem Projekt hinzufügt
  - Speichert die Extension Instance in der Datenbank

- **Extension Instance Updated**: Wird aufgerufen, wenn sich Scopes oder Einstellungen ändern
  - Aktualisiert die Extension Instance in der Datenbank

- **Extension Instance Removed**: Wird aufgerufen, wenn ein User die Extension entfernt
  - Löscht die Extension Instance aus der Datenbank

**Weitere Informationen:**
- [Lifecycle Webhooks Dokumentation](https://developer.mittwald.de/de/docs/v2/contribution/overview/concepts/lifecycle-webhooks/)

### 2. Frontend Fragments

**Was sind Frontend Fragments?**

Frontend Fragments sind UIs, die als Remote DOM im mStudio gerendert werden.
Die Extension liefert das JavaScript, das mStudio rendert die Komponenten, die die Extension vorgibt, in einem unsichtbaren Iframe mit spezieller Kommunikationsschicht.

**Implementierung in diesem Projekt:**

Die Haupt-UI-Route befindet sich in [`src/routes/index.tsx`](src/routes/index.tsx) und rendert ein Dashboard mit verschiedenen Cards.
Durch die Nutzung der `flow-remote-react-components` entfällt die Nutzung von kryptischen Custom HTML Elemente und fühlt sich an, wie normale React-Entwicklung.

**Wichtige Konzepte:**

- **Flow Remote Components**: Alle UI-Komponenten MÜSSEN aus `@mittwald/flow-remote-react-components` aufgebaut werden
  - Standard HTML-Elemente (`<div>`, `<button>`) funktionieren NICHT im Remote DOM
  - Nutze stattdessen: `<Section>`, `<Button>`, `<Text>`, etc.

- **Rendering-Location**: Die Extension wird im Projekt-Kontext im mStudio angezeigt
  - Der User navigiert zu einem Projekt
  - Die Extension erscheint als eigener Menüpunkt in der Navigation

**Beispiel-Komponente mit Flow Components:**

```tsx
// src/components/project/ProjectCard.tsx
import { LayoutCard, Heading, Text } from "@mittwald/flow-remote-react-components";

export function ProjectCard() {
    return (
        <LayoutCard>
            <Heading>Projekt-Informationen</Heading>
            <Text>
                Dieses Projekt nutzt die mittwald API um Daten abzurufen.
            </Text>
        </LayoutCard>
    );
}
```

**Weitere Informationen:**
- [Frontend Fragments Dokumentation](https://developer.mittwald.de/de/docs/v2/contribution/overview/concepts/frontend-development/#frontend-fragmente)
- [Flow Design System](https://mittwald.github.io/flow/): Hier werden alle Flow Components dokumentiert. Die Imports in den Beispielen beziehen sich auf die normalen Components. Nutze stattdessen die Imports aus `@mittwald/flow-remote-react-components`

## 💻 Lokale Entwicklung

### Schritt 1: Development Extension konfigurieren

Der mStudio Marktplatz bietet keinen expliziten Weg, verschiedene Umgebungen für Extensions zu konfigurieren.
Stattdessen kannst du eine eigene Extension für Entwicklungszwecke anlegen.
Weitere Hinweise, wie eine Extension angelegt und konfiguriert wird, sind im [Guide zu "Wie verwalte ich Extensions?"](https://developer.mittwald.de/de/docs/v2/contribution/how-to/manage-extensions/) nachzulesen.

**Wichtig:** Du musst die Extension NICHT veröffentlichen, um sie während der Entwicklung zu nutzen!

#### Berechtigungen konfigurieren

Zu diesem Zeitpunkt kann bereits der Extension Context unter **Berechtigungen** auf "Projekt" gestellt werden, da dieses Template für Projekt-Extensions entwickelt wurde.
Außerdem können auf der selben Seite die Scopes `project:write`, `project:read` und `user:read` konfiguriert werden.
Diese werden benötigt, um alle Funktionen dieser Extension verwenden zu können.
Falls einer dieser Scopes fehlt, wird die Extension den Contributor mit einem Fehler im Frontend darauf aufmerksam machen.

#### Frontend Fragment konfigurieren
Außerdem kann unter **Frontend** bereits ein Frontend Fragment mit dem Ankerpunkt `/projects/project/menu/section/extensions/item` und der URL `http://localhost:3000` angelegt werden.
Dieses wird später benötigt, um das Frontend der Extension sehen zu können.
Theoretisch sind auch andere Ankerpunkte denkbar, aber diese Extension wirkt am besten als eigener Menüpunkt

#### Extension Secret generieren

Für die Validierung der Webhooks wird
Für folgende Schritte wird außerdem ein Extension Secret benötigt.
Dieses kann derzeit noch nicht über das mStudio Frontend erzeugt werden, sondern über die API.

```bash
curl -X POST https://api.mittwald.de/v2/contributors/{contributorId}/extensions/{extensionId}/secret \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

Die **Extension-ID** kann dem mStudio in der Extension Verwaltung unter **Details** entnommen werden
Die **Contributor-ID** ist im Menüpunkt **Contributor** aufzufinden (Achtung: **nicht** die Contributor-Nr.).
Als Bearer kann ein [API Token](https://developer.mittwald.de/de/docs/v2/api/intro/#ein-api-token-beziehen) verwendet werden.

**Dokumentation der Route:** [Extension Secret generieren](https://developer.mittwald.de/docs/v2/reference/marketplace/extension-generate-extension-secret/)

### Schritt 2: Repository klonen und Dependencies installieren

```bash
# Repository klonen
git clone https://github.com/mittwald/reference-extension.git
cd reference-extension

# Dependencies installieren
pnpm install
```

### Schritt 3: Umgebungsvariablen konfigurieren

```bash
# .env.example kopieren
cp .env.example .env
```

Bearbeite die `.env`-Datei und passe (bei Bedarf) die Werte an:

```bash
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres        # Für Produktivumgebungen unbedingt ändern!
POSTGRES_DB=extension
POSTGRES_HOST=localhost
POSTGRES_PORT=5433 # Achtung: Bewusst nicht der Standardport, um potenzielle Konflikte zu vermeiden
POSTGRES_USE_SSL=false

# Node Environment
NODE_ENV=development
PORT=3000

# Extension
EXTENSION_ID=your_extension_id_here          # Aus dem mStudio in der Extension Verwaltung
EXTENSION_SECRET=your_extension_secret_here  # Generiert über mittwald API
ENCRYPTION_MASTER_PASSWORD=changeme          # Für die Verschlüsselung der Extension Instance Secrets, wird im Folgenden erläutert
ENCRYPTION_SALT=changeme                     # Für die Verschlüsselung der Extension Instance Secrets, wird im Folgenden erläutert
ZROK_RESERVED_TOKEN=your_reserved_token_here # Für Webhooks, wird im Folgenden erläutert
```

Das `ENCRYPTION_MASTER_PASSWORD` und der `ENCRYPTION_SALT` werden benötigt, um einen Key für die Verschlüsselung abzuleiten.
Diese können über das folgende Package Script erzeugt werden.

```bash
pnpm run init:encryption
```

### Schritt 4: Datenbank starten

Die folgenden Schritte beschreiben die lokale Entwicklung: Die App läuft mit `pnpm run dev` auf deinem Rechner, PostgreSQL läuft in Docker. Deshalb verbindet sich die App über `localhost:5433` mit der Datenbank.

`docker-compose.dev.yml` enthält zusätzlich einen vollständig containerisierten Entwicklungsmodus. Für die lokale Entwicklung wird daraus jedoch nur der Service `db` gestartet:

```bash
# PostgreSQL als Docker Container starten
pnpm run docker:dev db

# Oder im Hintergrund starten
pnpm run docker:dev db -d
```

Die Datenbank ist nun erreichbar unter `localhost:5433`.

Wenn du die gesamte Extension in Docker starten möchtest, verwende stattdessen `pnpm run docker:dev`. In diesem Modus läuft auch die App im Docker-Netzwerk und verbindet sich intern über `db:5432` mit PostgreSQL.

**Hinweis:** Das Datenbankschema wird automatisch beim Start der Applikation angewendet (siehe [Datenbank-Migrationen](#datenbank)).

### Schritt 5: Development Server starten

```bash
pnpm run dev
```

Die Extension ist nun erreichbar unter `http://localhost:3000`.

**Was passiert beim Start:**

1. Vite startet den Development Server mit Hot Module Replacement
2. TanStack Start rendert die React-Anwendung
3. API-Routes werden unter `/api/*` verfügbar
4. Die Extension kann NICHT im Browser direkt aufgerufen werden, da die Remote Components ohne das mStudio nicht korrekt gerendert werden können

### Schritt 6: Webhooks lokal anbinden

Webhooks werden vom mStudio Marketplace Backend an deine Extension gesendet.
Da dein `localhost` nicht aus dem Internet erreichbar ist, kannst du nicht direkt echte Webhooks absetzen lassen.
Um deine Extension lokal zu testen, kannst du jedoch deinen localhost öffentlich erreichbar machen.
Um deinen localhost erreichbar zu machen, kannst du bspw. einen Tunneling Service wie [zrok.io](https://zrok.io/) oder ngrok verwenden.
Obwohl ngrok weiter verbreitet ist, empfehlen wir zrok, da es Open Source ist und Möglichkeiten des self-hosting existieren.
Außerdem bietet zrok die Möglichkeit, stabile URLs zu generieren, was im Free-Tier von ngrok nicht funktioniert.

#### Mit zrok (empfohlen)

zrok bietet **stabile URLs**, die sich nicht bei jedem Neustart ändern.

**Setup:**

1. **zrok Account erstellen**: Registrier dich für die SaaS Lösung von zrok oder hoste deinen eigenen zrok Relay Server.
   Wenn dir zrok bisher nicht bekannt war und du es noch nie verwendet hast, empfehlen wir, dem [Getting Started Guide](https://docs.zrok.io/docs/getting-started/) zu folgen.

2. **zrok installieren**: zrok ist eine CLI, die [auf deinem lokalen Gerät installiert werden muss](https://docs.zrok.io/docs/guides/install/).

    ```bash
    # unter MacOS
    brew install zrok
    # unter Linux
    curl -sSf https://get.openziti.io/install.bash | sudo bash -s zrok
    ```

3. **Device in die Umgebung einbinden**: Neben einem Zugang zu einem zrok Relay Server anzulegen, [musst du dein Gerät in die Umgebung einbinden](https://docs.zrok.io/docs/getting-started/#enabling-your-zrok-environment)

    ```bash
    zrok enable <your-token>
    ```

4. **Reserved Share erstellen**:

   ```bash
   zrok reserve public 3000
   ```

   Dies erstellt eine stabile URL wie `https://<token>.share.zrok.io`, die auf `localhost:3000` zeigt.

   **Wichtig:** Notiere dir den `<token>` aus der URL!

   Unter Umständen kann es nötig sein, root Rechte für diese Operation zu verwenden.
   Vor allem unter MacOS ist dies bspw. nötig, um das zu erstellende Zertifikat in den Trusted Root Certificate Store einzutragen.
   Wenn du auf Probleme diesbezüglich stößt, ergänze den Befehl mit `sudo`:


   ```bash
   sudo zrok reserve public 3000
   ```

5. **Token in `.env` eintragen**:
   ```bash
   ZROK_RESERVED_TOKEN=<token>
   ```

6. **Tunnel starten**:
   ```bash
   pnpm run dev:expose
   ```

Deine Extension ist nun unter `https://<token>.share.zrok.io` öffentlich erreichbar!

7. **Webhook-URL im mStudio konfigurieren**

- Öffne deine Extension im Contributoren Bereich des mStudio
- Navigiere zu dem Tab "Webhooks"
- Setze die Webhook-URLs auf: `https://<your-zrok-token>.share.zrok.io/api/webhooks/mittwald`

### Schritt 7: Eine Extension Instance erstellen

Da die Extension nicht einfach über http://localhost:3000 aufgerufen werden kann, binden wir sie im mStudio ein, um Live das gebaute Frontend sehen zu können.
Außerdem erfordert diese Extension einen Eintrag für die Extension Instance in der Datenbank, der über Webhooks angelegt wird.
Um dies zu erreichen, muss eine Extension Instance für ein existierendes Projekt erstellt werden.
Für nicht veröffentlichte Extensions muss dies über die API gemacht werden, wie [im Guide zur lokalen Entwicklung erklärt](https://developer.mittwald.de/de/docs/v2/contribution/how-to/local-development/#erstellen-einer-extension-instance)

Wenn eine Extension Instance erfolgreich erstellt wurde, wird in den Logs des Development Servers zu sehen sein, dass ein Webhook eingegangen ist.
Final prüfen kann man das, indem das Drizzle Studio gestartet und aufgerufen wird.

```bash
pnpm db:studio
```

Wenn der daraufhin angezeigten URL gefolgt wird, kann der Inhalt der Datenbank eingesehen werden.
Es sollte sich in der Tabelle `extension_instances` ein Eintrag befinden.

### Schritt 8: Frontend aufrufen

Um das Frontend der Extension anzuzeigen, kann **nicht** im Browser http://localhost:3000 aufgerufen werden.
Das Frontend benötigt das mStudio, um die Remote Components rendern zu können.

Stattdessen kann das Frontend über die zuvor erstellte Extension Instance aufgerufen werden, indem im mStudio in das zuvor verwendete Projekt navigiert wird.
Anschließend sollte links im Menü ein neuer Menüpunkt für die Extension auftauchen.
Dieser kann annavigiert werden, um die Extension zu rendern.

## 💡 Kern-Konzepte

Diese Extension demonstriert zentrale Konzepte die essenziell für die Entwicklung einer mStudio Extension sind:

- [Daten aus dem mStudio abrufen und verändern](./concepts/Datenzugriff-mStudio.md)
- [Eigene Datenhaltung](./concepts/Eigene-Datenhaltung.md)
- [Errorhandling](./concepts/Errorhandling.md)

## 🔧 Verfügbare Scripts

Diese Extension bietet eine Vielzahl von Package-Scripts für verschiedene Aufgaben:

### Development

```bash
# Development Server starten (mit HMR)
pnpm run dev

# Development Server mit zrok Tunnel (für das lokale Empfangen von Lifecycle Webhooks)
pnpm run dev:expose
```

### Build & Deployment

```bash
# Production Build erstellen
pnpm run build

# Production Build lokal testen
pnpm run serve
```

### Testing

```bash
# Tests ausführen (Vitest)
pnpm run test
```

### Code Quality

```bash
# Linting (nur prüfen)
pnpm run lint

# Linting (mit Autofix)
pnpm run lint:fix

# Formatting (nur prüfen)
pnpm run format

# Formatting (mit Autofix)
pnpm run format:fix

# Beides gleichzeitig (prüfen)
pnpm run check

# Beides gleichzeitig (mit Autofix)
pnpm run check:fix
```

**Empfehlung**: Nutze `pnpm run check:fix` vor jedem Commit!

### Datenbank

**Automatische Migrationen:** Die Applikation führt beim Start automatisch alle ausstehenden Datenbank-Migrationen aus. Dieses Verhalten kann über die Umgebungsvariable `RUN_MIGRATIONS_ON_STARTUP=false` deaktiviert werden.

**Workflow bei Schema-Änderungen:**

1. Schema in `src/db/schema.ts` anpassen
2. Migration generieren: `pnpm run db:generate-migrations`
3. Applikation neu starten - Migration wird automatisch angewendet

```bash
# Migrationen aus Schema-Änderungen generieren (nach jeder Schema-Änderung erforderlich!)
pnpm run db:generate-migrations

# Schema-Änderungen direkt in die DB pushen (nur für schnelles Prototyping, überschreibt ggf. Daten)
pnpm run db:push

# Migrationen manuell auf Datenbank anwenden
pnpm run db:migrate

# Drizzle Studio öffnen (Web-UI für Datenbank)
pnpm run db:studio
```

### Docker

**Extension im Development-Modus starten**:

```bash
# Gesamte Extension attached starten
pnpm run docker:dev
# Nur die Datenbank starten
pnpm run docker:dev db
# Datenbank detached starten
pnpm run docker:dev db -d

# Container herunterfahren
pnpm run docker:dev:down
```

**Bauen des Docker Image:**

```bash
pnpm run docker:dev:build
```

**Production Build ohne HMR starten:**
```bash
pnpm run docker:prod

# PostgreSQL im Production-Modus stoppen
pnpm run docker:prod:down
```

## ⚠️ Troubleshooting

### Häufige Probleme und Lösungen

#### Webhooks werden nicht empfangen

**Symptome:**
- Extension Instance wird erstellt, aber DB bleibt leer
- Keine Logs in der Console

**Lösungen:**

✅ **Prüfe die Webhook URL im mStudio**:
- Muss auf `/api/webhooks/mittwald` enden
- Das zrok Token muss mit der im zrok Prozess übereinstimmen
- Muss öffentlich erreichbar sein (teste mit `curl`)

✅ **Prüfe Tunnel (zrok/ngrok)**:
```bash
# zrok sollte laufen
ps aux | grep zrok
```

✅ **Warte retry des Webhooks ab**:
- Webhooks werden mit einem exponentiellen Backoff mit einem maximalen Backoff von 5 Minuten erneut versucht.
- Falls der Webhook aufgrund eines anderen Fehlers (bspw. weil vergessen wurde, zrok zu starten) nicht ankam, wird der Webhook erneut versucht zu verschicken.

#### Datenbank-Verbindung schlägt fehl

**Symptome:**
- `ECONNREFUSED` Fehler
- Extension startet nicht

**Lösungen:**

✅ **Prüfe, ob PostgreSQL läuft**:
```bash
# Docker Container Status prüfen
docker ps

# Sollte einen laufenden Container zeigen
```

✅ **Prüfe .env Konfiguration**:
```bash
# Der Port in der .env Datei sollte mit dem Port in der docker-compose.yml übereinstimmen
POSTGRES_PORT=5433

# Host sollte localhost sein
POSTGRES_HOST=localhost
```

✅ **Prüfe Docker Logs**:
```bash
docker logs <postgres-container-id>

# Sollte "database system is ready to accept connections" zeigen
```

✅ **Starte Datenbank neu**:
```bash
pnpm run docker:dev:down
pnpm run docker:dev
pnpm run db:push
```

#### 403 Permission Denied bei API-Calls an das mStudio

**Symptome:**
- `PermissionsInsufficientError` wird geworfen
- mStudio API-Calls geben 403 Fehler zurück.

**Lösungen:**

✅ **Prüfe Scopes in der Extension Verwaltung**:
- Für diese Extension müssen die Scopes `project:read`, `project:write`, `user:read` angefragt werden
- Falls du diese Extension als Basis für eine eigene Extension nutzt, findet du im [Developer Portal](https://developer.mittwald.de/de/docs/v2/contribution/overview/concepts/scopes/) eine Anleitung, wie du herausfindest, welche Scopes du benötigst.

#### `Could not establish remote connection: Timeout reached`

**Symptome:**
- Die Extension wurde mit `pnpm run dev` lokal gestartet
- Die Extension lädt nicht im mStudio
- In der Developer Console des Browsers erscheint `Could not establish remote connection: Timout reached`
- Du verwendest den Chrome Browser

**Lösungen:**

✅ **Verwende den Firefox browser (oder Ähnliche)**:
- Wir haben festgestellt, dass Chrome, Arc oder andere Browser, die auf Chromium basieren, Websocket Verbindungen mit localhost ablehnen.
- Dies ist nur bei lokaler Entwicklung zu beobachten, produktive Umgebungen über https sind davon nicht betroffen.
- Firefox, Zen etc. haben sich in diesen Situationen bewährt.

### Hilfe erhalten

Falls du nicht weiterkommst:

1. **Dokumentation durchsuchen**: [developer.mittwald.de](https://developer.mittwald.de/de/docs/v2/contribution/)
2. **GitHub Issues**: Prüfe die [Issues](https://github.com/mittwald/reference-extension/issues) dieses Repositories
3. **mittwald Support**: Kontaktiere den mittwald Support für Account-bezogene Probleme

## ✅ Was kann mit diesem Extension-Template umgesetzt werden?

Diese Extension-Template ist ideal für **project-basierte Extensions mit UI-Komponenten**.
Dennoch kann die Extension mit geringem Aufwand auch auf eine Organisationsextension umgebaut werden.

Außerdem zeigt dieses Projekt wie Extensions mit einem Frontend Fragment aussehen.
Extensions können auch externe Frontends implementieren, diese sind hier jedoch out of scope.

### ✅ Geeignet für:

- **Extensions als Teil des mStudio**: Extensions, die sich anfühlen sollen, als wären sie Core Features des mStudio
- **CRUD-Operationen auf mStudio-Ressourcen**: Lesen und Schreiben von Project-, User-, oder anderen mStudio-Daten
- **Extension-eigene Datenbanken**: Speicherung von Custom-Daten außerhalb des mStudio
- **Formulare und Interaktionen**: User-Input sammeln, validieren und verarbeiten
- **Dashboards und Visualisierungen**: Bereite Daten aus dem mStudio auf, biete eigene Übersichten, generiere Wissen auf Basis der mStudio Daten
- **Custom Workflows**: Implementiere Workflows, angepasst auf konkrete Anwendungsfälle und Prozesse
- **Integration mit Drittanbietern**: Integriere dein eigenes Produkt und platziere es auf dem mStudio Marktplatz, um deine Reichweite zu steigern

### ❌ Nicht geeignet für:

Diese Architektur ist grundsätzlich sehr für eine Extension zugeschnitten, die sich anfühlen soll, als wäre sie ein Core Feature des mStudio.
Entsprechend sind folgende Einschränkungen eher zu lesen als "mit mehr Aufwand verbunden".

- **Eigene Authentifizierungsmechanismen**: Diese Architektur ist nicht darauf ausgelegt, eigene Benutzer zu verwalten und einen eigenen Login zu bieten.
- **Externe Frontends**: Die verwendeten Remote Components können nicht außerhalb des mStudio gerendert werden.
- **Hintergrund Aktivitäten**: Diese Extension speichert kein Extension Secret und bietet keine Mechanismen, Prozesse ohne Nutzerinteraktion abzubilden.

### Konkrete Anwendungsbeispiele:

Mit dieser Template könntest du beispielsweise folgende Extensions bauen:

1. **Issue Tracker**: Bugs und Feature Requests zu einem Projekt verwalten
2. **Deployment Log**: Deployment-History anzeigen und Rollbacks auslösen
3. **Analytics Dashboard**: Custom Analytics für Projekte (z.B. API-Usage, Performance-Metriken)
4. **Team Notes**: Projekt-bezogene Notizen und Dokumentation
5. **Integration Hub**: Verbindungen zu externen Services (GitHub, Jira, etc.) verwalten

## 📚 Weiterführende Ressourcen

### Offizielle Dokumentation

- **[mittwald Developer Portal](https://developer.mittwald.de/de/docs/v2/contribution/)**: Einstieg in die Extension-Entwicklung
- **[API Referenz](https://developer.mittwald.de/docs/v2/api/intro/)**: Vollständige mittwald API v2 Dokumentation
- **[Scopes Dokumentation](https://developer.mittwald.de/de/docs/v2/contribution/overview/concepts/scopes/)**: Berechtigungssystem verstehen
- **[Frontend Development](https://developer.mittwald.de/de/docs/v2/contribution/overview/concepts/frontend-development/)**: Frontend Fragments und Remote DOM
- **[Lifecycle Webhooks](https://developer.mittwald.de/de/docs/v2/contribution/overview/concepts/lifecycle-webhooks/)**: Webhook-Events verstehen

### Verwendete Libraries

- **[TanStack Start](https://tanstack.com/start)**: Full-stack React Framework
- **[TanStack Router](https://tanstack.com/router)**: Type-safe Routing
- **[TanStack Query](https://tanstack.com/query)**: Server State Management
- **[Drizzle ORM](https://orm.drizzle.team/)**: TypeScript ORM
- **[Flow Design System](https://flow.mittwald.de/)**: mittwald Design System
- **[Zod](https://zod.dev/)**: Schema Validation
- **[mitthooks](https://github.com/weissaufschwarz/mitthooks)**: Einfaches Bootstrapping von Lifecycle Webhooks
- **[react-ghostmaker](https://github.com/mittwald/react-ghostmaker)**: Suspense-ready Wrapper um Tanstack Query und Domain Models

### Hilfreiche Tools

- **[zrok](https://zrok.io/)**: Tunneling für lokales Webhook-Testing
- **[Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview)**: Datenbank-UI
- **[Biome](https://biomejs.dev/)**: Linter und Formatter

### Support

- **GitHub Issues**: [github.com/mittwald/reference-extension/issues](https://github.com/mittwald/reference-extension/issues)
- **mittwald Support**: support@mittwald.de

---

**Viel Erfolg beim Entwickeln deiner ersten mittwald Extension!** 🚀

Wenn du Fragen hast oder Verbesserungsvorschläge für diese Dokumentation, öffne gerne ein Issue oder Pull Request.
