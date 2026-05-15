-- Add temporary integer column
ALTER TABLE "Vehicle" ADD COLUMN "lot_new" INTEGER;

-- Extract the numeric part from existing lot values (e.g. "LOT-001" -> 1)
UPDATE "Vehicle" SET "lot_new" = CAST(REGEXP_REPLACE(lot, '[^0-9]', '', 'g') AS INTEGER);

-- Drop old string column and unique index
DROP INDEX "Vehicle_lot_key";
ALTER TABLE "Vehicle" DROP COLUMN "lot";

-- Rename new column to lot
ALTER TABLE "Vehicle" RENAME COLUMN "lot_new" TO "lot";

-- Apply NOT NULL constraint
ALTER TABLE "Vehicle" ALTER COLUMN "lot" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_lot_key" ON "Vehicle"("lot");
