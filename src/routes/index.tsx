import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/Dashboard";
import { Title } from "@mittwald/mstudio-ext-react-components";
import { Section } from "@mittwald/flow-remote-react-components";

export const Route = createFileRoute("/")({
    component: App,
    ssr: false,
});

function App() {
    return (
        <>
            <Title>Hallo Contributor!</Title>
            <Section>
                <Dashboard />
            </Section>
        </>
    );
}
