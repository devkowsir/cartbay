CREATE TYPE "public"."auth_type" AS ENUM('email', 'google');--> statement-breakpoint
CREATE TABLE "auth" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"auth_type" "auth_type" NOT NULL,
	"email" text NOT NULL,
	"hashed_pass" text,
	"refresh_token" text
);
--> statement-breakpoint
ALTER TABLE "auth" ADD CONSTRAINT "auth_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;