"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

type Pengaduan = {
  id: number;
  isi: string;
  lokasi?: string;
  gambar?: string;
  tanggal: string;
  status: "MENUNGGU" | "DIPROSES" | "SELESAI" | "DITOLAK";
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [laporan, setLaporan] = useState<Pengaduan[]>([]);
  console.log(session);

  useEffect(() => {
    const fetchData = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          // Step 1: Ambil data user dari email
          const userRes = await axios.get(
            "/api/user?email=" + session.user.email
          );
          const user = userRes.data;

          if (user?.id) {
            // Step 2: Ambil laporan pengaduan berdasarkan userId
            const laporanRes = await axios.get(
              `/api/pengaduan?userId=${user.id}`
            );
            setLaporan(laporanRes.data);
          }
        } catch (error) {
          console.error("Gagal ambil data:", error);
        }
      }
    };

    fetchData();
  }, [session, status]);

  if (status === "loading") {
    return <p>Loading session...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        📋 Riwayat Laporan
      </h1>
      <div className="grid gap-4">
        {laporan.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-white shadow-md rounded-xl hover:shadow-lg transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-800 font-semibold">{item.isi}</p>
                {item.lokasi && (
                  <p className="text-sm text-gray-500">📍 {item.lokasi}</p>
                )}
                <p className="text-xs text-gray-400">
                  {new Date(item.tanggal).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${
                  item.status === "MENUNGGU"
                    ? "bg-yellow-100 text-yellow-800"
                    : item.status === "DIPROSES"
                    ? "bg-blue-100 text-blue-800"
                    : item.status === "SELESAI"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
