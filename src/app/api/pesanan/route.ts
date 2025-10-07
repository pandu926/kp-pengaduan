// app/api/pesanan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, StatusPesanan } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Ambil semua pesanan
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const penggunaId = searchParams.get("penggunaId");
    const status = searchParams.get("status");

    const where: any = {};
    if (penggunaId) where.penggunaId = parseInt(penggunaId);
    if (
      status &&
      Object.values(StatusPesanan).includes(status as StatusPesanan)
    ) {
      where.status = status as StatusPesanan;
    }

    const pesanan = await prisma.pesanan.findMany({
      where,
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
      orderBy: {
        dibuatPada: "desc",
      },
    });

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

// Helper function to validate and format phone number
const validateAndFormatPhoneNumber = (
  phone: string
): { isValid: boolean; formatted?: string; error?: string } => {
  if (!phone) {
    return { isValid: false, error: "Nomor HP tidak boleh kosong" };
  }

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length < 9) {
    return {
      isValid: false,
      error: "Nomor HP terlalu pendek (minimal 9 digit)",
    };
  }

  if (cleaned.length > 15) {
    return {
      isValid: false,
      error: "Nomor HP terlalu panjang (maksimal 15 digit)",
    };
  }

  let formatted = cleaned;

  // Convert to 62 format
  if (cleaned.startsWith("62")) {
    formatted = cleaned;
  } else if (cleaned.startsWith("0")) {
    formatted = "62" + cleaned.substring(1);
  } else {
    formatted = "62" + cleaned;
  }

  // Validate Indonesian phone number patterns
  const indonesianPatterns = [
    /^62[8][0-9]{8,11}$/, // Mobile: 62-8xx-xxxx-xxxx
    /^62[2-7][0-9]{7,10}$/, // Landline: 62-2x-xxxx-xxxx, etc.
  ];

  const isValidPattern = indonesianPatterns.some((pattern) =>
    pattern.test(formatted)
  );

  if (!isValidPattern) {
    return {
      isValid: false,
      error: "Format nomor HP tidak valid. Gunakan nomor Indonesia yang benar",
    };
  }

  return { isValid: true, formatted };
};

// POST - Buat pesanan baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      penggunaId,
      layananId,
      hargaDisepakati,
      lokasi,
      catatan,
      nomorHp,
      namaPelanggan,
    } = body;

    // Basic validation
    if (!namaPelanggan || !namaPelanggan.trim()) {
      return NextResponse.json(
        { success: false, error: "Nama pelanggan tidak boleh kosong" },
        { status: 400 }
      );
    }

    if (!nomorHp || !nomorHp.trim()) {
      return NextResponse.json(
        { success: false, error: "Nomor HP tidak boleh kosong" },
        { status: 400 }
      );
    }

    if (!lokasi || !lokasi.trim()) {
      return NextResponse.json(
        { success: false, error: "Lokasi tidak boleh kosong" },
        { status: 400 }
      );
    }

    if (!layananId) {
      return NextResponse.json(
        { success: false, error: "Layanan harus dipilih" },
        { status: 400 }
      );
    }

    // Validate phone number
    const phoneValidation = validateAndFormatPhoneNumber(nomorHp);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { success: false, error: phoneValidation.error },
        { status: 400 }
      );
    }

    // Check if pengguna exists (if provided)
    if (penggunaId) {
      const pengguna = await prisma.pengguna.findUnique({
        where: { id: parseInt(penggunaId) },
      });
      if (!pengguna) {
        return NextResponse.json(
          { success: false, error: "Pengguna tidak ditemukan" },
          { status: 404 }
        );
      }
    }

    // Check if layanan exists
    const layanan = await prisma.layanan.findUnique({
      where: { id: parseInt(layananId) },
    });
    if (!layanan) {
      return NextResponse.json(
        { success: false, error: "Layanan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Validate harga if provided
    let finalHarga = null;
    if (hargaDisepakati !== undefined && hargaDisepakati !== null) {
      const parsedHarga = parseFloat(hargaDisepakati);
      if (isNaN(parsedHarga) || parsedHarga < 0) {
        return NextResponse.json(
          { success: false, error: "Format harga tidak valid" },
          { status: 400 }
        );
      }
      finalHarga = parsedHarga;
    }

    // Create the order
    const pesanan = await prisma.pesanan.create({
      data: {
        penggunaId: penggunaId ? parseInt(penggunaId) : null,
        layananId: parseInt(layananId),
        hargaDisepakati: finalHarga,
        tanggalPesan: new Date(),
        lokasi: lokasi.trim(),
        catatan: catatan ? catatan.trim() : null,
        nomorHp: phoneValidation.formatted!,
        namaPelanggan: namaPelanggan.trim(),
        status: StatusPesanan.PENGAJUAN,
      },
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
    });

    return NextResponse.json(
      {
        success: true,
        data: pesanan,
        message: "Pesanan berhasil dibuat",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating pesanan:", error);

    // Handle specific Prisma errors
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Data duplikat terdeteksi" },
        { status: 409 }
      );
    }

    if (error.code === "P2003") {
      return NextResponse.json(
        { success: false, error: "Data referensi tidak valid" },
        { status: 400 }
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Data yang diminta tidak ditemukan" },
        { status: 404 }
      );
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: "Format data tidak valid" },
        { status: 400 }
      );
    }

    // Generic error handling
    return NextResponse.json(
      {
        success: false,
        error: "Gagal membuat pesanan. Silakan coba lagi.",
        detail:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
