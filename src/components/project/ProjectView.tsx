import {
    Align,
    Avatar,
    Image,
    Initials,
    Text,
} from "@mittwald/flow-remote-react-components";
import { ProjectClientGhost } from "@/ghosts.ts";

export const ProjectView = () => {
    const project = ProjectClientGhost.getProjectOfExtensionInstance().use();

    return (
        <Align>
            <Avatar>
                {project.imageRefId ? (
                    <Image
                        alt="Projekt Bild"
                        src={`https://api.mittwald.de/v2/files/${project.imageRefId}`}
                    />
                ) : (
                    <Initials>{project.description}</Initials>
                )}
            </Avatar>
            <Text>
                <strong>{project.description}</strong>
                Erstellt am {new Date(project.createdAt).toLocaleDateString()}
            </Text>
        </Align>
    );
};
