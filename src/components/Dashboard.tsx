import { ColumnLayout } from "@mittwald/flow-remote-react-components";
import { APIReferenceCard } from "@/components/APIReferenceCard.tsx";
import { CommentsCard } from "@/components/comments/CommentsCard";
import { DeveloperPortalCard } from "@/components/DeveloperPortalCard.tsx";
import { FlowDocumentationCard } from "@/components/FlowDocumentationCard.tsx";
import { GreetingCard } from "@/components/GreetingCard.tsx";
import { ProjectCard } from "@/components/project/ProjectCard.tsx";
import { ReadmeCard } from "@/components/ReadmeCard.tsx";

export function Dashboard() {
    return (
        <>
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
        </>
    );
}
