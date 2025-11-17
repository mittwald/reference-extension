import { useConfig } from "@mittwald/ext-bridge/react";
import {
    Align,
    Avatar,
    Content,
    Header,
    Message,
    SkeletonText,
    Text,
} from "@mittwald/flow-remote-react-components";
import type { Comment } from "@/db/schema";

export interface CommentMessageProps {
    comment: Comment;
}

export const CommentMessageLoading = (props: CommentMessageProps) => {
    const { comment } = props;
    const { userId: currentUserId } = useConfig();

    const messageType =
        comment.userId === currentUserId ? "sender" : "responder";

    return (
        <Message type={messageType}>
            <Header>
                <Align>
                    <Avatar></Avatar>
                    <Text>
                        <SkeletonText width="80px" />
                    </Text>
                </Align>
                <Text>{comment.createdAt.toLocaleString()}</Text>
            </Header>
            <Content>
                <Text>{comment.text}</Text>
            </Content>
        </Message>
    );
};
