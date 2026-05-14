/*
  Warnings:

  - The `engine` column on the `Vehicle` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "fuelType" TEXT NOT NULL DEFAULT 'gasoline',
DROP COLUMN "engine",
ADD COLUMN     "engine" INTEGER NOT NULL DEFAULT 0;
