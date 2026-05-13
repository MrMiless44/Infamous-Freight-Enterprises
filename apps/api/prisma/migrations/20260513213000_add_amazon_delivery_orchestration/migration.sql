-- Amazon delivery orchestration records
CREATE TABLE "AmazonConnection" (
  "id" TEXT NOT NULL,
  "carrierId" TEXT NOT NULL,
  "accountLabel" TEXT NOT NULL,
  "sellerAccount" TEXT,
  "marketplaceId" TEXT,
  "region" TEXT NOT NULL DEFAULT 'NA',
  "status" TEXT NOT NULL DEFAULT 'not_configured',
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "lastSyncedAt" TIMESTAMP(3),
  "metadata" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AmazonConnection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AmazonInventoryItem" (
  "id" TEXT NOT NULL,
  "carrierId" TEXT NOT NULL,
  "sellerSku" TEXT NOT NULL,
  "fulfillmentSku" TEXT,
  "productName" TEXT,
  "availableUnits" INTEGER NOT NULL DEFAULT 0,
  "reservedUnits" INTEGER NOT NULL DEFAULT 0,
  "inboundUnits" INTEGER NOT NULL DEFAULT 0,
  "lastSyncedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AmazonInventoryItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AmazonFulfillmentRequest" (
  "id" TEXT NOT NULL,
  "carrierId" TEXT NOT NULL,
  "loadId" TEXT,
  "orderReference" TEXT NOT NULL,
  "routeDecision" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'planned',
  "serviceLevel" TEXT,
  "amazonOrderId" TEXT,
  "amazonShipmentId" TEXT,
  "carrierService" TEXT,
  "trackingNumber" TEXT,
  "labelDocumentId" TEXT,
  "fulfillmentStatus" TEXT,
  "lastEventType" TEXT,
  "lastEventAt" TIMESTAMP(3),
  "requestPayload" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AmazonFulfillmentRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AmazonConnection_carrierId_idx" ON "AmazonConnection"("carrierId");
CREATE INDEX "AmazonConnection_carrierId_status_idx" ON "AmazonConnection"("carrierId", "status");
CREATE UNIQUE INDEX "AmazonInventoryItem_carrierId_sellerSku_key" ON "AmazonInventoryItem"("carrierId", "sellerSku");
CREATE INDEX "AmazonInventoryItem_carrierId_availableUnits_idx" ON "AmazonInventoryItem"("carrierId", "availableUnits");
CREATE UNIQUE INDEX "AmazonFulfillmentRequest_carrierId_orderReference_key" ON "AmazonFulfillmentRequest"("carrierId", "orderReference");
CREATE INDEX "AmazonFulfillmentRequest_carrierId_status_idx" ON "AmazonFulfillmentRequest"("carrierId", "status");
CREATE INDEX "AmazonFulfillmentRequest_trackingNumber_idx" ON "AmazonFulfillmentRequest"("trackingNumber");

ALTER TABLE "AmazonConnection" ADD CONSTRAINT "AmazonConnection_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AmazonInventoryItem" ADD CONSTRAINT "AmazonInventoryItem_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AmazonFulfillmentRequest" ADD CONSTRAINT "AmazonFulfillmentRequest_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
