import {
    ActionGroup,
    Align,
    Avatar,
    Button,
    Content,
    Flex,
    Header,
    Message,
    MessageThread,
    SkeletonText,
    Text,
    TextArea,
} from "@mittwald/flow-remote-react-components";

export function ChatLoading() {
    return (
        <MessageThread>
            <Message type="responder">
                <Header>
                    <Align>
                        <Avatar />
                        <SkeletonText width="80px" />
                    </Align>
                </Header>
                <Content>
                    <Text>
                        <SkeletonText width="150px" />
                    </Text>
                </Content>
            </Message>

            <Message type="sender">
                <Header>
                    <Align>
                        <Avatar />
                        <SkeletonText width="80px" />
                    </Align>
                </Header>
                <Content>
                    <Text>
                        <SkeletonText width="200px" />
                    </Text>
                </Content>
            </Message>

            <Message type="responder">
                <Header>
                    <Align>
                        <Avatar />
                        <SkeletonText width="80px" />
                    </Align>
                </Header>
                <Content>
                    <Text>
                        <SkeletonText width="120px" />
                    </Text>
                </Content>
            </Message>

            <TextArea
                aria-label="Kommentar"
                rows={3}
                autoResizeMaxRows={10}
                isDisabled
            />

            <ActionGroup>
                <Flex justify="end" gap="m" direction="row-reverse">
                    <Button variant="soft" color="secondary" isDisabled>
                        Kommentare aufräumen
                    </Button>
                    <Button isDisabled>Kommentieren</Button>
                </Flex>
            </ActionGroup>
        </MessageThread>
    );
}
