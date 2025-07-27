import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Ambil pengguna berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pengguna = await prisma.pengguna.findUnique({
      where: { id: parseInt(id) },
      include: {
        pesanan: {
          include: {
            layanan: true,
            progres: true,
          },
        },
      },
    });

    if (!pengguna) {
      return NextResponse.json(
        { success: false, error: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

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

// PUT - Update pengguna
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { nama, email } = await request.json();

    const pengguna = await prisma.pengguna.update({
      where: { id: parseInt(id) },
      data: { nama, email },
    });

    return NextResponse.json({
      success: true,
      data: pengguna,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Pengguna tidak ditemukan" },
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
      { success: false, error: "Gagal memperbarui pengguna" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Hapus pengguna
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.pengguna.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: "Pengguna berhasil dihapus",
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Gagal menghapus pengguna" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
