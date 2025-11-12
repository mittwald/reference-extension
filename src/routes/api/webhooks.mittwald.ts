import { createFileRoute } from "@tanstack/react-router";
import { CombinedWebhookHandlerFactory } from "@weissaufschwarz/mitthooks/factory/combined";
import type {
    ExtensionStorage,
    ExtensionToBeAdded,
    ExtensionToBeUpdated,
} from "@weissaufschwarz/mitthooks/storage/extensionStorage";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { getDatabase } from "@/db";
import { extensionInstances } from "@/db/schema";
import { getEnvironmentVariables } from "@/env.ts";

class DrizzleExtensionStorage implements ExtensionStorage {
    public async upsertExtension(extension: ExtensionToBeAdded): Promise<void> {
        try {
            await getDatabase()
                .insert(extensionInstances)
                .values({
                    id: extension.extensionInstanceId,
                    contextId: extension.contextId,
                    context: "project",
                    active: true,
                    consentedScopes: extension.consentedScopes,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .onConflictDoUpdate({
                    target: extensionInstances.id,
                    set: {
                        contextId: extension.contextId,
                        updatedAt: new Date(),
                        context: "project",
                        active: true,
                    },
                });
        } catch (error) {
            console.error("Error upserting extension:", error);
            throw new Error("Failed to upsert extension instance");
        }
    }

    public async updateExtension(
        extension: ExtensionToBeUpdated,
    ): Promise<void> {
        try {
            await getDatabase()
                .update(extensionInstances)
                .set({
                    contextId: extension.contextId,
                    updatedAt: new Date(),
                    context: "project",
                    active: extension.enabled,
                    consentedScopes: extension.consentedScopes,
                })
                .where(
                    eq(extensionInstances.id, extension.extensionInstanceId),
                );
        } catch (error) {
            console.error("Error updating extension:", error);
            throw new Error("Failed to update extension instance");
        }
    }

    public rotateSecret(): void {
        return;
    }

    public async removeInstance(extensionInstanceId: string): Promise<void> {
        try {
            await getDatabase()
                .delete(extensionInstances)
                .where(eq(extensionInstances.id, extensionInstanceId));
        } catch (error) {
            console.error("Error removing extension instance:", error);
            throw new Error("Failed to remove extension instance");
        }
    }
}

export const Route = createFileRoute("/api/webhooks/mittwald")({
    server: {
        handlers: {
            POST: async ({ request }) => {
                const env = getEnvironmentVariables();

                const combinedHandler = new CombinedWebhookHandlerFactory(
                    new DrizzleExtensionStorage(),
                    env.EXTENSION_ID,
                ).build();

                try {
                    const rawBody = await request.text();
                    const signatureSerial =
                        request.headers.get("X-Marketplace-Signature-Serial") ||
                        "";
                    const signatureAlgorithm =
                        request.headers.get(
                            "X-Marketplace-Signature-Algorithm",
                        ) || "";
                    const signature =
                        request.headers.get("X-Marketplace-Signature") || "";

                    const webhookContent = {
                        rawBody,
                        signatureSerial,
                        signatureAlgorithm,
                        signature,
                    };

                    await combinedHandler(webhookContent);
                } catch (e) {
                    console.error("Error while handling webhook", e);

                    return new Response("Error handling webhook", {
                        status: 400,
                        statusText: "Internal Server Error",
                    });
                }

                return new Response("Webhook handled successfully", {
                    status: 200,
                });
            },
        },
    },
});
