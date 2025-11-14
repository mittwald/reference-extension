import {ProjectProject} from "@/domain/project.ts";
import {useForm} from "react-hook-form";
import {
    Form,
    typedField
} from "@mittwald/flow-remote-react-components/react-hook-form";
import {
    Action,
    ActionGroup,
    Button,
    ColumnLayout,
    Content,
    Label,
    LabeledValue,
    TextField
} from "@mittwald/flow-remote-react-components";
import {
    useEditProjectDescription
} from "@/serverFunctions/edit-project-description.ts";

export interface ProjectFormProps {
    project: ProjectProject
}

interface FormValues {
    projectDescription: string;
}

export const ProjectForm = ({ project }: ProjectFormProps) => {
    const editProjectDescriptionMutation = useEditProjectDescription();

    const form = useForm<FormValues>({
        defaultValues: {
            projectDescription: project.description
        }
    });

    const Field = typedField(form);

    return (
        <Form form={form} onSubmit={(values) => editProjectDescriptionMutation.mutateAsync({
            projectDescription: values.projectDescription
        })}>
            <ColumnLayout>
                <Field
                    name="projectDescription"
                    rules={{
                        required:
                            "Die Projektbeschreibung ist verpflichtend",
                    }}
                >
                    <TextField>
                        <Label>Projektbeschreibung</Label>
                    </TextField>
                </Field>
                <LabeledValue>
                    <Label>Erstellungsdatum</Label>
                    <Content>{new Date(project.createdAt).toLocaleDateString()}</Content>
                </LabeledValue>
           </ColumnLayout>

            <ActionGroup>
                <Action action={() => form.reset()}>
                    <Button color="secondary">Zurücksetzen</Button>
                </Action>
                <Button type="submit" color="primary">
                    Speichern
                </Button>
            </ActionGroup>
        </Form>
    );
}
