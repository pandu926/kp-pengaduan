import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Detail pembayaran by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const pembayaran = await prisma.pembayaran.findUnique({
      where: { id },
      include: {
        pesanan: {
          include: {
            pengguna: {
              select: {
                id: true,
                nama: true,
                email: true,
              },
            },
            layanan: {
              select: {
                id: true,
                nama: true,
                deskripsi: true,
              },
            },
          },
        },
        diverifikasiOleh: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
      },
    });

    if (!pembayaran) {
      return NextResponse.json(
        { success: false, error: "Pembayaran tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: pembayaran,
    });
  } catch (error) {
    console.error("Error fetching pembayaran:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil detail pembayaran" },
      { status: 500 }
    );
  }
}

// PATCH - Update pembayaran (upload bukti atau verifikasi)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    // Cek pembayaran exists
    const pembayaran = await prisma.pembayaran.findUnique({
      where: { id },
      include: { pesanan: true },
    });

    if (!pembayaran) {
      return NextResponse.json(
        { success: false, error: "Pembayaran tidak ditemukan" },
        { status: 404 }
      );
    }

    let updateData: any = {};
    let message = "";

    // Case 1: Upload bukti pembayaran (dari pelanggan)
    if (body.buktiPembayaran) {
      if (pembayaran.statusPembayaran === "DIVERIFIKASI") {
        return NextResponse.json(
          {
            success: false,
            error: "Pembayaran sudah diverifikasi, tidak bisa diubah",
          },
          { status: 400 }
        );
      }

      updateData = {
        buktiPembayaran: body.buktiPembayaran,
        metodePembayaran: body.metodePembayaran || "TRANSFER",
        tanggalBayar: new Date(),
        statusPembayaran: "MENUNGGU_VERIFIKASI",
      };
      message = "Bukti pembayaran berhasil diupload, menunggu verifikasi admin";
    }

    // Case 2: Verifikasi pembayaran (dari admin)
    else if (body.action === "verifikasi") {
      if (pembayaran.statusPembayaran !== "MENUNGGU_VERIFIKASI") {
        return NextResponse.json(
          {
            success: false,
            error: "Pembayaran belum dalam status menunggu verifikasi",
          },
          { status: 400 }
        );
      }

      if (!body.adminId) {
        return NextResponse.json(
          { success: false, error: "adminId wajib diisi" },
          { status: 400 }
        );
      }

      const statusBaru = body.disetujui ? "DIVERIFIKASI" : "DITOLAK";

      updateData = {
        statusPembayaran: statusBaru,
        diverifikasiOlehId: body.adminId,
        tanggalVerifikasi: new Date(),
        alasanPenolakan: body.disetujui ? null : body.alasanPenolakan,
      };

      // Update status pesanan jika diverifikasi
      if (body.disetujui) {
        await prisma.pesanan.update({
          where: { id: pembayaran.pesananId },
          data: { status: "SELESAI" },
        });
        message = "Pembayaran berhasil diverifikasi, pesanan selesai";
      } else {
        message = "Pembayaran ditolak";
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Action tidak valid" },
        { status: 400 }
      );
    }

    // Update pembayaran
    const updatedPembayaran = await prisma.pembayaran.update({
      where: { id },
      data: updateData,
      include: {
        pesanan: {
          include: {
            pengguna: true,
            layanan: true,
          },
        },
        diverifikasiOleh: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedPembayaran,
      message,
    });
  } catch (error) {
    console.error("Error updating pembayaran:", error);
    return NextResponse.json(
      { success: false, error: "Gagal update pembayaran" },
      { status: 500 }
    );
  }
}

// DELETE - Hapus pembayaran
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const pembayaran = await prisma.pembayaran.findUnique({
      where: { id },
    });

    if (!pembayaran) {
      return NextResponse.json(
        { success: false, error: "Pembayaran tidak ditemukan" },
        { status: 404 }
      );
    }

    if (pembayaran.statusPembayaran === "DIVERIFIKASI") {
      return NextResponse.json(
        {
          success: false,
          error: "Pembayaran yang sudah diverifikasi tidak bisa dihapus",
        },
        { status: 400 }
      );
    }

    await prisma.pembayaran.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Pembayaran berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting pembayaran:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus pembayaran" },
      { status: 500 }
    );
  }
}
