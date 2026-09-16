import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    return {
        define: {
            "import.meta.env.MITTWALD_API_BASE_URL": JSON.stringify(
                env.MITTWALD_API_BASE_URL,
            ),
        },
        server: {
            allowedHosts: true,
            port: env.PORT ? Number.parseInt(env.PORT, 10) : 3000,
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
    };
});

export default config;
