import {
    Heading,
    LayoutCard,
    Link,
    Section,
    Text,
} from "@mittwald/flow-remote-react-components";

export const APIReferenceCard = () => {
    return (
        <LayoutCard>
            <Section>
                <Heading>API Referenz</Heading>
                <Text>
                    Eine ausführliche Dokumentation über alle verfügbaren{" "}
                    <strong>API-Routen</strong>, die im mStudio aufgerufen
                    werden können, findest du in der{" "}
                    <Link
                        target="_blank"
                        href="https://developer.mittwald.de/docs/v2/reference/"
                    >
                        API Referenz
                    </Link>
                </Text>
            </Section>
        </LayoutCard>
    );
};
