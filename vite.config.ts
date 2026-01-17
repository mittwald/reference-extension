import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

const config = defineConfig({
    server: {
        allowedHosts: true,
        port: 3000,
    },
    plugins: [
        tsConfigPaths({
            projects: ["./tsconfig.json"],
        }),
        tanstackStart(),
        nitro({
            preset: "node-server",
            externals: {
                exportConditions: ["node", "import", "module", "default"]
            }
        }),
        react(),
    ],
});

export default config;
