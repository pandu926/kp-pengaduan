import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Detail pembayaran by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const pembayaran = await prisma.pembayaran.findUnique({
      where: { id: parseInt(id) },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Cek pembayaran exists dengan include pembayaran lainnya
    const pembayaran = await prisma.pembayaran.findUnique({
      where: { id: parseInt(id) },
      include: {
        pesanan: {
          include: {
            pembayaran: true, // Include semua pembayaran untuk cek DP
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

      // Update status pesanan dan buat pelunasan jika DP diverifikasi
      if (body.disetujui) {
        // ✅ Cek apakah ini pembayaran DP
        if (pembayaran.tipePembayaran === "DP") {
          const hargaKesepakatan = pembayaran.pesanan.hargaDisepakati;

          if (!hargaKesepakatan) {
            return NextResponse.json(
              {
                success: false,
                error: "Harga kesepakatan belum ditentukan",
              },
              { status: 400 }
            );
          }

          // Hitung sisa pelunasan
          const jumlahDP = Number(pembayaran.jumlah);
          const sisaPelunasan = Number(hargaKesepakatan) - jumlahDP;

          // Cek apakah sudah ada pembayaran pelunasan
          const sudahAdaPelunasan = pembayaran.pesanan.pembayaran.some(
            (p) => p.tipePembayaran === "PELUNASAN"
          );

          if (!sudahAdaPelunasan && sisaPelunasan > 0) {
            // Buat pembayaran pelunasan otomatis
            await prisma.pembayaran.create({
              data: {
                pesananId: pembayaran.pesananId,
                jumlah: sisaPelunasan,
                tipePembayaran: "PELUNASAN",
                statusPembayaran: "BELUM_BAYAR",
              },
            });

            message = `Pembayaran DP berhasil diverifikasi. Pembayaran pelunasan sebesar Rp ${sisaPelunasan.toLocaleString(
              "id-ID"
            )} telah dibuat.`;
          } else {
            message = "Pembayaran DP berhasil diverifikasi";
          }

          // ✅ Update status pesanan ke PROSES_PEMBANGUNAN jika DP diverifikasi
          await prisma.pesanan.update({
            where: { id: pembayaran.pesananId },
            data: { status: "PROSES_PEMBANGUNAN" },
          });
        }
        // ✅ Jika pelunasan diverifikasi, update status pesanan ke SELESAI
        else if (pembayaran.tipePembayaran === "PELUNASAN") {
          await prisma.pesanan.update({
            where: { id: pembayaran.pesananId },
            data: { status: "SELESAI" },
          });
          message =
            "Pembayaran pelunasan berhasil diverifikasi, pesanan selesai";
        }
        // Untuk tipe lainnya (jika ada)
        else {
          message = "Pembayaran berhasil diverifikasi";
        }
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
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        pesanan: {
          include: {
            pengguna: true,
            layanan: true,
            pembayaran: true, // Include semua pembayaran
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const pembayaran = await prisma.pembayaran.findUnique({
      where: { id: parseInt(id) },
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
      where: { id: parseInt(id) },
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
