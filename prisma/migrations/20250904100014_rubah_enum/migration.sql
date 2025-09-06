/*
  Warnings:

  - The values [MENUNGGU,DIPROSES] on the enum `StatusPesanan` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatusPesanan_new" AS ENUM ('PENGAJUAN', 'SURVEI', 'PENGERJAAN', 'SELESAI', 'DIBATALKAN');
ALTER TABLE "Pesanan" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Pesanan" ALTER COLUMN "status" TYPE "StatusPesanan_new" USING ("status"::text::"StatusPesanan_new");
ALTER TYPE "StatusPesanan" RENAME TO "StatusPesanan_old";
ALTER TYPE "StatusPesanan_new" RENAME TO "StatusPesanan";
DROP TYPE "StatusPesanan_old";
ALTER TABLE "Pesanan" ALTER COLUMN "status" SET DEFAULT 'PENGAJUAN';
COMMIT;

-- AlterTable
ALTER TABLE "Pesanan" ALTER COLUMN "status" SET DEFAULT 'PENGAJUAN';
