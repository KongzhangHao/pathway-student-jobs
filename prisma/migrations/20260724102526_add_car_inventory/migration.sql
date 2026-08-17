-- CreateTable
CREATE TABLE "Car" (
    "id" SERIAL NOT NULL,
    "stockNumber" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "mileage" INTEGER NOT NULL,
    "engine" TEXT NOT NULL,
    "transmission" TEXT NOT NULL,
    "drivetrain" TEXT NOT NULL,
    "colour" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Car_stockNumber_key" ON "Car"("stockNumber");

-- CreateIndex
CREATE INDEX "Car_make_model_idx" ON "Car"("make", "model");

-- CreateIndex
CREATE INDEX "Car_price_idx" ON "Car"("price");

-- CreateIndex
CREATE INDEX "Car_year_idx" ON "Car"("year");
