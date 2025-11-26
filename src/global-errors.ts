import { z } from "zod/v4";

const errorDetailsSchema = z
    .object({
        extensionInstanceId: z.string().optional(),
        affectedField: z.string().optional(),
    })
    .catchall(z.string().optional());

export type PublicErrorDetails = z.infer<typeof errorDetailsSchema>;

export const errorBodySchema = z.object({
    type: z.string(),
    message: z.string(),
    isRetryable: z.boolean(),
    details: errorDetailsSchema,
});

export abstract class PublicError extends Error {
    public readonly isRetryable: boolean;
    public readonly statusCode: number;
    public readonly cause?: Error;
    public readonly details?: PublicErrorDetails;

    protected constructor(
        message: string,
        isRetryable: boolean = false,
        statusCode: number = 500,
        cause?: Error,
        details?: PublicErrorDetails,
    ) {
        super(message);
        this.name = this.constructor.name;
        this.isRetryable = isRetryable;
        this.statusCode = statusCode;
        this.cause = cause;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

export type ErrorBody = z.infer<typeof errorBodySchema>;

export function parsePublicError(err: any): ErrorBody | undefined {
    const parsedError = errorBodySchema.safeParse(err);
    if (parsedError.success) {
        return parsedError.data;
    }
    try {
        const parsedError = errorBodySchema.safeParse(JSON.parse(err.message));
        if (parsedError.success) {
            return parsedError.data;
        }
    } catch {
        console.warn("failed to parse error");
        return undefined;
    }
}

export class PermissionsInsufficientError extends PublicError {
    public constructor(extensionInstanceId: string) {
        super(
            "Du hast nicht ausreichend Berechtigungen für diese Operation. Entweder hat der User keinen Zugriff auf diese Funktion oder der Extension fehlt ein Scope.",
            false,
            403,
            undefined,
            {
                extensionInstanceId,
            },
        );
    }
}
