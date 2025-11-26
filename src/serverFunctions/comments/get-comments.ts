import { createServerFn } from "@tanstack/react-start";
import { DrizzleCommentStorage } from "@/domain/comments/comments.ts";
import { authenticationMiddlewareWithAccessToken } from "@/middleware/auth.ts";

export const getCommentsForExtensionInstanceServerFunction = createServerFn({
    method: "GET",
})
    .middleware([authenticationMiddlewareWithAccessToken])
    .handler(async ({ context: { extensionInstanceId } }) => {
        const storage = new DrizzleCommentStorage();
        return await storage.getComments(extensionInstanceId);
    });
