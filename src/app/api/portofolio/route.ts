import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Ambil semua portofolio
export async function GET() {
  try {
    const portofolio = await prisma.portofolio.findMany({
      orderBy: {
        tanggalSelesai: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: portofolio,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data portofolio" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Buat portofolio baru
export async function POST(request: NextRequest) {
  try {
    const { judul, deskripsi, urlGambar, tanggalSelesai } =
      await request.json();

    if (!judul) {
      return NextResponse.json(
        { success: false, error: "Judul portofolio diperlukan" },
        { status: 400 }
      );
    }

    const data: any = {
      judul,
      deskripsi,
      urlGambar,
    };

    if (tanggalSelesai) {
      data.tanggalSelesai = new Date(tanggalSelesai);
    }

    const portofolio = await prisma.portofolio.create({
      data,
    });

    return NextResponse.json(
      {
        success: true,
        data: portofolio,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal membuat portofolio" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
