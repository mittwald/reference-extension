import { createServerFn } from "@tanstack/react-start";
import { authenticationMiddlewareWithAccessToken } from "@/middleware/auth.ts";
import { getUserAvatar } from "../../domain/comments/user";

export const getUserAvatarServerFunction = createServerFn({
    method: "GET",
})
    .middleware([authenticationMiddlewareWithAccessToken])
    .handler(async ({ context: { userId, mittwaldClient } }) => {
        return await getUserAvatar(mittwaldClient, userId);
    });
