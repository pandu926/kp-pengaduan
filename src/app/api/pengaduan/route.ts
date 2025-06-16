import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
// import { isAuthorized } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const data = await prisma.pengaduan.findMany({
      where: userId ? { userId: Number(userId) } : undefined,
      orderBy: { tanggal: "desc" },
      include: { admin: true, user: true },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /pengaduan error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pengaduan" },
      { status: 500 }
    );
  }
}

// POST: Buat pengaduan publik (tidak perlu login)
export async function POST(req: Request) {
  try {
    const { isi, lokasi, gambar, userId } = await req.json();

    const newPengaduan = await prisma.pengaduan.create({
      data: {
        isi,
        lokasi,
        gambar,
        userId,
      },
    });

    return NextResponse.json(newPengaduan, { status: 201 });
  } catch (error) {
    console.error("POST /pengaduan error:", error);
    return NextResponse.json(
      { error: "Gagal mengirim pengaduan" },
      { status: 500 }
    );
  }
}
