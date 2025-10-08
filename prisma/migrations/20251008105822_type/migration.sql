-- CreateEnum
CREATE TYPE "TipePembayaran" AS ENUM ('DP', 'PELUNASAN', 'CICILAN');

-- AlterTable
ALTER TABLE "Pembayaran" ADD COLUMN     "tipePembayaran" "TipePembayaran" NOT NULL DEFAULT 'DP';
