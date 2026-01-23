import {
    buildEncryptedTextColumn,
    buildEncryptionKey,
} from "@weissaufschwarz/mitthooks-drizzle/encryption";
import { buildExtensionInstanceTable } from "@weissaufschwarz/mitthooks-drizzle/schema";
import { text, timestamp, varchar } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core/table";
import { getEnvironmentVariables } from "../env";

const env = getEnvironmentVariables();

export { context } from "@weissaufschwarz/mitthooks-drizzle/schema";

export const extensionInstances = buildExtensionInstanceTable(
    buildEncryptedTextColumn(
        buildEncryptionKey(env.ENCRYPTION_MASTER_PASSWORD, env.ENCRYPTION_SALT),
    ),
);

export const comments = pgTable("comments", {
    id: varchar({ length: 36 }).primaryKey(),
    extensionInstanceId: varchar({ length: 36 })
        .notNull()
        .references(() => extensionInstances.id),
    userId: varchar({ length: 36 }).notNull(),
    text: text().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
