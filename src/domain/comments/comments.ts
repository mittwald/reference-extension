import { asc } from "drizzle-orm";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import * as uuid from "uuid";
import { getDatabase } from "@/db";
import { type Comment, comments } from "@/db/schema";

type StoreComment = Omit<Comment, "createdAt" | "id">;

export class DrizzleCommentStorage {
    public async addComment(comment: StoreComment): Promise<void> {
        await getDatabase()
            .insert(comments)
            .values({
                ...comment,
                id: uuid.v4(),
            });
    }

    public async deleteCommentsForExtensionInstance(
        extensionInstanceId: string,
    ): Promise<void> {
        await getDatabase()
            .delete(comments)
            .where(eq(comments.extensionInstanceId, extensionInstanceId));
    }

    public async getComments(extensionInstanceId: string): Promise<Comment[]> {
        return getDatabase()
            .select()
            .from(comments)
            .where(eq(comments.extensionInstanceId, extensionInstanceId))
            .orderBy(asc(comments.createdAt));
    }
}
