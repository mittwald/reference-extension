import {Header,} from "@mittwald/flow-remote-react-components";
import {createFileRoute} from "@tanstack/react-router";
import {
    prefetchProjectOfExtensionInstance,
    useProjectOfExtensionInstance,
} from "@/serverFunctions/get-project-of-extension-instance.ts";
import {ProjectForm} from "@/components/project-form.tsx";

export const Route = createFileRoute("/")({
    component: App,
    ssr: false,
    loader: ({ context }) => {
        void prefetchProjectOfExtensionInstance(context.queryClient);
    },
});

function App() {
    const project = useProjectOfExtensionInstance();
    if (project.isError) {
        throw project.error;
    }
    if (project.isLoading || !project.data) {
        return <Header>Is Loading</Header>;
    }

    return <ProjectForm project={project.data} />

}
