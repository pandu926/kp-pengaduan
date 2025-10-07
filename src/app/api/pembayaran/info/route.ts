// app/api/pembayaran/info/route.ts
import { NextRequest, NextResponse } from "next/server";

// GET - Info rekening untuk pembayaran
export async function GET(request: NextRequest) {
  try {
    const infoRekening = {
      bank: "Bank Mandiri",
      nomorRekening: "1234567890",
      atasNama: "PT Konstruksi Jaya",
      catatan:
        "Silakan transfer sesuai jumlah yang tertera dan upload bukti pembayaran",
    };

    return NextResponse.json({
      success: true,
      data: infoRekening,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil info pembayaran" },
      { status: 500 }
    );
  }
}
