import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Ambil daftar pembayaran
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const pesananId = searchParams.get('pesananId');
    const penggunaId = searchParams.get('penggunaId');

    const where: any = {};
    
    if (status) {
      where.statusPembayaran = status;
    }
    
    if (pesananId) {
      where.pesananId = parseInt(pesananId);
    }

    if (penggunaId) {
      where.pesanan = {
        penggunaId: parseInt(penggunaId)
      };
    }

    const pembayaran = await prisma.pembayaran.findMany({
      where,
      include: {
        pesanan: {
          include: {
            pengguna: {
              select: {
                id: true,
                nama: true,
                email: true
              }
            },
            layanan: {
              select: {
                id: true,
                nama: true,
                deskripsi: true
              }
            }
          }
        },
        diverifikasiOleh: {
          select: {
            id: true,
            nama: true,
            email: true
          }
        }
      },
      orderBy: {
        dibuatPada: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: pembayaran
    });
  } catch (error) {
    console.error('Error fetching pembayaran:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data pembayaran' },
      { status: 500 }
    );
  }
}

// POST - Buat pembayaran baru (auto-generate saat pesanan diterima)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pesananId, jumlah } = body;

    // Validasi input
    if (!pesananId || !jumlah) {
      return NextResponse.json(
        { success: false, error: 'pesananId dan jumlah wajib diisi' },
        { status: 400 }
      );
    }

    // Validasi pesanan exists
    const pesanan = await prisma.pesanan.findUnique({
      where: { id: pesananId },
      include: { pembayaran: true }
    });

    if (!pesanan) {
      return NextResponse.json(
        { success: false, error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      );
    }

    // Cek apakah pembayaran sudah ada
    if (pesanan.pembayaran) {
      return NextResponse.json(
        { success: false, error: 'Pembayaran sudah ada untuk pesanan ini' },
        { status: 400 }
      );
    }

    // Cek status pesanan
    if (pesanan.status !== 'DITERIMA') {
      return NextResponse.json(
        { success: false, error: 'Pembayaran hanya bisa dibuat untuk pesanan yang sudah diterima' },
        { status: 400 }
      );
    }

    // Buat pembayaran baru
    const pembayaran = await prisma.pembayaran.create({
      data: {
        pesananId,
        jumlah,
        statusPembayaran: 'BELUM_BAYAR'
      },
      include: {
        pesanan: {
          include: {
            pengguna: true,
            layanan: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: pembayaran,
      message: 'Pembayaran berhasil dibuat'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating pembayaran:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat pembayaran' },
      { status: 500 }
    );
  }
}