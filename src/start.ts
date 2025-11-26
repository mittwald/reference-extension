import { createStart } from "@tanstack/react-start";
import { z } from "zod/v4";
import { handleServerErrors } from "./middleware/error-handling";

z.config(z.locales.de());

export const startInstance = createStart(() => {
    return {
        functionMiddleware: [handleServerErrors],
    };
});
