CREATE TABLE "load_requests" (
	"id" serial PRIMARY KEY,
	"external_id" text NOT NULL UNIQUE,
	"load_id" text NOT NULL,
	"lane" text DEFAULT '' NOT NULL,
	"equipment" text DEFAULT '' NOT NULL,
	"total_pay" double precision,
	"rate_per_mile" double precision,
	"carrier_name" text NOT NULL,
	"mc_number" text NOT NULL,
	"contact_email" text DEFAULT '' NOT NULL,
	"contact_phone" text DEFAULT '' NOT NULL,
	"asking_rate" double precision,
	"notes" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
