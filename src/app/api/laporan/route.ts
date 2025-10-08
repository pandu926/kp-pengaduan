// src/app/api/laporan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    // Validasi parameter
    if (!start || !end) {
      return NextResponse.json(
        {
          success: false,
          error: "Parameter start dan end diperlukan",
        },
        { status: 400 }
      );
    }

    // Konversi ke Date dan set time untuk cover full day
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    // Query pesanan dalam rentang tanggal
    const pesanan = await prisma.pesanan.findMany({
      where: {
        // Filter hanya pesanan selesai untuk laporan
        status: "SELESAI",
      },
      include: {
        pengguna: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
        layanan: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    // Hitung total pendapatan - convert Decimal to number
    const totalPendapatan = pesanan.reduce((sum, p) => {
      const harga = p.hargaDisepakati ? Number(p.hargaDisepakati) : 0;
      return sum + harga;
    }, 0);

    // Hitung statistik
    const statistik = {
      totalPesanan: pesanan.length,
      totalPendapatan,
      periode: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    };

    return NextResponse.json({
      success: true,
      data: pesanan,
      statistik,
    });
  } catch (error) {
    console.error("Error fetching laporan:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengambil data laporan",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
