CREATE TABLE "api_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staging_id" uuid,
	"filename" text NOT NULL,
	"module" text NOT NULL,
	"endpoint" text NOT NULL,
	"method" text NOT NULL,
	"record_count" integer NOT NULL,
	"success_count" integer NOT NULL,
	"failure_count" integer NOT NULL,
	"status" text NOT NULL,
	"erpnext_response" jsonb,
	"errors" jsonb,
	"response_time" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "configuration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "configuration_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "excel_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module" text NOT NULL,
	"template_name" text NOT NULL,
	"columns" jsonb NOT NULL,
	"sample_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "excel_templates_module_unique" UNIQUE("module")
);
--> statement-breakpoint
CREATE TABLE "staging_erpnext_imports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" text NOT NULL,
	"module" text NOT NULL,
	"record_count" integer NOT NULL,
	"parsed_data" jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
