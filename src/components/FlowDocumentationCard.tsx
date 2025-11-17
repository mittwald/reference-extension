import {
    Heading,
    LayoutCard,
    Link,
    Section,
    Text,
} from "@mittwald/flow-remote-react-components";

export const FlowDocumentationCard = () => {
    return (
        <LayoutCard>
            <Section>
                <Heading>flow. Dokumentation</Heading>
                <Text>
                    Diese Extension verwendet die{" "}
                    <strong>flow. Components Library</strong>, um direkt im
                    mStudio gerendert werden zu können. Eine ausführliche
                    Dokumentation über die verfügbaren Komponenten findet sich
                    in der
                    <Link
                        target="_blank"
                        href="https://mittwald.github.io/flow/03-components/overlays/modal/overview"
                    >
                        {" "}
                        flow. Dokumentation
                    </Link>
                </Text>
            </Section>
        </LayoutCard>
    );
};
