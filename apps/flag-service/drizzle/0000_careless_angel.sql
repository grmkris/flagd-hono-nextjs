CREATE TABLE IF NOT EXISTS "feature_states" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"feature_id" varchar(255) NOT NULL,
	"context_type" varchar(20) NOT NULL,
	"context_id" varchar(255),
	"state" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "features" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"key" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "features_key_unique" UNIQUE("key")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "feature_states" ADD CONSTRAINT "feature_states_feature_id_features_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."features"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "feature_context_unique" ON "feature_states" USING btree ("feature_id","context_type","context_id");