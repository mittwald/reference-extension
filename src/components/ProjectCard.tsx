import {
    Header,
    Heading,
    LayoutCard,
    Section,
    SkeletonText,
    Text,
} from "@mittwald/flow-remote-react-components";
import { Suspense } from "react";
import { EditProjectDescriptionModal } from "@/components/EditProjectDescriptionModal.tsx";
import { ProjectLoadingView } from "@/components/ProjectLoadingView.tsx";
import { ProjectView } from "@/components/ProjectView.tsx";

export const ProjectCard = () => {
    return (
        <LayoutCard>
            <Section>
                <Header>
                    <Heading>Extension Context</Heading>
                    <Suspense fallback={<SkeletonText />}>
                        <EditProjectDescriptionModal />
                    </Suspense>
                </Header>
                <Section>
                    <Text>
                        Diese Extension wurde zu dem folgenden Projekt
                        hinzugefügt. Dadurch erhält sie Zugriff auf die Daten
                        und kann sie auch verändern. Um das zu demonstrieren,
                        implementiert diese Extension zwei Endpunkte:
                        <ul>
                            <li>Das Holen des Projektes</li>
                            <li>Das Bearbeiten der Projektbeschreibung</li>
                        </ul>
                    </Text>
                </Section>
                <Section>
                    <Suspense fallback={<ProjectLoadingView />}>
                        <ProjectView />
                    </Suspense>
                </Section>
            </Section>
        </LayoutCard>
    );
};
