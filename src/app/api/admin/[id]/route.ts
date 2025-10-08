import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// GET - Ambil admin berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const admin = await prisma.admin.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nama: true,
        email: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Admin tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: admin,
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

// PUT - Update admin
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { nama, email, kataSandi } = await request.json();

    const updateData: any = { nama, email };

    if (kataSandi) {
      updateData.kataSandi = await bcrypt.hash(kataSandi, 12);
    }

    const admin = await prisma.admin.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        nama: true,
        email: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: admin,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Admin tidak ditemukan" },
        { status: 404 }
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Gagal memperbarui admin" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Hapus admin
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.admin.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: "Admin berhasil dihapus",
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Admin tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Gagal menghapus admin" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
