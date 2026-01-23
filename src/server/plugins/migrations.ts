import { definePlugin } from "nitro";
import { getEnvironmentVariables } from "../../env";
import { runMigrations } from "../../db/migrate";

export default definePlugin(async () => {
    const env = getEnvironmentVariables();

    if (!env.RUN_MIGRATIONS_ON_STARTUP) {
        console.log("[migrations] Skipping migrations (RUN_MIGRATIONS_ON_STARTUP=false)");
        return;
    }

    const result = await runMigrations();

    if (!result.success) {
        console.error("[migrations] Database migrations failed - stopping server");
        throw result.error;
    }
});