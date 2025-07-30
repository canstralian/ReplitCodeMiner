
CREATE TABLE IF NOT EXISTS "search_history" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"query" text NOT NULL,
	"type" text DEFAULT 'code' NOT NULL,
	"filters" jsonb,
	"results_count" integer DEFAULT 0,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "search_history" ADD CONSTRAINT "search_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
