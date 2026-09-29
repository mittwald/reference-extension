import { describe, expect, it } from "vitest";
import { parsePublicError } from "@/global-errors";
import { handleServerErrors } from "./error-handling";

const server = handleServerErrors.options.server!;

describe("server function error handling", () => {
    it("throws a parseable public error for a failed server function", async () => {
        await expect(
            server({
                next: async () => {
                    throw new Error("database unavailable");
                },
            } as never),
        ).rejects.toSatisfy((error: Error) => {
            expect(error).toBeInstanceOf(Error);
            expect(parsePublicError(error)?.message).toBe(
                "Ein unerwarteter Fehler ist aufgetreten",
            );
            return true;
        });
    });
});
