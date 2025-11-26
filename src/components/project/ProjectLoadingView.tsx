import {
    Align,
    Avatar,
    Skeleton,
    Text,
} from "@mittwald/flow-remote-react-components";

export const ProjectLoadingView = () => {
    return (
        <Align>
            <Avatar>
                <Skeleton />
            </Avatar>
            <Text>
                <Skeleton width="200px" />
            </Text>
        </Align>
    );
};
