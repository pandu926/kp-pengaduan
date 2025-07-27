import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, StatusPesanan } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Ambil pesanan berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pesanan = await prisma.pesanan.findUnique({
      where: { id: parseInt(id) },
      include: {
        pengguna: true,
        layanan: true,
        progres: {
          orderBy: {
            diperbaruiPada: "desc",
          },
        },
      },
    });

    if (!pesanan) {
      return NextResponse.json(
        { success: false, error: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: pesanan,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data pesanan" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update pesanan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { layananId, hargaDisepakati, status, lokasi, catatan } =
      await request.json();

    const updateData: any = {};
    if (layananId !== undefined)
      updateData.layananId = layananId ? parseInt(layananId) : null;
    if (hargaDisepakati !== undefined)
      updateData.hargaDisepakati = hargaDisepakati;
    if (status !== undefined) updateData.status = status as StatusPesanan;
    if (lokasi !== undefined) updateData.lokasi = lokasi;
    if (catatan !== undefined) updateData.catatan = catatan;

    const pesanan = await prisma.pesanan.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        pengguna: true,
        layanan: true,
        progres: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: pesanan,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Gagal memperbarui pesanan" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Hapus pesanan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.pesanan.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: "Pesanan berhasil dihapus",
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Gagal menghapus pesanan" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
