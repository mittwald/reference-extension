import { createServerFn } from "@tanstack/react-start";
import { z } from "zod/v4";
import { editProjectDescription } from "@/domain/project.ts";
import { authenticationMiddlewareWithAccessToken } from "@/middleware/auth.ts";

export const editProjectDescriptionInputSchema = z.object({
    projectDescription: z.string(),
});

export const editProjectDescriptionServerFunction = createServerFn({
    method: "POST",
})
    .middleware([authenticationMiddlewareWithAccessToken])
    .inputValidator(editProjectDescriptionInputSchema)
    .handler(async ({ context: { mittwaldClient, contextId }, data }) => {
        return editProjectDescription(
            mittwaldClient,
            contextId,
            data.projectDescription,
        );
    });
