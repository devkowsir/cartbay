CREATE TYPE "public"."user_role" AS ENUM('buyer', 'seller', 'admin');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar,
	"email" varchar,
	"photo_url" text,
	"role" "user_role" DEFAULT 'buyer',
	"phone_number" text,
	"profile" json DEFAULT '{}'::json,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
