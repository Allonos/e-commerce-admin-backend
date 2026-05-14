/*
  Warnings:

  - The `condition` column on the `Vehicle` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `transmission` column on the `Vehicle` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `fuelType` column on the `Vehicle` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('AUTOMATIC', 'MANUAL', 'SEMI_AUTOMATIC', 'CVT');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID', 'PLUG_IN_HYBRID', 'LPG', 'CNG', 'HYDROGEN');

-- CreateEnum
CREATE TYPE "VehicleCondition" AS ENUM ('NEW', 'USED');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SOLD');

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "condition",
ADD COLUMN     "condition" "VehicleCondition" NOT NULL DEFAULT 'USED',
DROP COLUMN "transmission",
ADD COLUMN     "transmission" "Transmission" NOT NULL DEFAULT 'AUTOMATIC',
DROP COLUMN "fuelType",
ADD COLUMN     "fuelType" "FuelType" NOT NULL DEFAULT 'GASOLINE';
