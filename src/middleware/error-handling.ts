import { createMiddleware } from "@tanstack/react-start";
import type { ZodIssue } from "zod/v3";
import { type ErrorBody, PublicError } from "@/global-errors";

export const handleServerErrors = createMiddleware({
    type: "function",
}).server(async ({ next }) => {
    try {
        return await next();
    } catch (error) {
        console.error("Server function error occured:", error);

        const validationIssues = parseZodValidationError(error);
        if (validationIssues) {
            throw buildValidationError(validationIssues);
        }

        if (error instanceof PublicError) {
            throw buildPublicError(error);
        }

        throw buildUnknownError();
    }
});

function parseZodValidationError(error: unknown): ZodIssue[] | null {
    if (!(error instanceof Error)) {
        return null;
    }

    const trimmed = error.message.trim();

    try {
        const parsed = JSON.parse(trimmed);
        const isValid =
            Array.isArray(parsed) &&
            parsed.length > 0 &&
            parsed.every(
                (item) =>
                    typeof item === "object" &&
                    item !== null &&
                    "message" in item &&
                    "path" in item &&
                    Array.isArray(item.path),
            );

        return isValid ? (parsed as ZodIssue[]) : null;
    } catch {
        return null;
    }
}

function buildValidationError(validationIssues: ZodIssue[]): Error {
    console.log(`error is a validation error`);
    const firstIssue = validationIssues[0];

    return new Error(
        JSON.stringify({
            type: "ValidationError",
            message: firstIssue.message,
            isRetryable: false,
            details: {
                affectedField: firstIssue.path[0],
            },
        }),
    );
}

function buildPublicError(error: PublicError): Error {
    console.log(`error is known, responding with ${error.statusCode}`);
    return new Error(
        JSON.stringify({
            type: error.name,
            message: error.message,
            isRetryable: error.isRetryable,
            details: error.details,
        } as ErrorBody),
    );
}

function buildUnknownError(): Error {
    console.log("error is unknown, responding with status 500");
    return new Error(
        JSON.stringify({
            type: "UnknownError",
            message: "Ein unerwarteter Fehler ist aufgetreten",
            isRetryable: false,
            details: {},
        }),
    );
}
