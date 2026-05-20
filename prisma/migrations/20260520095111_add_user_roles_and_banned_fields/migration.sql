-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'DEALER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('MAIN', 'CONTENT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "adminRole" "AdminRole",
ADD COLUMN     "bannedAt" TIMESTAMP(3),
ADD COLUMN     "bannedReason" TEXT,
ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- AlterTable
CREATE SEQUENCE vehicle_lot_seq;
ALTER TABLE "Vehicle" ALTER COLUMN "lot" SET DEFAULT nextval('vehicle_lot_seq');
ALTER SEQUENCE vehicle_lot_seq OWNED BY "Vehicle"."lot";
