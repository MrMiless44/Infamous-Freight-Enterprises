-- Persist unauthenticated quote, demo, and discount lead intake records.
CREATE TABLE "PublicLead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "originCity" TEXT,
    "destCity" TEXT,
    "freightType" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pickupDate" TIMESTAMP(3),
    "notes" TEXT,
    "source" TEXT NOT NULL DEFAULT 'web-form',
    "status" TEXT NOT NULL DEFAULT 'new',
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublicLead_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PublicLead_email_idx" ON "PublicLead"("email");
CREATE INDEX "PublicLead_source_idx" ON "PublicLead"("source");
CREATE INDEX "PublicLead_status_idx" ON "PublicLead"("status");
CREATE INDEX "PublicLead_receivedAt_idx" ON "PublicLead"("receivedAt");
