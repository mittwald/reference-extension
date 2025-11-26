import {
    Action,
    ActionGroup,
    Button,
    Label,
    Section,
    TextField,
    useOverlayController,
} from "@mittwald/flow-remote-react-components";
import {
    Form,
    typedField,
} from "@mittwald/flow-remote-react-components/react-hook-form";
import { useForm } from "react-hook-form";
import { ProjectClientGhost } from "@/ghosts.ts";
import { useFormErrorHandling } from "@/hooks/useFormErrorHandling.tsx";

interface FormValues {
    projectDescription: string;
}

export const ProjectForm = () => {
    const { value: project, invalidate: invalidateProject } =
        ProjectClientGhost.getProjectOfExtensionInstance().useGhost();

    const form = useForm<FormValues>({
        defaultValues: {
            projectDescription: project.description,
        },
    });

    const editDescriptionModalController = useOverlayController("Modal");

    const Field = typedField(form);

    const [RootError, handleSubmit] = useFormErrorHandling(
        form,
        async (values) => {
            await ProjectClientGhost.editProjectDescription({ data: values });
            void invalidateProject();
            editDescriptionModalController.close();
        },
    );

    return (
        <Form form={form} onSubmit={handleSubmit}>
            <Section>
                <Field
                    name="projectDescription"
                    rules={{
                        required: "Die Projektbeschreibung ist verpflichtend",
                    }}
                >
                    <TextField>
                        <Label>Projektbeschreibung</Label>
                    </TextField>
                </Field>

                <RootError />

                <ActionGroup>
                    <Action closeOverlay="Modal">
                        <Button color="secondary" variant="soft">
                            Abbrechen
                        </Button>
                    </Action>

                    <Button type="submit" color="primary">
                        Speichern
                    </Button>
                </ActionGroup>
            </Section>
        </Form>
    );
};
