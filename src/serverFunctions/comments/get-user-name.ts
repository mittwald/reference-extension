import { createServerFn } from "@tanstack/react-start";
import { getUserName } from "@/domain/comments/user.ts";
import { authenticationMiddlewareWithAccessToken } from "@/middleware/auth.ts";

export const getUserNameServerFunction = createServerFn({
    method: "GET",
})
    .middleware([authenticationMiddlewareWithAccessToken])
    .handler(async ({ context: { userId, mittwaldClient } }) => {
        return await getUserName(mittwaldClient, userId);
    });
