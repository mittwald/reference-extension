import { asc } from "drizzle-orm";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import * as uuid from "uuid";
import { getDatabase } from "@/db";
import { type Comment, comments } from "@/db/schema";

type StoreComment = Omit<Comment, "createdAt" | "id">;

export class DrizzleCommentStorage {
    public async addComment(comment: StoreComment): Promise<void> {
        try {
            await getDatabase()
                .insert(comments)
                .values({
                    ...comment,
                    id: uuid.v4(),
                    createdAt: new Date(),
                });
        } catch (error) {
            console.error(error);
            throw new Error("Failed to upsert comment");
        }
    }

    public async deleteCommentsForExtensionInstance(
        extensionInstanceId: string,
    ): Promise<void> {
        try {
            await getDatabase()
                .delete(comments)
                .where(eq(comments.extensionInstanceId, extensionInstanceId));
        } catch (error) {
            console.error(error);
            throw new Error("Failed to delete comments");
        }
    }

    public async getComments(extensionInstanceId: string): Promise<Comment[]> {
        try {
            return await getDatabase()
                .select()
                .from(comments)
                .where(eq(comments.extensionInstanceId, extensionInstanceId))
                .orderBy(asc(comments.createdAt));
        } catch (error) {
            console.error(error);
            throw new Error("failed to get comments for extension");
        }
    }
}
