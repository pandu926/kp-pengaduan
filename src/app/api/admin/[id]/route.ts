import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { isAuthorized } from "@/lib/auth";

const prisma = new PrismaClient();

// GET user by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = parseInt(params.id);
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data user" },
      { status: 500 }
    );
  }
}

// PUT update user by ID
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = parseInt(params.id);
    const { nik, nama, kontak } = await req.json();

    if (!nik || !nama || !kontak) {
      return NextResponse.json(
        { error: "nik, nama, dan kontak wajib diisi" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { nik, nama, kontak },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal memperbarui user" },
      { status: 500 }
    );
  }
}

// DELETE user by ID
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = parseInt(params.id);
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal menghapus user" },
      { status: 500 }
    );
  }
}
