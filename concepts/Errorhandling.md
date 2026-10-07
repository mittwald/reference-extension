# Error Handling

Die Extension implementiert ein robustes, mehrschichtiges Error-Handling-System.
Dieses ist nur ein Vorschlag und nicht zwingend erforderlich.
Dennoch nimmt es dem Entwickler einer Extension sehr viel Arbeit bei diesem kritischen Thema ab.

## Fehler-Architektur

1. Domain Layer: Business-Logik wirft typisierte PublicError oder reguläre JavaScript Errors
2. Middleware Layer: Middleware fängt Fehler und wirft einen Error mit serialisiertem öffentlichen Fehlerkörper
3. Server Function Layer: TanStack Start transportiert den geworfenen Fehler zum Client; das Promise wird abgelehnt
4. Client Layer: UI-Komponenten dem User die Fehler an

## Fehler-Typen

Die Extension definiert eine eigene Fehler-Klasse in [`src/global-errors.ts`](src/global-errors.ts):

```typescript
export abstract class PublicError extends Error {
    public readonly isRetryable: boolean;
    public readonly statusCode: number;
    public readonly cause?: Error;
    public readonly details?: PublicErrorDetails;

    protected constructor(
        message: string,
        isRetryable: boolean = false,
        statusCode: number = 500,
        cause?: Error,
        details?: PublicErrorDetails,
    ) {
        super(message);
        this.name = this.constructor.name;
        this.isRetryable = isRetryable;
        this.statusCode = statusCode;
        this.cause = cause;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}
```

Die `cause`-Property wird für das serverseitige Logging verwendet und nicht an das Frontend weitergegeben.
Die `isRetryable`-Property steuert, ob im Frontend die Möglichkeit geboten wird, die Route erneut aufzurufen.

`statusCode` ist eine Eigenschaft des fachlichen Fehlers. Die aktuelle Serverfunktions-Middleware setzt damit jedoch keinen HTTP-Status und überträgt diesen Wert auch nicht im öffentlichen Fehlerkörper. Ein fachlicher `403` bedeutet deshalb nicht, dass die Serverfunktion mit HTTP `403` antwortet; den HTTP-Transport übernimmt TanStack Start.

Fehler, die transparent an das Frontend weitergegeben werden sollen, können von dieser Klasse erben.

```typescript
// Beispiel: Fehlende Berechtigungen
export class PermissionsInsufficientError extends PublicError {
    public constructor(extensionInstanceId: string) {
        super(
            "Du hast nicht ausreichend Berechtigungen für diese Operation.",
            false,
            403,
            undefined,
            { extensionInstanceId },
        );
    }
}
```

## Server-seitiges Error Handling

Die `handleServerErrors` Middleware in [`src/middleware/error-handling.ts`](src/middleware/error-handling.ts) fängt alle Fehler:

```typescript
export const handleServerErrors = createMiddleware({
    type: "function",
}).server(async ({ next }) => {
    try {
        return await next();
    } catch (error) {
        console.error("Server function error occured:", error);

        // Zod Validierungsfehler
        const validationIssues = parseZodValidationError(error);
        if (validationIssues) {
            throw buildValidationError(validationIssues);
        }

        // Bekannte PublicError
        if (error instanceof PublicError) {
            throw buildPublicError(error);
        }

        // Unbekannter Fehler
        throw buildUnknownError();
    }
});
```

Die Hilfsfunktionen erzeugen jeweils `new Error(JSON.stringify(errorBody))`, den die Middleware wirft. Der öffentliche Fehlerkörper enthält `type`, `message`, `isRetryable` und `details`. Bei `PublicError` werden diese Informationen aus dem fachlichen Fehler übernommen; technische Ursachen und Stacktraces bleiben im Serverlog.

Eine zurückgegebene `Response.json(...)` mit Fehlerstatus reicht hier nicht aus: Der Client-Transport kann sie als erfolgreiches Ergebnis behandeln, sodass ein Formular seinen Erfolgspfad ausführt. Nur der geworfene Fehler führt zum abgelehnten Promise. Der Client liest mit `parsePublicError` den JSON-Fehlerkörper aus `Error.message` und validiert ihn gegen `errorBodySchema`.

Fehler, die durch die Zod Schema Validierung geworfen werden, werden ebenfalls durchgereicht.
Dazu wird im Bootstrapping dieser Extension in der [`src/start.ts`](src/start.ts) die Sprache auf Deutsch gestellt

```typescript
z.config(z.locales.de());
```

Um dem Frontend zu ermöglichen, Validierungsfehler an Formfeldern darzustellen, enthält der serialisierte Fehlerkörper folgende Properties:

```typescript
{
    "type": "ValidationError",
    "message": firstIssue.message,
    "isRetryable": false,
    "details": {
        "affectedField": firstIssue.path[0],
    }
}
```

Andere Fehler, insbesondere reguläre JavaScript `Errors`, werden als `UnknownError` mit der Meldung „Ein unerwarteter Fehler ist aufgetreten“, `isRetryable: false` und leeren `details` weitergegeben. Die Middleware setzt dafür keinen eigenen HTTP-Status. Die Regression für diesen Fehlertransport ist in `src/middleware/error-handling.test.ts` abgesichert.

## Client-seitiges Error Handling

### bei Forms

React-Komponenten nutzen den `useFormErrorHandling` Hook in [`src/hooks/useFormErrorHandling.tsx`](src/hooks/useFormErrorHandling.tsx):

```tsx
const [RootError, submitWithErrorHandling] = useFormErrorHandling(
    form,
    async (values) => {
        await editProjectDescriptionServerFunction({
            data: { projectDescription: values.projectDescription },
        });
    },
);
```

Dieser hook nimmt einen Submit-Handler entgegen und wrappt diesen mit dem clientseitigen Error-Handling.
Der gewrappte Submit-Handler kann dann in die Form gegeben werden.
Außerdem kann der `RootError` an geeigneter Stelle in der Form platziert werden.
Meist bietet es sich an, den Fehler über der `ActionGroup` der Form zu platzieren.

```tsx
return (
    <Form form={form} onSubmit={submitWithErrorHandling}>
        {/*...*/}
        <RootError />
        <ActionGroup>
            {/*...*/}
        </ActionGroup>
    </Form>
)
```

### per Hook

Wenn bspw. Server Functions, die in hooks ausgeführt werden, Fehler zurückgeben, wird der Fehler geworfen.
Um diese Fehler abzufangen, kann die entsprechende Komponente mit einer `ErrorBoundary` umgeben werden.
Der eigentliche Inhalt wird dann durch den definierten Fallback ersetzt.

```tsx
<ErrorBoundary FallbackComponent={ErrorFallback}>
    <ProjectForm />
</ErrorBoundary>
```

### bei asynchronen Funktionen

Fehler, die in asynchronen Funktionen geworfen werden, werden nicht automatisch durch die ErrorBoundary aufgefangen.
Um dies zu erreichen, kann der `useErrorBoundary`-Hook verwendet werden.
Dieser bietet eine Möglichkeit, Fehler an die `ErrorBoundary` zu propagieren.

```tsx
export function SomeComponent() {
    const { showBoundary } = useErrorBoundary();
    const { invalidate: invalidateComments } =
        CommentsClientGhost.getComments().useGhost();


    const resetComments = async () => {
        try {
            await CommentsClientGhost.deleteComments();
            void invalidateComments();
        } catch (error) {
            showBoundary(error);
        }
    };
    return (
        {/*...*/}
    )
}
```

## Best Practices

### Keine technischen Fehler an das Frontend geben

Fehler, die auf die technische Implementierung hinweisen, sollten nicht an das Frontend durchgereicht werden,
um das Nutzererlebnis zu verbessern.
Stattdessen sollten sie in fachliche Fehler in Form von `PublicError`-Klassen übersetzt werden.

### Fehlerlogging

Die Extension loggt bereits alle aufkommenden Fehler samt originalem Stacktrace.
Falls weitere Informationen zur Fehlerbehandlung sinnvoll sind, kann das Logging ergänzt werden.

### Alerting

Es ist dringend zu empfehlen, Fehler in ein zentrales Alerting System zu überführen.
Bspw. können Tools wie Sentry genutzt werden, um aufkommende Fehler zentral zu melden.

### Error Boundaries

Error Boundaries sollten so platziert werden, dass die Extension bei Fehlern nicht komplett ausfällt,
sondern nur betroffene Features.
Gleichzeitig sollten sie nicht zu inflationär verwendet werden, um die Oberfläche mit Fehlermeldungen zu überladen.

