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
import { useErrorBoundary } from "react-error-boundary";
import { useForm } from "react-hook-form";
import { CommentsClientGhost } from "@/ghosts.ts";
import { useFormErrorHandling } from "@/hooks/useFormErrorHandling.tsx";

interface FormValues {
    text: string;
}

export const CommentForm = () => {
    const { invalidate: invalidateComments } =
        CommentsClientGhost.getComments().useGhost();

    const { showBoundary } = useErrorBoundary();

    const form = useForm<FormValues>({});

    const Field = typedField(form);

    const [RootError, handleSubmit] = useFormErrorHandling(
        form,
        async (values: FormValues) => {
            await CommentsClientGhost.addComment({ data: values });
            void invalidateComments();
            form.reset();
        },
    );

    const resetComments = async () => {
        try {
            await CommentsClientGhost.deleteComments();
            void invalidateComments();
        } catch (error) {
            showBoundary(error);
        }
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

                <RootError />

                <ActionGroup>
                    <Flex justify="end" gap="m" direction="row-reverse">
                        <Action action={resetComments}>
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
