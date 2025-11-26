import {
    Button,
    Content,
    Heading,
    Modal,
    ModalTrigger,
    Text,
} from "@mittwald/flow-remote-react-components";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback.tsx";
import { ProjectForm } from "@/components/project/ProjectForm.tsx";

export const EditProjectDescriptionModal = () => {
    return (
        <ModalTrigger>
            <Button color="secondary" variant="soft">
                Beschreibung bearbeiten
            </Button>
            <Modal>
                <Heading>Projektbeschreibung bearbeiten</Heading>
                <Content>
                    <Text>
                        Um auch schreibende Requests zu demonstrieren, kannst du
                        hier die Beschreibung deines Projektes bearbeiten. Du
                        solltest im Hauptmenü des mStudio sofort eine Änderung
                        bemerken können.
                    </Text>
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                        <ProjectForm />
                    </ErrorBoundary>
                </Content>
            </Modal>
        </ModalTrigger>
    );
};
