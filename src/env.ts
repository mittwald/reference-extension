import { bool, cleanEnv, num, str } from "envalid";

export const getEnvironmentVariables = () =>
    cleanEnv(process.env, {
        POSTGRES_USER: str(),
        POSTGRES_PASSWORD: str(),
        POSTGRES_DB: str(),
        POSTGRES_HOST: str(),
        POSTGRES_PORT: num(),
        POSTGRES_USE_SSL: bool({ default: false }),
        EXTENSION_ID: str(),
        ZROK_RESERVED_TOKEN: str(),
    });
