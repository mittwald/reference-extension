import {
    type QueryClient,
    queryOptions,
    type UseQueryResult,
    useQuery,
} from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getProject, type ProjectProject } from "@/domain/project.ts";
import { authenticationMiddlewareWithAccessToken } from "@/middleware/auth.ts";

export const getProjectOfExtensionInstanceServerFunction = createServerFn({
    method: "GET",
})
    .middleware([authenticationMiddlewareWithAccessToken])
    .handler(async ({ context: { mittwaldClient, contextId } }) => {
        return getProject(mittwaldClient, contextId);
    });

/* ────────────────────────────────────────────────────────────────────────────
 * Query Keys & Options
 * ──────────────────────────────────────────────────────────────────────────── */

export const GET_PROJECT_OF_EXTENSION_INSTANCE_KEY_ROOT = [
    "getProjectOfExtensionInstance",
] as const;

export const getProjectOptions = () =>
    queryOptions<ProjectProject>({
        queryKey: GET_PROJECT_OF_EXTENSION_INSTANCE_KEY_ROOT,
        queryFn: async () => getProjectOfExtensionInstanceServerFunction({}),
    });

/* ────────────────────────────────────────────────────────────────────────────
 * Hook
 * ──────────────────────────────────────────────────────────────────────────── */

export function useProjectOfExtensionInstance(): UseQueryResult<
    ProjectProject,
    unknown
> & {
    data: ProjectProject | undefined;
} {
    return useQuery(getProjectOptions());
}

/* ────────────────────────────────────────────────────────────────────────────
 * Prefetch & Invalidate
 * ──────────────────────────────────────────────────────────────────────────── */

export async function prefetchProjectOfExtensionInstance(
    queryClient: QueryClient,
) {
    await queryClient.ensureQueryData(getProjectOptions());
}

export function invalidateProjectOfExtensionInstance(queryClient: QueryClient) {
    return queryClient.invalidateQueries({
        queryKey: GET_PROJECT_OF_EXTENSION_INSTANCE_KEY_ROOT,
    });
}
