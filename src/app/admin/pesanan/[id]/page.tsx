"use client";
import React, { useEffect, useState, useCallback, ReactNode } from "react";
import {
  Calendar,
  Phone,
  MapPin,
  FileText,
  Clock,
  DollarSign,
  User,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronRight,
  Settings,
  MessageCircle,
  Download,
} from "lucide-react";
import { useParams } from "next/navigation";
import axios from "axios";
import Modal from "@/components/admin/Common/Modal";
import ProgresForm from "@/components/admin/Forms/ProgresForm";
import { StatusPesanan } from "@/lib/types";
import Swal from "sweetalert2";
// Types
interface Pengguna {
  id: number;
  nama: string;
  email: string;
  avatar?: string;
}

interface Layanan {
  id: number;
  nama: string;
  kategori: string;
  deskripsi: string;
}

interface ProgresPesanan {
  urlDokumentasi: React.JSX.Element;
  keterangan: ReactNode;
  persenProgres: number;
  diperbaruiPada: string | number | Date;
  id: number;
  tahap: string;
  deskripsi: string;
  tanggal: string;
  selesai: boolean;
}

interface Pesanan {
  id: number;
  pengguna: Pengguna | null;
  namaPelanggan: string;
  layanan: Layanan | null;
  hargaDisepakati: number | null;
  tanggalPesan: string;
  nomerHp: string;
  status: StatusPesanan;
  lokasi: string | null;
  catatan: string | null;
  dibuatPada: string;
  progres: ProgresPesanan[];
}

const OrderDetailPage: React.FC = () => {
  const [order, setOrder] = useState<Pesanan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const params = useParams<{ id: string }>();
  const orderId = parseInt(params.id);

  // Fetch order data
  const fetchOrderData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/pesanan/${orderId}`);
      setOrder(res.data.data);
      setError(null);
    } catch (err: any) {
      setError("Gagal memuat data pesanan");
      console.error("Error fetching order:", err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchOrderData();
    }
  }, [fetchOrderData]);

  // Handle progress submission
  const handleProgressSubmit = async (formData: any) => {
    try {
      const progressData = {
        ...formData,
        pesananId: orderId, // Otomatis menggunakan ID dari URL
      };

      await axios.post("/api/progres", progressData);

      // Refresh data pesanan setelah menambah progres
      await fetchOrderData();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Gagal menyimpan progres:", error);
      // Bisa tambahkan toast notification di sini
    }
  };

  // Status utilities
  const getStatusConfig = (status: StatusPesanan) => {
    const configs = {
      PENGAJUAN: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
      },
      SURVEI: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: CheckCircle,
      },
      PENGERJAAN: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: AlertCircle,
      },
      SELESAI: {
        color: "bg-emerald-100 text-emerald-800 border-emerald-200",
        icon: CheckCircle,
      },
      DIBATALKAN: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
      },
    };
    return configs[status] || configs.PENGAJUAN;
  };

  // Format utilities
  const formatCurrency = (amount: number | null) => {
    if (!amount) return "Belum ditentukan";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const nextStatusMap: Record<StatusPesanan, StatusPesanan | null> = {
    [StatusPesanan.PENGAJUAN]: StatusPesanan.SURVEI,
    [StatusPesanan.SURVEI]: StatusPesanan.PENGERJAAN,
    [StatusPesanan.PENGERJAAN]: StatusPesanan.SELESAI,
    [StatusPesanan.SELESAI]: null, // sudah final
    [StatusPesanan.DIBATALKAN]: null, // sudah final
  };

  const handleUpdateStatus = async () => {
    if (!order) return;

    const currentStatus = order.status;
    const nextStatus = nextStatusMap[currentStatus];

    if (!nextStatus) {
      Swal.fire({
        icon: "info",
        title: "Status Final",
        text: "Pesanan sudah berada pada status final.",
      });
      return;
    }

    try {
      const res = await axios.patch(`/api/pesanan/${order.id}`, {
        status: nextStatus,
      });
      setOrder(res.data.data); // update local state
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: `Status berhasil diubah ke ${nextStatus}`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Gagal update status:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal mengubah status pesanan.",
      });
    }
  };
  const handleSendWA = () => {
    if (!order) return;

    // Format nomor HP (ubah 0812... jadi 62812...)
    const phoneNumber = order.nomerHp.replace(/^0/, "62");

    // Template pesan WA
    const message = encodeURIComponent(
      `Halo ${order.namaPelanggan},\n\n` +
        `Pesanan Anda dengan ID #${order.id.toString().padStart(6, "0")} ` +
        `saat ini berstatus: ${order.status}.\n` +
        `Layanan: ${order.layanan?.nama || "-"}\n` +
        `Harga: ${
          order.hargaDisepakati ? `Rp${order.hargaDisepakati}` : "-"
        }\n\n` +
        `Terima kasih telah menggunakan layanan kami!`
    );

    // Buka WhatsApp
    const waLink = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(waLink, "_blank");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data pesanan...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>Pesanan</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">
              #{order.id.toString().padStart(6, "0")}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Detail Pesanan
              </h1>
              <p className="text-gray-600">
                Kelola dan pantau progress pesanan Anda
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Hubungi
              </button>
              <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Unduh
              </button>
              <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Informasi Pesanan
                  </h2>
                  <div
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-2 ${statusConfig.color}`}
                  >
                    <StatusIcon className="w-4 h-4" />
                    {order.status}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Tanggal Pesanan
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(order.tanggalPesan)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Nomor HP
                        </p>
                        <p className="text-sm text-gray-600">{order.nomerHp}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Lokasi
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.lokasi || "Tidak ditentukan"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Harga Disepakati
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(order.hargaDisepakati)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Dibuat Pada
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(order.dibuatPada)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {order.catatan && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          Catatan
                        </p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg leading-relaxed">
                          {order.catatan}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Service Details */}
            {order.layanan && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Detail Layanan
                </h2>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {order.layanan.nama}
                  </h3>
                  {order.layanan.kategori && (
                    <p className="text-sm text-blue-600 font-medium mb-2">
                      {order.layanan.kategori}
                    </p>
                  )}
                  {order.layanan.deskripsi && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {order.layanan.deskripsi}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Progress Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Progress Pesanan
                </h2>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Tambah Progres
                </button>
              </div>

              {order.progres.length > 0 ? (
                <div className="space-y-4">
                  {order.progres
                    .sort(
                      (a, b) =>
                        new Date(b.diperbaruiPada).getTime() -
                        new Date(a.diperbaruiPada).getTime()
                    )
                    .map((progress, index) => {
                      const isCompleted = progress.persenProgres === 100;
                      const isInProgress =
                        progress.persenProgres > 0 &&
                        progress.persenProgres < 100;

                      return (
                        <div key={progress.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium ${
                                isCompleted
                                  ? "bg-green-100 text-green-700 border-2 border-green-300"
                                  : isInProgress
                                  ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                                  : "bg-gray-100 text-gray-500 border-2 border-gray-300"
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : (
                                <span>{progress.persenProgres}%</span>
                              )}
                            </div>
                            {index < order.progres.length - 1 && (
                              <div
                                className={`w-px h-16 mt-2 ${
                                  isCompleted ? "bg-green-200" : "bg-gray-200"
                                }`}
                              ></div>
                            )}
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <h4 className="font-medium text-gray-900">
                                    Progress Update
                                  </h4>
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                                      isCompleted
                                        ? "bg-green-100 text-green-700"
                                        : isInProgress
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {progress.persenProgres}% Selesai
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                                  {progress.keterangan}
                                </p>

                                {/* Progress Bar */}
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                  <div
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                      isCompleted
                                        ? "bg-green-500"
                                        : isInProgress
                                        ? "bg-blue-500"
                                        : "bg-gray-400"
                                    }`}
                                    style={{
                                      width: `${progress.persenProgres}%`,
                                    }}
                                  ></div>
                                </div>

                                {/* Documentation Link */}
                              </div>
                              <div className="text-right ml-4">
                                <span className="text-xs text-gray-500">
                                  {formatDate(String(progress.diperbaruiPada))}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Belum ada progres yang ditambahkan</p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Tambah progres pertama
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informasi Pelanggan
              </h3>

              {order.pengguna ? (
                <div className="flex items-center gap-4">
                  {order.pengguna.avatar ? (
                    <img
                      src={order.pengguna.avatar}
                      alt={order.pengguna.nama}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {order.pengguna.nama}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {order.pengguna.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {order.namaPelanggan}
                    </h4>
                    <p className="text-sm text-gray-600">{order.nomerHp}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Aksi Cepat
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleUpdateStatus}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Update Status
                </button>
                <button
                  onClick={handleSendWA}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Kirim Notifikasi WA
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl text-white p-6">
              <h3 className="text-lg font-semibold mb-4">Ringkasan</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">ID Pesanan</span>
                  <span className="font-medium">
                    #{order.id.toString().padStart(6, "0")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Status</span>
                  <span className="font-medium">{order.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Harga</span>
                  <span className="font-bold text-green-400">
                    {formatCurrency(order.hargaDisepakati)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal untuk tambah progres */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Progres"
      >
        <ProgresForm
          orderId={orderId}
          onSubmit={handleProgressSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default OrderDetailPage;
