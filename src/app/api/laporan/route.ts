import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Ambil semua laporan
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tahun = searchParams.get("tahun");
    const bulan = searchParams.get("bulan");

    let where: any = {};
    if (tahun && bulan) {
      const startDate = new Date(parseInt(tahun), parseInt(bulan) - 1, 1);
      const endDate = new Date(parseInt(tahun), parseInt(bulan), 0);
      where.bulanLaporan = {
        gte: startDate,
        lte: endDate,
      };
    } else if (tahun) {
      const startDate = new Date(parseInt(tahun), 0, 1);
      const endDate = new Date(parseInt(tahun), 11, 31);
      where.bulanLaporan = {
        gte: startDate,
        lte: endDate,
      };
    }

    const laporan = await prisma.laporan.findMany({
      where,
      orderBy: {
        bulanLaporan: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: laporan,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data laporan" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Buat laporan baru
export async function POST(request: NextRequest) {
  try {
    const { bulanLaporan, totalPesanan, totalPendapatan } =
      await request.json();

    if (!bulanLaporan) {
      return NextResponse.json(
        { success: false, error: "Bulan laporan diperlukan" },
        { status: 400 }
      );
    }

    const laporan = await prisma.laporan.create({
      data: {
        bulanLaporan: new Date(bulanLaporan),
        totalPesanan,
        totalPendapatan,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: laporan,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal membuat laporan" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
