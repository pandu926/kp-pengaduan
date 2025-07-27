"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";

interface Pesanan {
  id: number;
  layanan: {
    nama: string;
    urlGambar?: string;
  } | null;
  hargaDisepakati: string;
  status: string;
  lokasi: string;
  catatan: string;
  tanggalPesan: string;
  progres: {
    persenProgres: number;
    keterangan?: string;
    urlDokumentasi?: string;
    diperbaruiPada: string;
  }[];
}

export default function DashboardPage() {
  const { data: session, status: authStatus } = useSession();
  console.log(session);
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPesanan = async () => {
      if (session?.user?.id) {
        const res = await axios.get(`/api/pesanan?userId=${session.user.id}`);
        setPesanan(res.data);
        setLoading(false);
      }
    };
    fetchPesanan();
  }, [session]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">
        🧾 Riwayat Pemesanan Anda
      </h1>

      {loading ? (
        <p className="text-gray-500">Memuat data...</p>
      ) : pesanan.length === 0 ? (
        <p className="text-gray-500">Belum ada pesanan.</p>
      ) : (
        <div className="space-y-6">
          {pesanan.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow-md p-5 border border-blue-100"
            >
              <div className="flex items-center gap-4">
                {p.layanan?.urlGambar && (
                  <img
                    src={p.layanan.urlGambar}
                    alt={p.layanan.nama}
                    className="w-16 h-16 rounded-md object-cover"
                  />
                )}
                <div>
                  <h2 className="text-lg font-semibold text-blue-600">
                    {p.layanan?.nama ?? "Layanan Tidak Diketahui"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Status:{" "}
                    <span className="font-medium text-black">{p.status}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-1 text-sm text-gray-700">
                <p>💰 Harga: Rp {Number(p.hargaDisepakati).toLocaleString()}</p>
                <p>📍 Lokasi: {p.lokasi ?? "-"}</p>
                <p>
                  📆 Tanggal: {new Date(p.tanggalPesan).toLocaleDateString()}
                </p>
                <p>📝 Catatan: {p.catatan ?? "-"}</p>
                <p>📈 Progres: {p.progres.at(-1)?.persenProgres ?? 0}%</p>
              </div>

              {p.progres.at(-1)?.urlDokumentasi && (
                <img
                  src={p.progres.at(-1)?.urlDokumentasi}
                  alt="Progres"
                  className="mt-4 w-full rounded-md border border-gray-200"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
