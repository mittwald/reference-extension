import {
    Avatar,
    Combine,
    Skeleton,
    Text,
} from "@mittwald/flow-remote-react-components";

export const ProjectLoadingView = () => {
    return (
        <Combine>
            <Avatar>
                <Skeleton />
            </Avatar>
            <Text>
                <Skeleton width="200px" />
            </Text>
        </Combine>
    );
};
