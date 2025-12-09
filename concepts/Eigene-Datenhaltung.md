# Eigene Datenhaltung außerhalb des mStudio

## Warum eine eigene Datenbank?

Manche Daten gehören nicht in das mStudio, sondern sind spezifisch für deine Extension:
- User-generierter Content (z.B. Kommentare)
- Extension-spezifische Konfigurationen
- Cache oder abgeleitete Daten

## Datenbank-Setup

Die Extension nutzt eine [PostgreSQL Datenbank](https://www.postgresql.org/) und das [Drizzle ORM](https://orm.drizzle.team/).
Das Schema ist in [`src/db/schema.ts`](src/db/schema.ts) definiert:

```typescript
// Extension Instances (aus Webhooks)
export const extensionInstances = pgTable("extension_instance", {
    id: varchar("id", { length: 36 }).primaryKey(),
    contextId: varchar({ length: 36 }).notNull(),
    context: context().notNull().default("project"),
    active: boolean().notNull(),
    consentedScopes: text("consented_scopes").array().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().$onUpdate(() => new Date()).notNull(),
});

// Custom Daten (Kommentare)
export const comments = pgTable("comments", {
    id: varchar({ length: 36 }).primaryKey(),
    extensionInstanceId: varchar({ length: 36 })
        .notNull()
        .references(() => extensionInstances.id),
    userId: varchar({ length: 36 }).notNull(),
    text: text().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
});
```

Schemas können auch auf mehrere Dateien aufgeteilt werden, müssen jedoch in einer zentralen Datei reexportiert werden,
um in der `drizzle.config.ts` referenziert werden zu können.

Diese Datei wird unter anderem für die package Skripte benötigt, wie bspw. das Starten des [Drizzle Studio](#drizzle-studio).

## Datenbank-Zugriff

Der Drizzle Client wird in [`src/db/index.ts`](src/db/index.ts) konfiguriert:

```typescript
export const getDatabase = () => {
    const env = getEnvironmentVariables();

    const pool = new Pool({
        user: env.POSTGRES_USER,
        password: env.POSTGRES_PASSWORD,
        database: env.POSTGRES_DB,
        host: env.POSTGRES_HOST,
        port: env.POSTGRES_PORT,
        ssl: env.POSTGRES_USE_SSL ? { rejectUnauthorized: false } : false,
    });

    return drizzle(pool, { schema });
};
```

Die verwendeten Parameter stammen entweder aus Umgebungsvariablen oder der `.env` Datei.

## CRUD-Operationen

Beispiel: Kommentare abrufen ([`src/domain/comments/comments.ts`](src/domain/comments/comments.ts)):

```typescript
export class DrizzleCommentStorage {
    public async getComments(extensionInstanceId: string): Promise<Comment[]> {
        return getDatabase()
            .select()
            .from(comments)
            .where(eq(comments.extensionInstanceId, extensionInstanceId))
            .orderBy(asc(comments.createdAt));
    }
}
```

Für weitere Informationen zur Funktionsweise von Drizzle empfehlen wir die [Drizzle Dokumentation](https://orm.drizzle.team/docs/get-started)

## Migrationen

Drizzle kann Schema-Änderungen in SQL-Migrationen umwandeln:

```bash
# Schema-Änderungen generieren
pnpm run db:generate-migrations

# Migrationen anwenden
pnpm run db:migrate

# Oder direkt pushen (für Entwicklung)
pnpm run db:push
```

## Drizzle Studio

Zum Inspizieren der Datenbank während der Entwicklung kann eine graphische Oberfläche gestartet werden.
Dazu muss das folgende Skript ausgeführt werden:

```bash
pnpm run db:studio
```

In der Konsole wird die die URL angezeigt, mit der auf die graphische Oberfläche zugegriffen werden kann.

## Best Practices

### Extension Instance ID als Foreign Key

Verknüpfe die Daten des Kunden per Foreign Key mit der Extension Instance.
Das erleichtert das datenschutzkonforme Löschen der Daten über Cascading ungemein.

### Verwende die Extension Instance ID als Mandanten ID in Queries

Verwende in Queries stets die Extension Instance ID als Mandanten ID, um die Sicherheit durch die höhere Isolierung der Daten zu erhöhen.
Die Extension Instance ID wird über das Session Token automatisch in Server Functions bereitgestellt.
Insofern wird die Nutzung über das Frontend dadurch nicht beeinflusst.
