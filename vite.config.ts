import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { getEnvironmentVariables } from "./src/env";

const env = getEnvironmentVariables();

const config = defineConfig({
    server: {
        allowedHosts: true,
        port: env.PORT,
    },
    plugins: [
        tsConfigPaths({
            projects: ["./tsconfig.json"],
        }),
        tanstackStart(),
        nitro({
            preset: "node-server",
            externals: {
                exportConditions: ["node", "import", "module", "default"],
            },
            scanDirs: ["src/server"],
        }),
        react(),
    ],
});

export default config;
