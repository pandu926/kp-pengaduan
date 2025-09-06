/*
  Warnings:

  - You are about to drop the column `urlGambar` on the `Layanan` table. All the data in the column will be lost.
  - You are about to drop the column `nama` on the `Pengguna` table. All the data in the column will be lost.
  - You are about to drop the `Portofolio` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Layanan" DROP COLUMN "urlGambar";

-- AlterTable
ALTER TABLE "Pengguna" DROP COLUMN "nama";

-- AlterTable
ALTER TABLE "Pesanan" ADD COLUMN     "namaPelanggan" TEXT NOT NULL DEFAULT 'tes';

-- DropTable
DROP TABLE "Portofolio";
