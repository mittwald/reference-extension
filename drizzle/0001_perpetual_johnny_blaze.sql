ALTER TABLE "comments" DROP CONSTRAINT "comments_extensionInstanceId_extension_instance_id_fk";
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_extensionInstanceId_extension_instance_id_fk" FOREIGN KEY ("extensionInstanceId") REFERENCES "public"."extension_instance"("id") ON DELETE cascade ON UPDATE no action;