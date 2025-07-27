-- CreateEnum
CREATE TYPE "StatusPesanan" AS ENUM ('MENUNGGU', 'DIPROSES', 'SELESAI', 'DIBATALKAN');

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
    "urlGambar" TEXT,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Layanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pesanan" (
    "id" SERIAL NOT NULL,
    "penggunaId" INTEGER NOT NULL,
    "layananId" INTEGER,
    "hargaDisepakati" DECIMAL(65,30),
    "tanggalPesan" TIMESTAMP(3) NOT NULL,
    "status" "StatusPesanan" NOT NULL DEFAULT 'MENUNGGU',
    "lokasi" TEXT,
    "catatan" TEXT,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pesanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgresPesanan" (
    "id" SERIAL NOT NULL,
    "pesananId" INTEGER NOT NULL,
    "keterangan" TEXT,
    "persenProgres" INTEGER NOT NULL,
    "urlDokumentasi" TEXT,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgresPesanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Portofolio" (
    "id" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "urlGambar" TEXT,
    "tanggalSelesai" TIMESTAMP(3),
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Portofolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Laporan" (
    "id" SERIAL NOT NULL,
    "bulanLaporan" TIMESTAMP(3) NOT NULL,
    "totalPesanan" INTEGER,
    "totalPendapatan" DECIMAL(65,30),
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Laporan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pengguna_email_key" ON "Pengguna"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pengguna_googleId_key" ON "Pengguna"("googleId");

-- AddForeignKey
ALTER TABLE "Pesanan" ADD CONSTRAINT "Pesanan_penggunaId_fkey" FOREIGN KEY ("penggunaId") REFERENCES "Pengguna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pesanan" ADD CONSTRAINT "Pesanan_layananId_fkey" FOREIGN KEY ("layananId") REFERENCES "Layanan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgresPesanan" ADD CONSTRAINT "ProgresPesanan_pesananId_fkey" FOREIGN KEY ("pesananId") REFERENCES "Pesanan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
