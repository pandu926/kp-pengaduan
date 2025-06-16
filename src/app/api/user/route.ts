import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Proteksi semua method: GET, POST, DELETE
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  try {
    if (email) {
      // Ambil user berdasarkan email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      return NextResponse.json(user);
    } else {
      // Ambil semua user
      const users = await prisma.user.findMany();
      return NextResponse.json(users);
    }
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data user" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  // if (!isAuthorized(req)) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  try {
    const { email, nama, kontak } = await req.json();

    if (!email || !nama || !kontak) {
      return NextResponse.json(
        { error: "NIK, nama, dan kontak wajib diisi" },
        { status: 400 }
      );
    }

    const newUser = await prisma.user.create({ data: { email, nama, kontak } });
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "NIK sudah terdaftar" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Gagal menambahkan user" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  // if (!isAuthorized(req)) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  try {
    await prisma.user.deleteMany();
    return NextResponse.json({ message: "Semua user berhasil dihapus" });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus user" },
      { status: 500 }
    );
  }
}
