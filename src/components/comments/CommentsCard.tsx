import {
    Chat,
    Header,
    Heading,
    LayoutCard,
    Section,
    Text,
} from "@mittwald/flow-remote-react-components";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ChatLoading } from "@/components/comments/ChatLoading.tsx";
import { CommentForm } from "@/components/comments/CommentForm.tsx";
import { CommentsView } from "@/components/comments/CommentsView.tsx";
import { ErrorFallback } from "@/components/ErrorFallback.tsx";

export const CommentsCard = () => {
    return (
        <LayoutCard>
            <Section>
                <Header>
                    <Heading>Kommentare</Heading>
                </Header>
                <Text>
                    Extensions können nicht nur auf Daten des mStudios
                    zurückgreifen. Sie können auch Daten seperat vom mStudio
                    halten. Dieses kleine Kommentarsystem demonstriert wie Daten
                    pro ExtensionInstance verwaltet werden können.
                </Text>
                <Section>
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                        <Suspense fallback={<ChatLoading />}>
                            <Chat height={400}>
                                <CommentsView />
                                <CommentForm />
                            </Chat>
                        </Suspense>
                    </ErrorBoundary>
                </Section>
            </Section>
        </LayoutCard>
    );
};
