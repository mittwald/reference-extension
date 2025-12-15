import {
    AccentBox,
    Color,
    Flex,
    Heading,
    Link,
    Text,
} from "@mittwald/flow-remote-react-components";

export const ReadmeCard = () => {
    return (
        <AccentBox color="gradient">
            <Flex align="center" wrap="wrap" gap="m">
                <Flex direction="column" grow>
                    <Heading size="l">
                        Weitere Dokumentation in der{" "}
                        <Color color="violet">README.md</Color>
                    </Heading>
                    <Text>
                        <Color>
                            Die README.md erklärt sehr ausführlich, wie dieses
                            Projekt funktioniert, welche Marktplatz Mechanismen
                            eingesetzt werden und was du ab diesem Punkt tun
                            kannst, um deine eigene Extension zu entwickeln
                        </Color>
                    </Text>
                </Flex>
                <Link
                    target="_blank"
                    href="https://github.com/mittwald/reference-extension"
                    color="dark"
                >
                    Referenz Extension
                </Link>
            </Flex>
        </AccentBox>
    );
};
