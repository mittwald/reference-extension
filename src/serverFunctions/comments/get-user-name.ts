import { createServerFn } from "@tanstack/react-start";
import { authenticationMiddlewareWithAccessToken } from "@/middleware/auth.ts";
import { getUserName } from "../../domain/comments/user";

export const getUserNameServerFunction = createServerFn({
    method: "GET",
})
    .middleware([authenticationMiddlewareWithAccessToken])
    .handler(async ({ context: { userId, mittwaldClient } }) => {
        return await getUserName(mittwaldClient, userId);
    });
