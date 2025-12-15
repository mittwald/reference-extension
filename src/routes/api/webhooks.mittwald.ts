import {createFileRoute} from "@tanstack/react-router";
import {
    CombinedWebhookHandlerFactory,
} from "@weissaufschwarz/mitthooks/factory/combined";
import {HttpWebhookHandler,} from "@weissaufschwarz/mitthooks/index";
import {getDatabase} from "@/db";
import {extensionInstances} from "@/db/schema.ts";
import {getEnvironmentVariables} from "@/env.ts";
import {PgExtensionStorage} from "@weissaufschwarz/mitthooks-drizzle/index";

const db = getDatabase();

export const Route = createFileRoute("/api/webhooks/mittwald")({
    server: {
        handlers: {
            POST: async ({ request }) => {
                const env = getEnvironmentVariables();

                const combinedHandler = new CombinedWebhookHandlerFactory(
                    new PgExtensionStorage(db, extensionInstances),
                    env.EXTENSION_ID,
                ).build();

                const httpHandler = new HttpWebhookHandler(combinedHandler)
                return httpHandler.handleWebhook(request)
            },
        },
    },
});
