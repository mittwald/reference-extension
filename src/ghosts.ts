import { makeGhost } from "@mittwald/react-ghostmaker";
import { addCommentServerFunction } from "@/serverFunctions/comments/add-comment";
import { deleteCommentsServerFunction } from "@/serverFunctions/comments/delete-comment";
import { getCommentsForExtensionInstanceServerFunction } from "@/serverFunctions/comments/get-comments";
import { getUserAvatarServerFunction } from "@/serverFunctions/comments/get-user-avatar";
import { getUserNameServerFunction } from "@/serverFunctions/comments/get-user-name";
import { editProjectDescriptionServerFunction } from "@/serverFunctions/edit-project-description.ts";
import { getProjectOfExtensionInstanceServerFunction } from "@/serverFunctions/get-project-of-extension-instance.ts";

const projectClient = {
    getProjectOfExtensionInstance: getProjectOfExtensionInstanceServerFunction,
    editProjectDescription: editProjectDescriptionServerFunction,
};

const commentsClient = {
    addComment: addCommentServerFunction,
    getComments: getCommentsForExtensionInstanceServerFunction,
    deleteComments: deleteCommentsServerFunction,
    getUserName: getUserNameServerFunction,
    getUserAvatar: getUserAvatarServerFunction,
};

export const ProjectClientGhost = makeGhost(projectClient);
export const CommentsClientGhost = makeGhost(commentsClient);
