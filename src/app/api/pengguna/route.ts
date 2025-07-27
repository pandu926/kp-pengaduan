import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Ambil semua pengguna
export async function GET() {
  try {
    const pengguna = await prisma.pengguna.findMany({
      include: {
        pesanan: {
          include: {
            layanan: true,
          },
        },
      },
      orderBy: {
        dibuatPada: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: pengguna,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data pengguna" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Buat pengguna baru
