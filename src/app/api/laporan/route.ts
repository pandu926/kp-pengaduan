import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { StatusPesanan } from "@/lib/types"; // enum status pesanan-mu

const prisma = new PrismaClient();

// GET - Ambil laporan dari pesanan selesai dalam rentang tanggal
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start"); // format: YYYY-MM-DD
    const end = searchParams.get("end"); // format: YYYY-MM-DD

    if (!start || !end) {
      return NextResponse.json(
        { success: false, error: "Tanggal awal dan akhir harus diisi" },
        { status: 400 }
      );
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999); // supaya tanggal akhir termasuk seluruh hari

    const pesanan = await prisma.pesanan.findMany({
      where: {
        status: StatusPesanan.SELESAI,
        tanggalPesan: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        tanggalPesan: "asc",
      },
      include: {
        layanan: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: pesanan,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data laporan" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
