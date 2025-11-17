import { createServerFn } from "@tanstack/react-start";
import { z } from "zod/v4";
import { DrizzleCommentStorage } from "@/domain/comments/comments";
import { authenticationMiddlewareWithAccessToken } from "@/middleware/auth.ts";

export const addCommentInputSchema = z.object({
    text: z.string(),
});

export const addCommentServerFunction = createServerFn({
    method: "POST",
})
    .middleware([authenticationMiddlewareWithAccessToken])
    .inputValidator(addCommentInputSchema)
    .handler(async ({ context: { extensionInstanceId, userId }, data }) => {
        const storage = new DrizzleCommentStorage();
        await storage.addComment({
            userId,
            extensionInstanceId,
            text: data.text,
        });
    });
