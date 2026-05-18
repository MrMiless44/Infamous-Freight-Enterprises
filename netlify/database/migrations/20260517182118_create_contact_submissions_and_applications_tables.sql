CREATE TABLE "contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"company" text,
	"email" text NOT NULL,
	"phone" text,
	"topic" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "driver_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"city" text,
	"state" text,
	"equipment" text,
	"notes" text,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "partner_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"company" text NOT NULL,
	"contact_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"category" text,
	"region" text,
	"notes" text,
	"status" text DEFAULT 'new' NOT NULL,
	"reviewed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "public_quote_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tracking_number" text NOT NULL,
	"company" text NOT NULL,
	"contact" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"origin" text NOT NULL,
	"destination" text NOT NULL,
	"freight_type" text NOT NULL,
	"equipment" text DEFAULT 'Dry van' NOT NULL,
	"weight_lbs" integer,
	"lane_miles" integer,
	"dimensions" text,
	"pickup_date" text,
	"delivery_date" text,
	"instructions" text,
	"estimate_low" integer,
	"estimate_mid" integer,
	"estimate_high" integer,
	"estimate_rpm" real,
	"estimate_confidence" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "public_shipments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tracking_number" text NOT NULL UNIQUE,
	"quote_request_id" uuid,
	"route" text NOT NULL,
	"origin" text NOT NULL,
	"destination" text NOT NULL,
	"status" text DEFAULT 'Quote received' NOT NULL,
	"pickup_date" text,
	"delivery_date" text,
	"eta" text,
	"equipment" text,
	"public_notes" text,
	"timeline" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);