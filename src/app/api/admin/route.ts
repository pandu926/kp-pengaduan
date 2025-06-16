import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { isAuthorized } from "@/lib/auth";

const prisma = new PrismaClient();

// GET semua admin
export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admins = await prisma.admin.findMany();
  return NextResponse.json(admins);
}

// POST tambah admin baru
export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { nama, username, password } = await req.json();

  if (!nama || !username || !password) {
    return NextResponse.json(
      { error: "Semua field wajib diisi" },
      { status: 400 }
    );
  }

  const newAdmin = await prisma.admin.create({
    data: { nama, username, password },
  });

  return NextResponse.json(newAdmin, { status: 201 });
}
