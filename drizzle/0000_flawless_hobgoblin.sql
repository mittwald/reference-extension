CREATE TYPE "public"."context" AS ENUM('customer', 'project');--> statement-breakpoint
CREATE TABLE "comments" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"extensionInstanceId" varchar(36) NOT NULL,
	"userId" varchar(36) NOT NULL,
	"text" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "extension_instance" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"contextId" varchar(36) NOT NULL,
	"context" "context" DEFAULT 'project' NOT NULL,
	"active" boolean NOT NULL,
	"variant_key" text,
	"consented_scopes" text[] NOT NULL,
	"secret" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_extensionInstanceId_extension_instance_id_fk" FOREIGN KEY ("extensionInstanceId") REFERENCES "public"."extension_instance"("id") ON DELETE no action ON UPDATE no action;