-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "condition" TEXT NOT NULL DEFAULT 'used',
ADD COLUMN     "engine" TEXT NOT NULL DEFAULT 'unknown',
ADD COLUMN     "mileage" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "transmission" TEXT NOT NULL DEFAULT 'automatic';
