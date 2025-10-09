// app/api/pesanan/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, StatusPesanan } from "@prisma/client";
import {
  notifyPesananBaru,
  notifyPesananDiterima,
  notifyPesananDitolak,
  notifyBuktiPembayaran,
  notifyPembayaranDiverifikasi,
  notifyPembayaranDitolak,
  notifyPesananSelesai,
} from "@/lib/notification";
const prisma = new PrismaClient();

// GET - Ambil pesanan berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID
    const pesananId = parseInt(id);
    if (isNaN(pesananId)) {
      return NextResponse.json(
        { success: false, error: "ID pesanan tidak valid" },
        { status: 400 }
      );
    }

    const pesanan = await prisma.pesanan.findUnique({
      where: { id: pesananId },
      include: {
        pengguna: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
        layanan: true,
        pembayaran: {
          orderBy: {
            dibuatPada: "asc",
          },
          include: {
            diverifikasiOleh: {
              select: {
                id: true,
                nama: true,
                email: true,
              },
            },
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
    console.error("Error fetching pesanan:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data pesanan" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update pesanan (full update)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pesananId = parseInt(id);

    if (isNaN(pesananId)) {
      return NextResponse.json(
        { success: false, error: "ID pesanan tidak valid" },
        { status: 400 }
      );
    }

    const {
      layananId,
      hargaDisepakati,
      status,
      lokasi,
      catatan,
      namaPelanggan,
      nomerHp,
    } = await request.json();

    // Validate status if provided
    if (status && !Object.values(StatusPesanan).includes(status)) {
      return NextResponse.json(
        { success: false, error: "Status pesanan tidak valid" },
        { status: 400 }
      );
    }

    // Validate phone number if provided
    if (nomerHp) {
      const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
      if (!phoneRegex.test(nomerHp)) {
        return NextResponse.json(
          { success: false, error: "Format nomor HP tidak valid" },
          { status: 400 }
        );
      }
    }

    // Check if layanan exists (if provided and not null)
    if (layananId) {
      const layanan = await prisma.layanan.findUnique({
        where: { id: parseInt(layananId) },
      });
      if (!layanan) {
        return NextResponse.json(
          { success: false, error: "Layanan tidak ditemukan" },
          { status: 404 }
        );
      }
    }

    const updateData: any = {};
    if (layananId !== undefined)
      updateData.layananId = layananId ? parseInt(layananId) : null;
    if (hargaDisepakati !== undefined)
      updateData.hargaDisepakati = hargaDisepakati
        ? parseFloat(hargaDisepakati)
        : null;
    if (status !== undefined) updateData.status = status as StatusPesanan;
    if (lokasi !== undefined) updateData.lokasi = lokasi;
    if (catatan !== undefined) updateData.catatan = catatan;
    if (namaPelanggan !== undefined) updateData.namaPelanggan = namaPelanggan;
    if (nomerHp !== undefined) updateData.nomerHp = nomerHp.toString();

    const pesanan = await prisma.pesanan.update({
      where: { id: pesananId },
      data: updateData,
      include: {
        pengguna: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
        layanan: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: pesanan,
      message: "Pesanan berhasil diperbarui",
    });
  } catch (error: any) {
    console.error("Error updating pesanan:", error);

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

// PATCH - Update status pesanan (partial update for status only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Cek pesanan exists
    const pesanan = await prisma.pesanan.findUnique({
      where: { id: parseInt(id) },
      include: { pembayaran: true },
    });

    if (!pesanan) {
      return NextResponse.json(
        { success: false, error: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    // Update status
    if (body.status) {
      updateData.status = body.status;
    }

    // Update harga (jika status DITERIMA)
    if (body.hargaDisepakati !== undefined) {
      updateData.hargaDisepakati = body.hargaDisepakati;

      // Auto-create pembayaran DP dan PELUNASAN jika status DITERIMA dan belum ada pembayaran
      if (body.status === "DITERIMA" && pesanan.pembayaran.length === 0) {
        // Validasi harga harus ada
        if (!body.hargaDisepakati || body.hargaDisepakati <= 0) {
          return NextResponse.json(
            {
              success: false,
              error: "Harga disepakati harus diisi dan lebih dari 0",
            },
            { status: 400 }
          );
        }

        const hargaTotal = body.hargaDisepakati;
        const jumlahDP = hargaTotal * 0.2; //
        const jumlahPelunasan = hargaTotal - jumlahDP;

        // Buat pembayaran DP
        await prisma.pembayaran.create({
          data: {
            pesananId: parseInt(id),
            jumlah: jumlahDP,
            tipePembayaran: "DP",
            statusPembayaran: "BELUM_BAYAR",
          },
        });

        // Buat pembayaran PELUNASAN
        await prisma.pembayaran.create({
          data: {
            pesananId: parseInt(id),
            jumlah: jumlahPelunasan,
            tipePembayaran: "PELUNASAN",
            statusPembayaran: "BELUM_BAYAR",
          },
        });
      }
    }

    // Update catatan admin
    if (body.catatanAdmin !== undefined) {
      updateData.catatanAdmin = body.catatanAdmin;
    }

    // Update pesanan
    const updatedPesanan = await prisma.pesanan.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        pengguna: {
          select: {
            id: true,
            nama: true,
            email: true,
          },
        },
        layanan: true,
        pembayaran: {
          orderBy: {
            dibuatPada: "asc",
          },
          include: {
            diverifikasiOleh: {
              select: {
                id: true,
                nama: true,
                email: true,
              },
            },
          },
        },
      },
    });
    try {
      const userEmail = updatedPesanan.pengguna?.email || "-";
      const layananNama =
        updatedPesanan.layanan?.nama || "Layanan tidak tersedia";

      if (body.status === "DITERIMA") {
        // Email ke pelanggan
        await notifyPesananDiterima(
          {
            orderId: updatedPesanan.id,
            namaPelanggan: updatedPesanan.namaPelanggan,
            layanan: layananNama,
            hargaDisepakati: updatedPesanan.hargaDisepakati!,
          },
          userEmail
        );
      } else if (body.status === "DITOLAK") {
        await notifyPesananDitolak(
          {
            orderId: updatedPesanan.id,
            namaPelanggan: updatedPesanan.namaPelanggan,
            layanan: layananNama,
            alasanPenolakan: body.alasanPenolakan || "Tidak ada keterangan",
          },
          userEmail
        );
      } else if (body.status === "SELESAI") {
        await notifyPesananSelesai(
          {
            orderId: updatedPesanan.id,
            namaPelanggan: updatedPesanan.namaPelanggan,
            layanan: layananNama,
          },
          userEmail
        );
      }
    } catch (err) {
      console.error("Gagal mengirim email notifikasi:", err);
    }

    return NextResponse.json({
      success: true,
      data: updatedPesanan,
      message:
        "Pesanan berhasil diupdate. Pembayaran DP dan Pelunasan telah dibuat.",
    });
  } catch (error) {
    console.error("Error updating pesanan:", error);
    return NextResponse.json(
      { success: false, error: "Gagal update pesanan" },
      { status: 500 }
    );
  }
}

// DELETE - Hapus pesanan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pesananId = parseInt(id);

    if (isNaN(pesananId)) {
      return NextResponse.json(
        { success: false, error: "ID pesanan tidak valid" },
        { status: 400 }
      );
    }

    // Check if pesanan exists and can be deleted
    const existingPesanan = await prisma.pesanan.findUnique({
      where: { id: pesananId },
    });

    if (!existingPesanan) {
      return NextResponse.json(
        { success: false, error: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Optional: Prevent deletion of completed orders
    if (existingPesanan.status === StatusPesanan.SELESAI) {
      return NextResponse.json(
        {
          success: false,
          error: "Tidak dapat menghapus pesanan yang sudah selesai",
        },
        { status: 400 }
      );
    }

    await prisma.pesanan.delete({
      where: { id: pesananId },
    });

    return NextResponse.json({
      success: true,
      message: "Pesanan berhasil dihapus",
    });
  } catch (error: any) {
    console.error("Error deleting pesanan:", error);

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
