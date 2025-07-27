import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Ambil portofolio berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const portofolio = await prisma.portofolio.findUnique({
      where: { id: parseInt(id) },
    });

    if (!portofolio) {
      return NextResponse.json(
        { success: false, error: "Portofolio tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: portofolio,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data portofolio" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update portofolio
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { judul, deskripsi, urlGambar, tanggalSelesai } =
      await request.json();

    const updateData: any = {};
    if (judul !== undefined) updateData.judul = judul;
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (urlGambar !== undefined) updateData.urlGambar = urlGambar;
    if (tanggalSelesai !== undefined) {
      updateData.tanggalSelesai = tanggalSelesai
        ? new Date(tanggalSelesai)
        : null;
    }

    const portofolio = await prisma.portofolio.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: portofolio,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Portofolio tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Gagal memperbarui portofolio" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Hapus portofolio
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.portofolio.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: "Portofolio berhasil dihapus",
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Portofolio tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Gagal menghapus portofolio" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
