import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, StatusPesanan } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Ambil semua pesanan
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const penggunaId = searchParams.get("penggunaId");
    const status = searchParams.get("status");

    const where: any = {};
    if (penggunaId) where.penggunaId = parseInt(penggunaId);
    if (status) where.status = status as StatusPesanan;

    const pesanan = await prisma.pesanan.findMany({
      where,
      include: {
        pengguna: true,
        layanan: true,
        progres: {
          orderBy: {
            diperbaruiPada: "desc",
          },
        },
      },
      orderBy: {
        dibuatPada: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: pesanan,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data pesanan" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Buat pesanan baru
export async function POST(request: NextRequest) {
  try {
    const {
      penggunaId,
      layananId,
      hargaDisepakati,
      tanggalPesan,
      lokasi,
      catatan,
    } = await request.json();

    if (!penggunaId || !tanggalPesan) {
      return NextResponse.json(
        { success: false, error: "Pengguna ID dan tanggal pesan diperlukan" },
        { status: 400 }
      );
    }

    const pesanan = await prisma.pesanan.create({
      data: {
        penggunaId: parseInt(penggunaId),
        layananId: layananId ? parseInt(layananId) : null,
        hargaDisepakati,
        tanggalPesan: new Date(tanggalPesan),
        lokasi,
        catatan,
      },
      include: {
        pengguna: true,
        layanan: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: pesanan,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal membuat pesanan" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
