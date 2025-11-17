import { createServerFn } from "@tanstack/react-start";
import { authenticationMiddlewareWithAccessToken } from "@/middleware/auth.ts";
import { DrizzleCommentStorage } from "../../domain/comments/comments";

export const getCommentsForExtensionInstanceServerFunction = createServerFn({
    method: "GET",
})
    .middleware([authenticationMiddlewareWithAccessToken])
    .handler(async ({ context: { extensionInstanceId } }) => {
        const storage = new DrizzleCommentStorage();
        return await storage.getComments(extensionInstanceId);
    });
