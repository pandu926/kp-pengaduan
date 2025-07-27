import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Ambil layanan berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const layanan = await prisma.layanan.findUnique({
      where: { id: parseInt(id) },
      include: {
        pesanan: {
          include: {
            pengguna: true,
          },
        },
      },
    });

    if (!layanan) {
      return NextResponse.json(
        { success: false, error: "Layanan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: layanan,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data layanan" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update layanan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { nama, deskripsi, urlGambar } = await request.json();

    const layanan = await prisma.layanan.update({
      where: { id: parseInt(id) },
      data: {
        nama,
        deskripsi,
        urlGambar,
      },
    });

    return NextResponse.json({
      success: true,
      data: layanan,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Layanan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Gagal memperbarui layanan" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Hapus layanan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.layanan.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: "Layanan berhasil dihapus",
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Layanan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Gagal menghapus layanan" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
