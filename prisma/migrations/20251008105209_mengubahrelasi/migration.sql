/*
  Warnings:

  - You are about to drop the column `dibuatPada` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `dibuatPada` on the `Layanan` table. All the data in the column will be lost.
  - You are about to drop the column `diperbaruiPada` on the `Layanan` table. All the data in the column will be lost.
  - You are about to drop the column `dibuatPada` on the `Pengguna` table. All the data in the column will be lost.
  - You are about to drop the column `alasanPenolakan` on the `Pesanan` table. All the data in the column will be lost.
  - You are about to drop the column `tanggalPesan` on the `Pesanan` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StatusPesanan" ADD VALUE 'PROSES_PEMBANGUNAN';
ALTER TYPE "StatusPesanan" ADD VALUE 'PELUNASAN';

-- DropIndex
DROP INDEX "Pembayaran_pesananId_key";

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "dibuatPada";

-- AlterTable
ALTER TABLE "Layanan" DROP COLUMN "dibuatPada",
DROP COLUMN "diperbaruiPada";

-- AlterTable
ALTER TABLE "Pengguna" DROP COLUMN "dibuatPada";

-- AlterTable
ALTER TABLE "Pesanan" DROP COLUMN "alasanPenolakan",
DROP COLUMN "tanggalPesan";
