"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

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
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "selesai":
        return "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm";
      case "diterima":
      case "proses":
        return "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm";
      case "pengajuan":
        return "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200 shadow-sm";
      case "ditolak":
        return "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200 shadow-sm";
      default:
        return "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border border-gray-200 shadow-sm";
    }
  };

  const formatStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pengajuan":
        return "Menunggu Persetujuan";
      case "diterima":
        return "Diterima";
      case "selesai":
        return "Selesai";
      case "ditolak":
        return "Ditolak";
      default:
        return status;
    }
  };

  return (
    <div
      className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-semibold backdrop-blur-sm ${getStatusStyle(
        status
      )}`}
    >
      <div className="w-2 h-2 rounded-full bg-current mr-2 opacity-75"></div>
      {formatStatus(status)}
    </div>
  );
};

const EmptyState = () => (
  <div className="text-center py-20">
    <div className="relative mx-auto mb-8">
      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl flex items-center justify-center shadow-lg">
        <svg
          className="w-10 h-10 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-pink-400 to-red-400 rounded-full shadow-lg"></div>
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-3">Belum Ada Pesanan</h3>
    <p className="text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">
      Mulai perjalanan Anda dengan memesan layanan yang tersedia. Riwayat
      pesanan akan muncul di sini.
    </p>
    <a
      href="/user/pemesanan"
      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
    >
      <svg
        className="w-5 h-5 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
      Buat Pesanan Pertama
    </a>
  </div>
);

const LoadingState = () => (
  <div className="space-y-6">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm animate-pulse"
      >
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl"></div>
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-1/3"></div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-4 bg-gray-200 rounded-lg"></div>
            <div className="h-4 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("semua");

  useEffect(() => {
    const fetchPesanan = async () => {
      if (session?.user?.id) {
        try {
          const res = await axios.get(
            `/api/pesanan?penggunaId=${session.user.id}`
          );
          const data = Array.isArray(res.data.data) ? res.data.data : [];
          setPesanan(data);
          setError(null);
        } catch (error) {
          console.error("Error fetching pesanan:", error);
          setError("Gagal memuat data pesanan");
          setPesanan([]);
        } finally {
          setLoading(false);
        }
      } else if (authStatus !== "loading") {
        setLoading(false);
      }
    };
    fetchPesanan();
  }, [session, authStatus]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const filteredPesanan =
    filterStatus === "semua"
      ? pesanan
      : pesanan.filter(
          (p) => p.status.toLowerCase() === filterStatus.toLowerCase()
        );

  const handleCardClick = (pesananId: number) => {
    router.push(`/user/pesanan/${pesananId}`);
  };

  const statusCounts = {
    semua: pesanan.length,
    pengajuan: pesanan.filter((p) => p.status.toLowerCase() === "pengajuan")
      .length,
    diterima: pesanan.filter((p) => p.status.toLowerCase() === "diterima")
      .length,
    selesai: pesanan.filter((p) => p.status.toLowerCase() === "selesai").length,
    ditolak: pesanan.filter((p) => p.status.toLowerCase() === "ditolak").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Modern Header */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
              <h1 className="text-xl md:text-4xl font-black text-gray-900 tracking-tight">
                Riwayat Pesanan
              </h1>
            </div>
            <p className="text-md md:text-lg text-gray-600 font-medium">
              Pantau dan kelola semua pesanan layanan Anda
            </p>
            {pesanan.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>{pesanan.length} pesanan total</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href="/user/pemesanan"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-300 group"
            >
              <svg
                className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Buat Pesanan Baru
            </a>

            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-red-500/25 transform hover:-translate-y-1 transition-all duration-300 group"
            >
              <svg
                className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Filter Status */}
        {!loading && pesanan.length > 0 && (
          <div className="mb-8 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <svg
                className="w-5 h-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <h3 className="text-lg font-bold text-gray-900">Filter Status</h3>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFilterStatus("semua")}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                  filterStatus === "semua"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transform scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Semua ({statusCounts.semua})
              </button>

              <button
                onClick={() => setFilterStatus("pengajuan")}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                  filterStatus === "pengajuan"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 transform scale-105"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                }`}
              >
                Pengajuan ({statusCounts.pengajuan})
              </button>

              <button
                onClick={() => setFilterStatus("diterima")}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                  filterStatus === "diterima"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30 transform scale-105"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                }`}
              >
                Diterima ({statusCounts.diterima})
              </button>

              <button
                onClick={() => setFilterStatus("selesai")}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                  filterStatus === "selesai"
                    ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30 transform scale-105"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                }`}
              >
                Selesai ({statusCounts.selesai})
              </button>

              <button
                onClick={() => setFilterStatus("ditolak")}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                  filterStatus === "ditolak"
                    ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30 transform scale-105"
                    : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                }`}
              >
                Ditolak ({statusCounts.ditolak})
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <LoadingState />
        ) : error ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-50 to-pink-100 rounded-3xl flex items-center justify-center shadow-lg">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Terjadi Kesalahan
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Muat Ulang
            </button>
          </div>
        ) : !Array.isArray(pesanan) || pesanan.length === 0 ? (
          <EmptyState />
        ) : filteredPesanan.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl flex items-center justify-center shadow-lg">
              <svg
                className="w-10 h-10 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Tidak Ada Pesanan
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              Tidak ada pesanan dengan status "
              {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}"
            </p>
            <button
              onClick={() => setFilterStatus("semua")}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Lihat Semua Pesanan
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredPesanan.map((p, index) => (
              <div
                key={p.id}
                onClick={() => handleCardClick(p.id)}
                className="group bg-white rounded-3xl border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 transform hover:-translate-y-1 cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Card Header */}
                <div className="p-8">
                  <div className="flex items-start gap-6">
                    {p.layanan?.urlGambar ? (
                      <div className="hidden md:block relative overflow-hidden rounded-2xl w-24 h-24 flex-shrink-0 ring-4 ring-gray-100 group-hover:ring-blue-100 transition-all duration-300">
                        <img
                          src={p.layanan.urlGambar}
                          alt={p.layanan.nama}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    ) : (
                      <div className="hidden md:flex w-24 h-24 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-2xl items-center justify-center flex-shrink-0 ring-4 ring-gray-100 group-hover:ring-blue-100 transition-all duration-300">
                        <svg
                          className="w-10 h-10 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row capitalize sm:items-start sm:justify-between gap-4 mb-4">
                        <div className="min-w-0">
                          <h2 className="text-2xl font-bold text-gray-900 truncate mb-2">
                            {p.layanan?.nama ?? "Layanan Tidak Diketahui"}
                          </h2>
                          <div className="flex items-center gap-3">
                            <div className="text-lg md:text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                              Rp{" "}
                              {Number(p.hargaDisepakati).toLocaleString(
                                "id-ID"
                              )}
                            </div>
                            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                              #{p.id.toString().padStart(4, "0")}
                            </div>
                          </div>
                        </div>
                        <StatusBadge status={p.status} />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            Dipesan pada{" "}
                            {new Date(p.tanggalPesan).toLocaleDateString(
                              "id-ID",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>

                        {p.lokasi && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span className="truncate">{p.lokasi}</span>
                          </div>
                        )}

                        {p.catatan && (
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <svg
                              className="w-4 h-4 text-gray-400 mt-0.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <span className="line-clamp-2">{p.catatan}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
