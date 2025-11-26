import {
    Heading,
    IconSearch,
    IllustratedMessage,
    InlineCode,
    MessageThread,
    Text,
} from "@mittwald/flow-remote-react-components";
import { Suspense } from "react";
import { CommentsClientGhost } from "@/ghosts.ts";
import { CommentMessage } from "./CommentMessage";
import { CommentMessageLoading } from "./CommentMessageLoading";

export const CommentsView = () => {
    const comments = CommentsClientGhost.getComments().use();

    return (
        <MessageThread>
            {comments.length === 0 ? (
                <IllustratedMessage>
                    <IconSearch />
                    <Heading>Wow such empty</Heading>
                    <Text>
                        Du hast derzeit noch keine Kommentare hinzugefügt.
                        Schreibe einen ersten Kommentar, um zu sehen, wie die{" "}
                        <InlineCode>Chat</InlineCode>
                        -Komponente funktioniert.
                    </Text>
                </IllustratedMessage>
            ) : (
                comments.map((comment) => (
                    <Suspense
                        key={comment.id}
                        fallback={<CommentMessageLoading comment={comment} />}
                    >
                        <CommentMessage comment={comment} />
                    </Suspense>
                ))
            )}
        </MessageThread>
    );
};
