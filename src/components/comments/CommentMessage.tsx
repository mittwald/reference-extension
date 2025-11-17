import { useConfig } from "@mittwald/ext-bridge/react";
import {
    Align,
    Avatar,
    Content,
    Header,
    Image,
    Initials,
    Message,
    Text,
} from "@mittwald/flow-remote-react-components";
import type { Comment } from "@/db/schema";
import { CommentsClientGhost } from "@/ghosts";

export interface CommentMessageProps {
    comment: Comment;
}

export const CommentMessage = (props: CommentMessageProps) => {
    const { comment } = props;
    const { userId: currentUserId } = useConfig();
    const userName = CommentsClientGhost.getUserName().use();
    const userAvatar = CommentsClientGhost.getUserAvatar().use();

    const messageType =
        comment.userId === currentUserId ? "sender" : "responder";

    return (
        <Message type={messageType}>
            <Header>
                <Align>
                    <Avatar>
                        {userAvatar ? (
                            <Image alt="Avatar" src={userAvatar} />
                        ) : (
                            <Initials>{userName}</Initials>
                        )}
                    </Avatar>
                    <Text>{userName}</Text>
                </Align>
                <Text>{comment.createdAt.toLocaleString()}</Text>
            </Header>
            <Content>
                <Text>{comment.text}</Text>
            </Content>
        </Message>
    );
};
