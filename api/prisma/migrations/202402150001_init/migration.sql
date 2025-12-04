-- CreateTable: User
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateTable: Driver
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "avatarCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Shipment
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'created',
    "driverId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Shipment_reference_key" ON "Shipment"("reference");

ALTER TABLE "Shipment"
ADD CONSTRAINT "Shipment_driverId_fkey"
FOREIGN KEY ("driverId")
REFERENCES "Driver" ("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- CreateTable: AiEvent
CREATE TABLE "AiEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiEvent_pkey" PRIMARY KEY ("id")
);
