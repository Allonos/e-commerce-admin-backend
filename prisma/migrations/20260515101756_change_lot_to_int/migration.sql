-- Add temporary integer column
ALTER TABLE "Vehicle" ADD COLUMN "lot_new" INTEGER;

-- Extract numeric part from existing lot values, default to 0 if empty/unparseable
UPDATE "Vehicle"
SET "lot_new" = CASE
  WHEN REGEXP_REPLACE(lot, '[^0-9]', '', 'g') = '' THEN 0
  ELSE CAST(REGEXP_REPLACE(lot, '[^0-9]', '', 'g') AS INTEGER)
END;

-- Drop old string column and unique index
DROP INDEX "Vehicle_lot_key";
ALTER TABLE "Vehicle" DROP COLUMN "lot";

-- Rename new column to lot
ALTER TABLE "Vehicle" RENAME COLUMN "lot_new" TO "lot";

-- Apply NOT NULL constraint
ALTER TABLE "Vehicle" ALTER COLUMN "lot" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_lot_key" ON "Vehicle"("lot");
