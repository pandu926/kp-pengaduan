-- CreateEnum
CREATE TYPE "StatusPesanan" AS ENUM ('PENGAJUAN', 'DITERIMA', 'DITOLAK', 'SELESAI');

-- CreateEnum
CREATE TYPE "StatusBayar" AS ENUM ('BELUM_BAYAR', 'MENUNGGU_VERIFIKASI', 'DIVERIFIKASI', 'DITOLAK');

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "kataSandi" TEXT NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengguna" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "googleId" TEXT NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pengguna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Layanan" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "harga" DECIMAL(12,2),
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Layanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pesanan" (
    "id" SERIAL NOT NULL,
    "penggunaId" INTEGER,
    "namaPelanggan" TEXT NOT NULL,
    "layananId" INTEGER,
    "hargaDisepakati" DECIMAL(12,2),
    "tanggalPesan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nomorHp" TEXT NOT NULL,
    "status" "StatusPesanan" NOT NULL DEFAULT 'PENGAJUAN',
    "lokasi" TEXT,
    "catatan" TEXT,
    "catatanAdmin" TEXT,
    "alasanPenolakan" TEXT,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pesanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pembayaran" (
    "id" SERIAL NOT NULL,
    "pesananId" INTEGER NOT NULL,
    "jumlah" DECIMAL(12,2) NOT NULL,
    "metodePembayaran" TEXT,
    "buktiPembayaran" TEXT,
    "statusPembayaran" "StatusBayar" NOT NULL DEFAULT 'BELUM_BAYAR',
    "tanggalBayar" TIMESTAMP(3),
    "diverifikasiOlehId" INTEGER,
    "tanggalVerifikasi" TIMESTAMP(3),
    "alasanPenolakan" TEXT,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pembayaran_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pengguna_email_key" ON "Pengguna"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pengguna_googleId_key" ON "Pengguna"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "Pembayaran_pesananId_key" ON "Pembayaran"("pesananId");

-- AddForeignKey
ALTER TABLE "Pesanan" ADD CONSTRAINT "Pesanan_penggunaId_fkey" FOREIGN KEY ("penggunaId") REFERENCES "Pengguna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pesanan" ADD CONSTRAINT "Pesanan_layananId_fkey" FOREIGN KEY ("layananId") REFERENCES "Layanan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_pesananId_fkey" FOREIGN KEY ("pesananId") REFERENCES "Pesanan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_diverifikasiOlehId_fkey" FOREIGN KEY ("diverifikasiOlehId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
