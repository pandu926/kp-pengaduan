import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Ambil semua progres pesanan
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pesananId = searchParams.get("pesananId");

    const where: any = {};
    if (pesananId) where.pesananId = parseInt(pesananId);

    const progres = await prisma.progresPesanan.findMany({
      where,
      include: {
        pesanan: {
          include: {
            pengguna: true,
            layanan: true,
          },
        },
      },
      orderBy: {
        diperbaruiPada: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: progres,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data progres pesanan" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Buat progres pesanan baru
export async function POST(request: NextRequest) {
  try {
    const { pesananId, keterangan, persenProgres, urlDokumentasi } =
      await request.json();

    if (!pesananId || persenProgres === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Pesanan ID dan persentase progres diperlukan",
        },
        { status: 400 }
      );
    }

    if (persenProgres < 0 || persenProgres > 100) {
      return NextResponse.json(
        { success: false, error: "Persentase progres harus antara 0-100" },
        { status: 400 }
      );
    }

    const progres = await prisma.progresPesanan.create({
      data: {
        pesananId: parseInt(pesananId),
        keterangan,
        persenProgres: parseInt(persenProgres),
        urlDokumentasi,
      },
      include: {
        pesanan: {
          include: {
            pengguna: true,
            layanan: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: progres,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal membuat progres pesanan" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
