import { createServerFn } from "@tanstack/react-start";
import { DrizzleCommentStorage } from "@/domain/comments/comments";
import { authenticationMiddlewareWithAccessToken } from "@/middleware/auth.ts";

export const deleteCommentsServerFunction = createServerFn({
    method: "POST",
})
    .middleware([authenticationMiddlewareWithAccessToken])
    .handler(async ({ context: { extensionInstanceId } }) => {
        const storage = new DrizzleCommentStorage();
        await storage.deleteCommentsForExtensionInstance(extensionInstanceId);
    });
