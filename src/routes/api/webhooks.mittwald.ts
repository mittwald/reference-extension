import { createFileRoute } from "@tanstack/react-router";
import { CombinedWebhookHandlerFactory } from "@weissaufschwarz/mitthooks/factory/combined";
import { PgExtensionStorage } from "@weissaufschwarz/mitthooks-drizzle/index";
import { getDatabase } from "@/db";
import { extensionInstances } from "@/db/schema.ts";
import { getEnvironmentVariables } from "@/env.ts";
import { handleWebhookRequest } from "@/middleware/webhook-authentication.ts";

const db = getDatabase();

export const Route = createFileRoute("/api/webhooks/mittwald")({
    server: {
        handlers: {
            POST: async ({ request }) => {
                const env = getEnvironmentVariables();

                const combinedHandlerFactory =
                    new CombinedWebhookHandlerFactory(
                        new PgExtensionStorage(db, extensionInstances),
                        env.EXTENSION_ID,
                    );

                if (env.MITTWALD_API_BASE_URL) {
                    combinedHandlerFactory.withoutWebhookSignatureVerification();
                }

                const combinedHandler = combinedHandlerFactory.build();

                return handleWebhookRequest(request, combinedHandler);
            },
        },
    },
});
