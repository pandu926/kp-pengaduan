import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

// GET - Ambil semua admin
export async function GET() {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        nama: true,
        email: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: admins,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data admin" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Buat admin baru
export async function POST(request: NextRequest) {
  try {
    const { nama, email, kataSandi } = await request.json();

    if (!nama || !email || !kataSandi) {
      return NextResponse.json(
        { success: false, error: "Nama, email, dan kata sandi diperlukan" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(kataSandi, 12);

    const admin = await prisma.admin.create({
      data: {
        nama,
        email,
        kataSandi: hashedPassword,
      },
      select: {
        id: true,
        nama: true,
        email: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: admin,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Gagal membuat admin" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
