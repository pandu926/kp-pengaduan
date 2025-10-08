import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Ambil semua layanan
export async function GET() {
  try {
    const layanan = await prisma.layanan.findMany({
      include: {
        pesanan: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: layanan,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data layanan" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Buat layanan baru
export async function POST(request: NextRequest) {
  try {
    const { nama, deskripsi, harga } = await request.json();

    if (!nama) {
      return NextResponse.json(
        { success: false, error: "Nama layanan diperlukan" },
        { status: 400 }
      );
    }

    const layanan = await prisma.layanan.create({
      data: {
        nama,
        deskripsi,
        harga,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: layanan,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal membuat layanan" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
