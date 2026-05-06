-- Rename table Car → Vehicle (preserves all data)
ALTER TABLE "Car" RENAME TO "Vehicle";

-- Rename primary key constraint
ALTER TABLE "Vehicle" RENAME CONSTRAINT "Car_pkey" TO "Vehicle_pkey";

-- Rename unique index on lot
ALTER INDEX "Car_lot_key" RENAME TO "Vehicle_lot_key";

-- Rename foreign key constraints
ALTER TABLE "Vehicle" RENAME CONSTRAINT "Car_userId_fkey" TO "Vehicle_userId_fkey";
ALTER TABLE "Vehicle" RENAME CONSTRAINT "Car_makeId_fkey" TO "Vehicle_makeId_fkey";
ALTER TABLE "Vehicle" RENAME CONSTRAINT "Car_modelId_fkey" TO "Vehicle_modelId_fkey";
ALTER TABLE "Vehicle" RENAME CONSTRAINT "Car_typeId_fkey" TO "Vehicle_typeId_fkey";
