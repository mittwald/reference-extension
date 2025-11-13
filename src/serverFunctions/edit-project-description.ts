import {createServerFn} from "@tanstack/react-start";
import {authenticationMiddlewareWithAccessToken} from "@/middleware/auth.ts";
import {z} from "zod/v4";
import {
    useMutation,
    UseMutationResult,
    useQueryClient
} from "@tanstack/react-query";
import {QueryClient} from "@tanstack/query-core";
import {editProjectDescription} from "@/domain/project.ts";
import {
    GET_PROJECT_OF_EXTENSION_INSTANCE_KEY_ROOT
} from "@/serverFunctions/get-project-of-extension-instance.ts";

export const editProjectDescriptionInputSchema = z.object({
    projectDescription: z.string(),
})

export type EditProjectDescriptionInput = z.infer<typeof editProjectDescriptionInputSchema>;

export const editProjectDescriptionServerFunction = createServerFn({
    method: "POST",
})
    .middleware([authenticationMiddlewareWithAccessToken])
    .inputValidator(editProjectDescriptionInputSchema)
    .handler(async ({ context: { mittwaldClient, contextId }, data }) => {
        return editProjectDescription(mittwaldClient, contextId, data.projectDescription);
    });

/* ────────────────────────────────────────────────────────────────────────────
 * Hook (useMutation)
 * ──────────────────────────────────────────────────────────────────────────── */

export function useEditProjectDescription(
    options?: Parameters<
        typeof useMutation<
            void,
            unknown,
            EditProjectDescriptionInput
        >
    >[0],
): UseMutationResult<
    void,
    unknown,
    EditProjectDescriptionInput
> {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (input: EditProjectDescriptionInput) =>
            editProjectDescriptionServerFunction({ data: input }),
        ...options,
        onSuccess: (data, variables, onMutateResult, context) => {
            if (options?.onSuccess) {
                options.onSuccess(data, variables, onMutateResult, context)
            }
            void invalidateAfterEditProjectDescription(queryClient)
        }
    });
}

/* ────────────────────────────────────────────────────────────────────────────
 * Invalidate helper (call after success)
 * ──────────────────────────────────────────────────────────────────────────── */

export async function invalidateAfterEditProjectDescription(
    queryClient: QueryClient,
    selector?: (qc: QueryClient) => Promise<unknown> | unknown,
) {
    if (selector) {
        await selector(queryClient);
        return;
    }
    await queryClient.invalidateQueries({ queryKey: GET_PROJECT_OF_EXTENSION_INSTANCE_KEY_ROOT});
}
