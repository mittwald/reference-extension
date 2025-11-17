import { makeGhost } from "@mittwald/react-ghostmaker";
import { editProjectDescriptionServerFunction } from "@/serverFunctions/edit-project-description.ts";
import { getProjectOfExtensionInstanceServerFunction } from "@/serverFunctions/get-project-of-extension-instance.ts";

const projectClient = {
    getProjectOfExtensionInstance: getProjectOfExtensionInstanceServerFunction,
    editProjectDescription: editProjectDescriptionServerFunction,
};

export const ProjectClientGhost = makeGhost(projectClient);
