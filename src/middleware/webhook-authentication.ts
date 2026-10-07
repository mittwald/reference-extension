import type { HandleWebhook } from "@weissaufschwarz/mitthooks/handler/interface";
import {
    FailedToFetchPublicKey,
    HttpWebhookHandler,
    InvalidBodyError,
    InvalidExtensionIDError,
    InvalidSignatureError,
    MissingBodyError,
    MissingSignatureAlgorithmError,
    MissingSignatureError,
    MissingSignatureSerialError,
    UnknownSignatureAlgorithmError,
} from "@weissaufschwarz/mitthooks/index";

/**
 * Answers every failure that occurs before the payload is trusted with one
 * opaque 401. Specifics stay in the server log.
 */
export async function handleWebhookRequest(
    request: Request,
    handleWebhook: HandleWebhook,
): Promise<Response> {
    let caughtError: unknown;

    const observedHandler: HandleWebhook = async (webhookContent) => {
        try {
            await handleWebhook(webhookContent);
        } catch (error) {
            caughtError = error;
            throw error;
        }
    };

    const response = await new HttpWebhookHandler(
        observedHandler,
    ).handleWebhook(request);

    if (isAuthenticationError(caughtError)) {
        console.error("Webhook authentication failed:", caughtError);
        return new Response("Unauthorized", { status: 401 });
    }

    // Reached only once the signature was accepted.
    if (caughtError instanceof InvalidBodyError) {
        console.error("Webhook payload rejected:", caughtError);
        return new Response("Bad Request", { status: 400 });
    }

    return response;
}

function isAuthenticationError(error: unknown): boolean {
    return (
        error instanceof MissingSignatureError ||
        error instanceof MissingSignatureSerialError ||
        error instanceof MissingSignatureAlgorithmError ||
        error instanceof MissingBodyError ||
        error instanceof UnknownSignatureAlgorithmError ||
        error instanceof FailedToFetchPublicKey ||
        error instanceof InvalidSignatureError ||
        error instanceof InvalidExtensionIDError
    );
}
