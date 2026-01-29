import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

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
                exportConditions: ["node", "import", "module", "default"],
            },
            scanDirs: ["src/server"],
        }),
        react(),
    ],
});

export default config;
