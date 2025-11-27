import { createFileRoute } from "@tanstack/react-router";
import { MStudioFrontendFragment } from "@/components/MStudioFrontendFragment.tsx";

export const Route = createFileRoute("/")({
    component: App,
    ssr: false,
});

function App() {
    return (
        <MStudioFrontendFragment />
    );
}
