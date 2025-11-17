import {
    Action,
    ActionGroup,
    Button,
    Flex,
    Section,
    TextArea,
} from "@mittwald/flow-remote-react-components";
import {
    Form,
    SubmitButton,
    typedField,
} from "@mittwald/flow-remote-react-components/react-hook-form";
import { useForm } from "react-hook-form";
import { CommentsClientGhost } from "@/ghosts.ts";

interface FormValues {
    text: string;
}

export const CommentForm = () => {
    const { invalidate } = CommentsClientGhost.getComments().useGhost();

    const form = useForm<FormValues>({});

    const Field = typedField(form);

    const handleSubmit = async (values: FormValues) => {
        await CommentsClientGhost.addComment({ data: values });
        void invalidate();
        form.reset();
    };

    const handleReset = async () => {
        await CommentsClientGhost.deleteComments();
        void invalidate();
    };

    return (
        <Form form={form} onSubmit={handleSubmit}>
            <Section>
                <Field
                    name="text"
                    rules={{ required: "Kommentare dürfen nicht leer sein" }}
                >
                    <TextArea
                        aria-label="Kommentar"
                        rows={3}
                        autoResizeMaxRows={10}
                    />
                </Field>
                <ActionGroup>
                    <Flex justify="end" gap="m" direction="row-reverse">
                        <Action action={handleReset}>
                            <Button variant="soft" color="secondary">
                                Kommentare aufräumen
                            </Button>
                        </Action>
                        <SubmitButton>Kommentieren</SubmitButton>
                    </Flex>
                </ActionGroup>
            </Section>
        </Form>
    );
};
