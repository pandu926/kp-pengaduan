import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  await prisma.admin.upsert({
    where: { email: "admin@pandu.com" },
    update: {}, // tidak update kalau sudah ada
    create: {
      nama: "Super Admin",
      email: "admin@pandu.com",
      kataSandi: hashedPassword,
    },
  });

  console.log("✅ Admin seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
