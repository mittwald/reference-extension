import {
    AccentBox,
    Heading,
    LayoutCard,
    Section,
    Text,
} from "@mittwald/flow-remote-react-components";

export const GreetingCard = () => {
    return (
        <LayoutCard>
            <AccentBox>
                <Section>
                    <Heading>Was sehe ich hier?</Heading>
                    <Text>
                        Dies ist eine <strong>Beispiel Extension</strong> von
                        mittwald. Sie soll dir den Einstieg in die Entwicklung
                        von Extensions erleichtern und dir ein Beispiel geben,
                        wie die einzelnen Mechanismen des Marktplatzes
                        zusammenarbeiten.
                    </Text>
                </Section>
            </AccentBox>
        </LayoutCard>
    );
};
