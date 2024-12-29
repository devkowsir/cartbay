ALTER TABLE "users" ADD COLUMN "roles" "user_role"[] DEFAULT array['customer'::user_role] NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "role";