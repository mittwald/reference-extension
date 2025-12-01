# Datenzugriff auf das mStudio (mittwald API)

Die Extension nutzt den `@mittwald/api-client`, um Daten aus der mittwald API abzurufen.
Der Client wird mit einem **Access Token** authentifiziert, das aus dem **Session Token** generiert wird.

## Authentifizierungs-Flow

1. User öffnet Extension im mStudio
2. mStudio sendet Session Token an Extension (via ext-bridge)
3. Extension verifiziert Session Token
4. Extension generiert Access Token mit Extension Secret
5. Extension nutzt Access Token für API-Calls

Mehr Informationen zum Authentifizierungskonzept von Frontend Fragmenten ist in der [Dokumentation](https://developer.mittwald.de/de/docs/v2/contribution/overview/concepts/frontend-development/#authentifizierung-und-sitzungsverwaltung-mit-session-tokens) zu finden.

### Implementierung

Die Authentifizierung erfolgt über eine Middleware in `src/middleware/auth.ts`.
Somit muss in der Domänenlogik keine Rücksicht mehr auf die Authentifizierung genommen werden.
Es kann davon ausgegangen werden, dass die Session verifiziert ist
und bei Bedarf das Access Token oder ein authentifizierter API-Client verwendet werden.

```typescript
export const authenticationMiddlewareWithAccessToken = createMiddleware({
    type: "function",
})
    .client(async ({ next }) => {
        // Client-Seite: Session Token vom mStudio abrufen
        const token = await getSessionToken();
        return next({
            headers: { "x-session-token": token },
        });
    })
    .server(async ({ next }) => {
        // Server-Seite: Session Token verifizieren und Access Token generieren
        const sessionToken = getRequestHeader("x-session-token");
        const verifiedSessionToken = await verify(sessionToken);

        const accessToken = await getAccessToken(
            sessionToken,
            extensionSecret
        );

        const mittwaldClient = MittwaldAPIV2Client.newWithToken(
            accessToken.publicToken,
        );

        return next({
            context: {
                mittwaldClient,
                contextId: verifiedSessionToken.contextId,
                extensionInstanceId: verifiedSessionToken.extensionInstanceId,
                userId: verifiedSessionToken.userId,
            },
        });
    });
```

### API-Calls ausführen

Server Functions nutzen die Middleware und haben Zugriff auf den `mittwaldClient`:

```typescript
// src/serverFunctions/get-project-of-extension-instance.ts
export const getProjectOfExtensionInstanceServerFunction = createServerFn({
    method: "GET",
})
    .middleware([authenticationMiddlewareWithAccessToken])
    .handler(
        async ({
            context: { mittwaldClient, extensionInstanceId, contextId },
        }) => {
            return getProject(mittwaldClient, extensionInstanceId, contextId);
        },
    );
```

Neben dem authentifizierten mittwaldClient und dem Access Token sind so auch die [Informationen aus dem Session Token](https://developer.mittwald.de/de/docs/v2/contribution/how-to/develop-frontend-fragment/#session-token-payload) zugänglich.
In diesem Fall wird bspw. die `extensionInstanceId` verwendet, um automatisch eine Mandantenfähigkeit herzustellen.

Die eigentliche API-Logik ist in `src/domain/project.ts` gekapselt:

```typescript
export async function getProject(
    mittwaldClient: MittwaldAPIV2Client,
    extensionInstanceId: string,
    projectId: string,
): Promise<ProjectProject> {
    const response = await mittwaldClient.project.getProject({ projectId });

    // Fehlerbehandlung für fehlende Scopes
    // Diese Sonderbehandlung ist hilfreich bei der Entwicklung, aber nicht unbedingt notwendig,
    // da es sich nicht um einen für den User relevanten Fehler handelt
    if (response.status === 403) {
        throw new PermissionsInsufficientError(extensionInstanceId);
    }

    assertStatus(response, 200);
    return response.data;
}
```

### Zugriff aus dem Frontend

Für eine angenehme Nutzung im Frontend wird die Library [`@mittwald/react-ghostmaker`](https://github.com/mittwald/react-ghostmaker) verwendet.
Diese ermöglicht es, Objekte und Klassen zu proxien und APIs anzubieten, die mit Tanstack-Query und react Suspense gut harmonieren.

In `src/ghosts.ts` findet sich ein Beispiel für die Erstellung eines Ghosts:

```typescript
const projectClient = {
    getProjectOfExtensionInstance: getProjectOfExtensionInstanceServerFunction,
    editProjectDescription: editProjectDescriptionServerFunction,
};

export const ProjectClientGhost = makeGhost(projectClient);
```

Dieser Ghost kann nun verwendet werden, um im Frontend die Server Functions zu verwenden und automatisch Fehler zu werfen bzw. Loading States abzubilden.

```typescript
// Um direkt eine Möglichkeit zu erhalten, die Daten zu invalidieren
export const SomeFunctionComponent = () => {
    const project = ProjectClientGhost.getProjectOfExtensionInstance().use();

    return (
      ...
    )
}
```

Erst mit dem `use()` werden tatsächlich Daten abgerufen.
Die Grundregel sollte sein, Daten genau da abzurufen, wo sie benötigt werden.
Bei komplexeren Anwendungen wäre auch eine Nutzung von domain models eine Option.

Die Komponente kann nun mit einem Suspense umgeben werden, um während des Ladens die Applikation responsiv zu halten.

```tsx
<Suspense fallback={<SkeletonText />}>
    <SomeFunctionComponent />
</Suspense>

```

Weitere Informationen über die Nutzung von `react-ghostmaker` können der [Dokumentation](https://github.com/mittwald/react-ghostmaker) entnommen werden.
