/*
  Warnings:

  - Added the required column `nomerHp` to the `Pesanan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pesanan" ADD COLUMN     "nomerHp" INTEGER NOT NULL;
