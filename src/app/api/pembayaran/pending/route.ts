import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET_PENDING(request: NextRequest) {
  try {
    const pembayaranPending = await prisma.pembayaran.findMany({
      where: {
        statusPembayaran: "MENUNGGU_VERIFIKASI",
      },
      include: {
        pesanan: {
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
        },
      },
      orderBy: {
        tanggalBayar: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: pembayaranPending,
      count: pembayaranPending.length,
    });
  } catch (error) {
    console.error("Error fetching pending pembayaran:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil pembayaran pending" },
      { status: 500 }
    );
  }
}
