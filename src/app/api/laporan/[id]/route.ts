import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Ambil laporan berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const laporan = await prisma.laporan.findUnique({
      where: { id: parseInt(id) },
    });

    if (!laporan) {
      return NextResponse.json(
        { success: false, error: "Laporan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: laporan,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data laporan" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update laporan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { bulanLaporan, totalPesanan, totalPendapatan } =
      await request.json();

    const updateData: any = {};
    if (bulanLaporan !== undefined)
      updateData.bulanLaporan = new Date(bulanLaporan);
    if (totalPesanan !== undefined) updateData.totalPesanan = totalPesanan;
    if (totalPendapatan !== undefined)
      updateData.totalPendapatan = totalPendapatan;

    const laporan = await prisma.laporan.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: laporan,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Laporan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Gagal memperbarui laporan" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Hapus laporan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.laporan.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: "Laporan berhasil dihapus",
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Laporan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Gagal menghapus laporan" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
