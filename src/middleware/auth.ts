import { getSessionToken } from "@mittwald/ext-bridge/browser";
import { getAccessToken, verify } from "@mittwald/ext-bridge/node";
import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import type { FunctionMiddlewareClientNextFn } from "@tanstack/start-client-core";
import { getEnvironmentVariables } from "../env";

type VerifiedSessionToken = Awaited<ReturnType<typeof verify>>;

const sessionTokenHeader = "x-session-token";

async function forwardSessionToken(
    next: FunctionMiddlewareClientNextFn<object, unknown>,
) {
    const token = await getSessionToken();

    return next({
        headers: { [sessionTokenHeader]: token },
    });
}

async function getVerifiedSessionToken(): Promise<
    [VerifiedSessionToken, string]
> {
    const sessionToken = getRequestHeader(sessionTokenHeader);
    if (!sessionToken) {
        throw new Error("No session token found");
    }
    const verifiedSessionToken = await verify(sessionToken);
    return [verifiedSessionToken, sessionToken];
}

export const authenticationMiddlewareWithSessionVerification = createMiddleware(
    { type: "function" },
)
    .client(async ({ next }) => {
        return forwardSessionToken(next);
    })
    .server(async ({ next }) => {
        const [verifiedSessionToken] = await getVerifiedSessionToken();
        return next({
            context: {
                contextId: verifiedSessionToken.contextId,
                extensionInstanceId: verifiedSessionToken.extensionInstanceId,
                userId: verifiedSessionToken.userId,
            },
        });
    });

export const authenticationMiddlewareWithAccessToken = createMiddleware({
    type: "function",
})
    .client(async ({ next }) => {
        return forwardSessionToken(next);
    })
    .server(async ({ next }) => {
        const [verifiedSessionToken, sessionToken] =
            await getVerifiedSessionToken();

        const env = getEnvironmentVariables();
        const extensionSecret = env.EXTENSION_SECRET;

        const accessToken = await getAccessToken(sessionToken, extensionSecret);

        return next({
            context: {
                contextId: verifiedSessionToken.contextId,
                extensionInstanceId: verifiedSessionToken.extensionInstanceId,
                userId: verifiedSessionToken.userId,
                accessToken: accessToken.publicToken,
            },
        });
    });
