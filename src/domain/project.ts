import {
    assertStatus,
    type MittwaldAPIV2,
    type MittwaldAPIV2Client,
} from "@mittwald/api-client";
import { PermissionsInsufficientError } from "@/global-errors.ts";

export type ProjectProject = MittwaldAPIV2.Components.Schemas.ProjectProject;

export async function getProject(
    mittwaldClient: MittwaldAPIV2Client,
    extensionInstanceId: string,
    projectId: string,
): Promise<ProjectProject> {
    const response = await mittwaldClient.project.getProject({ projectId });
    if (response.status === 403) {
        throw new PermissionsInsufficientError(extensionInstanceId);
    }
    assertStatus(response, 200);

    return response.data;
}

export async function editProjectDescription(
    mittwaldClient: MittwaldAPIV2Client,
    extensionInstanceId: string,
    projectId: string,
    projectDescription: string,
): Promise<void> {
    const response = await mittwaldClient.project.updateProjectDescription({
        projectId,
        data: {
            description: projectDescription,
        },
    });
    if (response.status === 403) {
        throw new PermissionsInsufficientError(extensionInstanceId);
    }
    assertStatus(response, 204);
}
