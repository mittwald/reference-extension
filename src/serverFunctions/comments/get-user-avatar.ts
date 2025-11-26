import { createServerFn } from "@tanstack/react-start";
import { getUserAvatar } from "@/domain/comments/user.ts";
import { authenticationMiddlewareWithAccessToken } from "@/middleware/auth.ts";

export const getUserAvatarServerFunction = createServerFn({
    method: "GET",
})
    .middleware([authenticationMiddlewareWithAccessToken])
    .handler(async ({ context: { userId, mittwaldClient } }) => {
        return await getUserAvatar(mittwaldClient, userId);
    });
