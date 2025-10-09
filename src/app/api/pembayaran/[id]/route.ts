import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  notifyPembayaranDiverifikasi,
  notifyPembayaranDitolak,
  notifyBuktiPembayaran,
} from "@/lib/notification";

const prisma = new PrismaClient();

// PATCH - Update pembayaran (upload bukti atau verifikasi)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Ambil pembayaran beserta pesanan dan pembayaran lainnya
    const pembayaran = await prisma.pembayaran.findUnique({
      where: { id: parseInt(id) },
      include: {
        pesanan: {
          include: {
            pengguna: true,
            layanan: true,
            pembayaran: true,
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

    const userEmail = pembayaran.pesanan?.pengguna?.email || "-";
    const layananNama =
      pembayaran.pesanan?.layanan?.nama || "Layanan tidak tersedia";

    let updateData: any = {};
    let message = "";

    // Case 1: Upload bukti pembayaran
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

      // Kirim email notifikasi ke admin
      await notifyBuktiPembayaran({
        orderId: pembayaran.pesanan?.id || 0,
        namaPelanggan: pembayaran.pesanan?.namaPelanggan || "-",
        jumlah: pembayaran.jumlah,
      });
    }

    // Case 2: Verifikasi pembayaran
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

      // Update pesanan sesuai tipe pembayaran
      if (body.disetujui) {
        if (pembayaran.tipePembayaran === "DP") {
          const hargaKesepakatan = pembayaran.pesanan?.hargaDisepakati || 0;
          const jumlahDP = Number(pembayaran.jumlah);
          const sisaPelunasan = Number(hargaKesepakatan) - jumlahDP;

          const sudahAdaPelunasan = pembayaran.pesanan?.pembayaran.some(
            (p) => p.tipePembayaran === "PELUNASAN"
          );

          if (!sudahAdaPelunasan && sisaPelunasan > 0) {
            await prisma.pembayaran.create({
              data: {
                pesananId: pembayaran.pesananId,
                jumlah: sisaPelunasan,
                tipePembayaran: "PELUNASAN",
                statusPembayaran: "BELUM_BAYAR",
              },
            });
            message = `DP diverifikasi, pelunasan sebesar Rp ${sisaPelunasan.toLocaleString(
              "id-ID"
            )} telah dibuat.`;
          } else {
            message = "Pembayaran DP berhasil diverifikasi";
          }

          await prisma.pesanan.update({
            where: { id: pembayaran.pesananId },
            data: { status: "PROSES_PEMBANGUNAN" },
          });
        } else if (pembayaran.tipePembayaran === "PELUNASAN") {
          await prisma.pesanan.update({
            where: { id: pembayaran.pesananId },
            data: { status: "SELESAI" },
          });
          message = "Pembayaran pelunasan diverifikasi, pesanan selesai";
        } else {
          message = "Pembayaran berhasil diverifikasi";
        }

        // Kirim email diverifikasi
        await notifyPembayaranDiverifikasi(
          {
            orderId: pembayaran.pesanan?.id || 0,
            namaPelanggan: pembayaran.pesanan?.namaPelanggan || "-",
            jumlah: pembayaran.jumlah,
          },
          userEmail
        );
      } else {
        message = "Pembayaran ditolak";

        // Kirim email pembayaran ditolak
        await notifyPembayaranDitolak(
          {
            orderId: pembayaran.pesanan?.id || 0,
            namaPelanggan: pembayaran.pesanan?.namaPelanggan || "-",
            jumlah: pembayaran.jumlah,
          },
          userEmail
        );
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
            pembayaran: true,
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
