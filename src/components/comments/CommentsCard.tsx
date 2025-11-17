import {
    Chat,
    Header,
    Heading,
    LayoutCard,
    Section,
    Text,
} from "@mittwald/flow-remote-react-components";
import { CommentForm } from "./CommentForm";
import { CommentsView } from "./CommentsView";

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
                    <Chat height={400}>
                        <CommentsView />
                        <CommentForm />
                    </Chat>
                </Section>
            </Section>
        </LayoutCard>
    );
};
