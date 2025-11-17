import { boolean, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core/columns/enum";
import { pgTable } from "drizzle-orm/pg-core/table";

const timestamps = {
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .$onUpdate(() => new Date())
        .notNull(),
};

export const context = pgEnum("context", ["customer", "project"]);

export const extensionInstances = pgTable("extension_instance", {
    id: varchar("id", { length: 36 }).primaryKey(),
    contextId: varchar({ length: 36 }).notNull(),
    context: context().notNull().default("project"),
    active: boolean().notNull(),
    variantKey: text("variant_key"),
    consentedScopes: text("consented_scopes").array().notNull(),
    ...timestamps,
});

export type ExtensionInstance = typeof extensionInstances.$inferSelect;

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
