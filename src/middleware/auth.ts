import { MittwaldAPIV2Client } from "@mittwald/api-client";
import { getSessionToken } from "@mittwald/ext-bridge/browser";
import { getAccessToken, verify } from "@mittwald/ext-bridge/node";
import {
    createMiddleware,
    type FunctionMiddlewareClientFn,
} from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { getEnvironmentVariables } from "../env";

type VerifiedSessionToken = Awaited<ReturnType<typeof verify>>;
type MittwaldClient = ReturnType<typeof MittwaldAPIV2Client.newWithToken>;
type AccessToken = { publicToken: string };
type SessionTokenClientMiddleware = FunctionMiddlewareClientFn<
    Record<never, never>,
    unknown,
    undefined,
    undefined,
    undefined
>;

const sessionTokenHeader = "x-session-token";
const mockSessionToken = "MOCK";
const mockVerifiedSessionToken = {
    sessionId: "mock-session-id",
    userId: "MOCK_USER_ID",
    extensionId: "mock-extension-id",
    extensionInstanceId: "MOCK_EXTENSION_INSTANCE_ID",
    contextId: "MOCK_CONTEXT_ID",
    context: "project",
    scopes: [],
    authenticatableWithoutSecret: true,
    publicKeySerial: "mock-public-key-serial",
} satisfies VerifiedSessionToken;

const forwardSessionToken: SessionTokenClientMiddleware = async ({ next }) => {
    const token = await getSessionToken();

    return next({
        headers: { [sessionTokenHeader]: token },
    });
};

const forwardMockSessionToken: SessionTokenClientMiddleware = ({ next }) => {
    return next({
        headers: { [sessionTokenHeader]: mockSessionToken },
    });
};

const forwardConfiguredSessionToken = import.meta.env.MITTWALD_API_BASE_URL
    ? forwardMockSessionToken
    : forwardSessionToken;

async function getVerifiedSessionToken(): Promise<
    [VerifiedSessionToken, string]
> {
    const env = getEnvironmentVariables();
    if (env.MITTWALD_API_BASE_URL) {
        return [mockVerifiedSessionToken, mockSessionToken];
    }

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
    .client(forwardConfiguredSessionToken)
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
    .client(forwardConfiguredSessionToken)
    .server(async ({ next }) => {
        const [verifiedSessionToken, sessionToken] =
            await getVerifiedSessionToken();

        const env = getEnvironmentVariables();
        const extensionSecret = env.EXTENSION_SECRET;

        let mittwaldClient: MittwaldClient;
        let accessToken: AccessToken;
        if (env.MITTWALD_API_BASE_URL) {
            accessToken = { publicToken: sessionToken + extensionSecret };
            mittwaldClient = MittwaldAPIV2Client.newWithToken(
                accessToken.publicToken,
            );
            mittwaldClient.axios.defaults.baseURL = env.MITTWALD_API_BASE_URL;
        } else {
            accessToken = await getAccessToken(sessionToken, extensionSecret);
            mittwaldClient = MittwaldAPIV2Client.newWithToken(
                accessToken.publicToken,
            );
        }

        return next({
            context: {
                contextId: verifiedSessionToken.contextId,
                extensionInstanceId: verifiedSessionToken.extensionInstanceId,
                userId: verifiedSessionToken.userId,
                accessToken: accessToken.publicToken,
                mittwaldClient,
            },
        });
    });
