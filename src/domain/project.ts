import {
    assertStatus,
    type MittwaldAPIV2,
    type MittwaldAPIV2Client,
} from "@mittwald/api-client";

export type ProjectProject = MittwaldAPIV2.Components.Schemas.ProjectProject;

export async function getProject(
    mittwaldClient: MittwaldAPIV2Client,
    projectId: string,
): Promise<ProjectProject> {
    const response = await mittwaldClient.project.getProject({ projectId });
    assertStatus(response, 200);

    return response.data;
}

export async function editProjectDescription(
    mittwaldClient: MittwaldAPIV2Client,
    projectId: string,
    projectDescription: string,
): Promise<void> {
    const response = await mittwaldClient.project.updateProjectDescription({
        projectId,
        data: {
            description: projectDescription,
        },
    });
    assertStatus(response, 204);
}
