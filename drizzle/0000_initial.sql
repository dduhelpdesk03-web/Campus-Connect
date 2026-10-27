CREATE TABLE IF NOT EXISTS "academic_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(180) NOT NULL,
	"description" text NOT NULL,
	"event_date" varchar(10) NOT NULL,
	"location" varchar(160) DEFAULT '' NOT NULL,
	"source_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "faq_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" varchar(220) NOT NULL,
	"answer" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"contact" varchar(160),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "important_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(120) NOT NULL,
	"subtitle" varchar(160) NOT NULL,
	"url" text NOT NULL,
	"icon" varchar(30) DEFAULT 'link' NOT NULL,
	"shortcut" varchar(30) DEFAULT 'none' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notices" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(180) NOT NULL,
	"summary" text NOT NULL,
	"category" varchar(40) NOT NULL,
	"published_date" varchar(10) NOT NULL,
	"source_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference" varchar(32) NOT NULL,
	"question" text NOT NULL,
	"semester" varchar(40) NOT NULL,
	"subject" varchar(120) NOT NULL,
	"contact" varchar(160),
	"status" varchar(30) DEFAULT 'Received' NOT NULL,
	"answer" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "questions_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(180) NOT NULL,
	"subject" varchar(120) NOT NULL,
	"semester" varchar(40) NOT NULL,
	"category" varchar(40) NOT NULL,
	"description" text NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "site_settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"welcome_title" varchar(100) NOT NULL,
	"welcome_description" varchar(200) NOT NULL,
	"hero_line_1" varchar(80) NOT NULL,
	"hero_line_2" varchar(80) NOT NULL,
	"hero_description" text NOT NULL,
	"show_demo_content" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
