import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Ambil progres pesanan berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const progres = await prisma.progresPesanan.findUnique({
      where: { id: parseInt(id) },
      include: {
        pesanan: {
          include: {
            pengguna: true,
            layanan: true,
          },
        },
      },
    });

    if (!progres) {
      return NextResponse.json(
        { success: false, error: "Progres pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

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

// PUT - Update progres pesanan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { keterangan, persenProgres, urlDokumentasi } = await request.json();

    if (
      persenProgres !== undefined &&
      (persenProgres < 0 || persenProgres > 100)
    ) {
      return NextResponse.json(
        { success: false, error: "Persentase progres harus antara 0-100" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (keterangan !== undefined) updateData.keterangan = keterangan;
    if (persenProgres !== undefined)
      updateData.persenProgres = parseInt(persenProgres);
    if (urlDokumentasi !== undefined)
      updateData.urlDokumentasi = urlDokumentasi;
    updateData.diperbaruiPada = new Date();

    const progres = await prisma.progresPesanan.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        pesanan: {
          include: {
            pengguna: true,
            layanan: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: progres,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Progres pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Gagal memperbarui progres pesanan" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Hapus progres pesanan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.progresPesanan.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: "Progres pesanan berhasil dihapus",
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Progres pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Gagal menghapus progres pesanan" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
