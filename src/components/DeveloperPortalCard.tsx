import {
    Heading,
    LayoutCard,
    Link,
    Section,
    Text,
} from "@mittwald/flow-remote-react-components";

export const DeveloperPortalCard = () => {
    return (
        <LayoutCard>
            <Section>
                <Heading>Developer Portal</Heading>
                <Text>
                    Eine Dokumentation für die{" "}
                    <strong>Entwicklung von Extension</strong> findest du im{" "}
                    <Link
                        target="_blank"
                        href="https://developer.mittwald.de/docs/v2/contribution/"
                    >
                        Developer Portal
                    </Link>
                </Text>
            </Section>
        </LayoutCard>
    );
};
