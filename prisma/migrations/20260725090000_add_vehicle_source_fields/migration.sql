ALTER TABLE "Car"
ADD COLUMN "source" TEXT NOT NULL DEFAULT 'demo',
ADD COLUMN "sourceUrl" TEXT,
ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'AUD',
ADD COLUMN "inspection" TEXT,
ADD COLUMN "repairHistory" TEXT,
ADD COLUMN "bodyType" TEXT,
ADD COLUMN "dealerName" TEXT,
ADD COLUMN "scrapedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Car_sourceUrl_key" ON "Car"("sourceUrl");
CREATE INDEX "Car_source_idx" ON "Car"("source");
