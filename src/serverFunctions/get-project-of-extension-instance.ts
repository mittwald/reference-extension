import { createServerFn } from "@tanstack/react-start";
import { getProject } from "@/domain/project.ts";
import { authenticationMiddlewareWithAccessToken } from "@/middleware/auth.ts";

export const getProjectOfExtensionInstanceServerFunction = createServerFn({
    method: "GET",
})
    .middleware([authenticationMiddlewareWithAccessToken])
    .handler(async ({ context: { mittwaldClient, contextId } }) => {
        return getProject(mittwaldClient, contextId);
    });
