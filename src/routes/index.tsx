import { ColumnLayout, Section } from "@mittwald/flow-remote-react-components";
import { Title } from "@mittwald/mstudio-ext-react-components";
import { createFileRoute } from "@tanstack/react-router";
import { APIReferenceCard } from "@/components/APIReferenceCard.tsx";
import { CommentsCard } from "@/components/comments/CommentsCard";
import { DeveloperPortalCard } from "@/components/DeveloperPortalCard.tsx";
import { FlowDocumentationCard } from "@/components/FlowDocumentationCard.tsx";
import { GreetingCard } from "@/components/GreetingCard.tsx";
import { ProjectCard } from "@/components/project/ProjectCard.tsx";
import { ReadmeCard } from "@/components/ReadmeCard.tsx";

export const Route = createFileRoute("/")({
    component: App,
    ssr: false,
});

function App() {
    return (
        <>
            <Title>Hallo Contributor!</Title>
            <Section>
                <ColumnLayout m={[1]} l={[3, 2]}>
                    <ColumnLayout m={[1]}>
                        <GreetingCard />
                        <ProjectCard />
                        <CommentsCard />
                    </ColumnLayout>
                    <ColumnLayout m={[1]}>
                        <DeveloperPortalCard />
                        <APIReferenceCard />
                        <FlowDocumentationCard />
                    </ColumnLayout>
                </ColumnLayout>
                <ReadmeCard />
            </Section>
        </>
    );
}
