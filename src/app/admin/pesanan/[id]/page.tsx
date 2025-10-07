"use client";
import React, { useEffect, useState } from "react";
import {
  Calendar,
  Phone,
  MapPin,
  FileText,
  Clock,
  DollarSign,
  User,
  CheckCircle,
  XCircle,
  ChevronRight,
  Edit3,
  Save,
} from "lucide-react";
import { useParams } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";

// Types
enum StatusPesanan {
  PENGAJUAN = "PENGAJUAN",
  DITERIMA = "DITERIMA",
  DITOLAK = "DITOLAK",
  SELESAI = "SELESAI",
}

enum StatusBayar {
  BELUM_BAYAR = "BELUM_BAYAR",
  MENUNGGU_VERIFIKASI = "MENUNGGU_VERIFIKASI",
  DIVERIFIKASI = "DIVERIFIKASI",
  DITOLAK = "DITOLAK",
}

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

interface Pembayaran {
  id: number;
  jumlah: number;
  metodePembayaran: string | null;
  buktiPembayaran: string | null;
  statusPembayaran: StatusBayar;
  tanggalBayar: string | null;
  tanggalVerifikasi: string | null;
  alasanPenolakan: string | null;
}

interface Pesanan {
  id: number;
  pengguna: Pengguna | null;
  namaPelanggan: string;
  layanan: Layanan | null;
  hargaDisepakati: number | null;
  tanggalPesan: string;
  nomorHp: string;
  status: StatusPesanan;
  lokasi: string | null;
  catatan: string | null;
  catatanAdmin: string | null;
  dibuatPada: string;
  pembayaran: Pembayaran | null;
}

const OrderDetailPage: React.FC = () => {
  const [order, setOrder] = useState<Pesanan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    status: "" as StatusPesanan | "",
    hargaDisepakati: "",
    catatanAdmin: "",
  });

  const params = useParams<{ id: string }>();
  const orderId = parseInt(params.id);

  // Fetch order data
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/pesanan/${orderId}`);
        setOrder(res.data.data);

        // Set initial form data
        setFormData({
          status: res.data.data.status,
          hargaDisepakati: res.data.data.hargaDisepakati?.toString() || "",
          catatanAdmin: res.data.data.catatanAdmin || "",
        });

        setError(null);
      } catch (err) {
        setError("Gagal memuat data pesanan");
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderData();
    }
  }, [orderId]);

  // Handle form submit
  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi
    if (!formData.status) {
      Swal.fire({
        icon: "error",
        title: "Validasi Gagal",
        text: "Status harus dipilih",
      });
      return;
    }

    if (
      formData.status === StatusPesanan.DITERIMA &&
      !formData.hargaDisepakati
    ) {
      Swal.fire({
        icon: "error",
        title: "Validasi Gagal",
        text: "Harga harus diisi jika status DITERIMA",
      });
      return;
    }

    if (formData.status === StatusPesanan.DITOLAK && !formData.catatanAdmin) {
      Swal.fire({
        icon: "error",
        title: "Validasi Gagal",
        text: "Alasan penolakan harus diisi",
      });
      return;
    }

    try {
      const updateData: any = {
        status: formData.status,
        catatanAdmin: formData.catatanAdmin || null,
      };

      if (
        formData.status === StatusPesanan.DITERIMA &&
        formData.hargaDisepakati
      ) {
        updateData.hargaDisepakati = parseFloat(formData.hargaDisepakati);
      }

      const res = await axios.patch(`/api/pesanan/${orderId}`, updateData);

      setOrder(res.data.data);
      setShowUpdateForm(false);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Pesanan berhasil diupdate",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Gagal update pesanan:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal mengupdate pesanan",
      });
    }
  };

  // Refresh order data
  const refreshOrderData = async () => {
    try {
      const res = await axios.get(`/api/pesanan/${orderId}`);
      setOrder(res.data.data);
    } catch (err) {
      console.error("Error refreshing order:", err);
    }
  };

  // Verifikasi pembayaran
  const handleVerifyPayment = async (approved: boolean) => {
    if (!order?.pembayaran) return;

    const result = await Swal.fire({
      title: approved ? "Approve Pembayaran?" : "Reject Pembayaran?",
      text: approved
        ? "Pembayaran akan diverifikasi"
        : "Pembayaran akan ditolak",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: approved ? "#10b981" : "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: approved ? "Ya, Approve" : "Ya, Reject",
      cancelButtonText: "Batal",
      ...(approved
        ? {}
        : {
            input: "textarea",
            inputPlaceholder: "Alasan penolakan...",
            inputValidator: (value) => {
              if (!value) return "Alasan harus diisi!";
            },
          }),
    });

    if (result.isConfirmed) {
      try {
        await axios.patch(`/api/pembayaran/${order.pembayaran.id}`, {
          action: "verifikasi",
          adminId: 1, // TODO: Get from session
          disetujui: approved,
          alasanPenolakan: approved ? undefined : result.value,
        });

        await refreshOrderData();

        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: approved
            ? "Pembayaran berhasil diverifikasi"
            : "Pembayaran ditolak",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Gagal verifikasi:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Gagal memproses verifikasi pembayaran",
        });
      }
    }
  };

  // Status utilities
  const getStatusConfig = (status: StatusPesanan) => {
    const configs = {
      PENGAJUAN: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
      },
      DITERIMA: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: CheckCircle,
      },
      DITOLAK: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
      },
      SELESAI: {
        color: "bg-emerald-100 text-emerald-800 border-emerald-200",
        icon: CheckCircle,
      },
    };
    return configs[status] || configs.PENGAJUAN;
  };

  const getPaymentStatusConfig = (status: StatusBayar) => {
    const configs = {
      BELUM_BAYAR: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        text: "Belum Bayar",
      },
      MENUNGGU_VERIFIKASI: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        text: "Menunggu Verifikasi",
      },
      DIVERIFIKASI: {
        color: "bg-green-100 text-green-800 border-green-200",
        text: "Terverifikasi",
      },
      DITOLAK: {
        color: "bg-red-100 text-red-800 border-red-200",
        text: "Ditolak",
      },
    };
    return configs[status] || configs.BELUM_BAYAR;
  };

  // Format utilities
  const formatCurrency = (amount: number | null) => {
    if (!amount) return "Belum ditentukan";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
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

  const handleSendWA = () => {
    if (!order) return;

    const phoneNumber = order.nomorHp.replace(/^0/, "62");
    const message = encodeURIComponent(
      `Halo ${order.namaPelanggan},\n\n` +
        `Pesanan Anda dengan ID #${order.id.toString().padStart(6, "0")} ` +
        `saat ini berstatus: ${order.status}.\n` +
        `Layanan: ${order.layanan?.nama || "-"}\n` +
        `Harga: ${formatCurrency(order.hargaDisepakati)}\n\n` +
        `Terima kasih telah menggunakan layanan kami!`
    );

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
              <p className="text-gray-600">Kelola dan pantau status pesanan</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Update Status & Harga Form */}
            {showUpdateForm && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Edit3 className="w-5 h-5" />
                    Update Pesanan
                  </h2>
                  <button
                    onClick={() => setShowUpdateForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmitUpdate} className="space-y-6">
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status Pesanan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as StatusPesanan,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Pilih Status</option>
                      <option value={StatusPesanan.PENGAJUAN}>Pengajuan</option>
                      <option value={StatusPesanan.DITERIMA}>Diterima</option>
                      <option value={StatusPesanan.DITOLAK}>Ditolak</option>
                      <option value={StatusPesanan.SELESAI}>Selesai</option>
                    </select>
                  </div>

                  {/* Harga - Show if DITERIMA */}
                  {formData.status === StatusPesanan.DITERIMA && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Harga Disepakati <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-gray-500">
                          Rp
                        </span>
                        <input
                          type="number"
                          value={formData.hargaDisepakati}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              hargaDisepakati: e.target.value,
                            })
                          }
                          placeholder="0"
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required={formData.status === StatusPesanan.DITERIMA}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Harga yang disepakati dengan pelanggan
                      </p>
                    </div>
                  )}

                  {/* Catatan Admin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catatan Admin
                      {formData.status === StatusPesanan.DITOLAK && (
                        <span className="text-red-500">
                          {" "}
                          * (Wajib diisi jika ditolak)
                        </span>
                      )}
                    </label>
                    <textarea
                      value={formData.catatanAdmin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          catatanAdmin: e.target.value,
                        })
                      }
                      placeholder={
                        formData.status === StatusPesanan.DITOLAK
                          ? "Alasan penolakan..."
                          : "Tambahkan catatan untuk pelanggan (opsional)"
                      }
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={formData.status === StatusPesanan.DITOLAK}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      Simpan Perubahan
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUpdateForm(false)}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            )}

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
                        <p className="text-sm text-gray-600">{order.nomorHp}</p>
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
                          Catatan Pelanggan
                        </p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg leading-relaxed">
                          {order.catatan}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {order.catatanAdmin && (
                  <div className="mt-4">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          Catatan Admin
                        </p>
                        <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg leading-relaxed">
                          {order.catatanAdmin}
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

            {/* Informasi Pembayaran */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Informasi Pembayaran
              </h2>

              {order.pembayaran ? (
                <div className="space-y-6">
                  {/* Status Pembayaran */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Status Pembayaran
                    </span>
                    <span
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                        getPaymentStatusConfig(
                          order.pembayaran.statusPembayaran
                        ).color
                      }`}
                    >
                      {
                        getPaymentStatusConfig(
                          order.pembayaran.statusPembayaran
                        ).text
                      }
                    </span>
                  </div>

                  {/* Detail Pembayaran */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Jumlah</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(order.pembayaran.jumlah)}
                      </p>
                    </div>

                    {order.pembayaran.metodePembayaran && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Metode Pembayaran
                        </p>
                        <p className="text-base font-medium text-gray-900">
                          {order.pembayaran.metodePembayaran}
                        </p>
                      </div>
                    )}

                    {order.pembayaran.tanggalBayar && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Tanggal Bayar
                        </p>
                        <p className="text-sm text-gray-900">
                          {formatDate(order.pembayaran.tanggalBayar)}
                        </p>
                      </div>
                    )}

                    {order.pembayaran.tanggalVerifikasi && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Tanggal Verifikasi
                        </p>
                        <p className="text-sm text-gray-900">
                          {formatDate(order.pembayaran.tanggalVerifikasi)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bukti Pembayaran */}
                  {order.pembayaran.buktiPembayaran && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-3">
                        Bukti Pembayaran
                      </p>
                      <img
                        src={order.pembayaran.buktiPembayaran}
                        alt="Bukti Pembayaran"
                        className="w-full max-w-md rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() =>
                          window.open(
                            order.pembayaran!.buktiPembayaran!,
                            "_blank"
                          )
                        }
                      />
                    </div>
                  )}

                  {/* Alasan Penolakan */}
                  {order.pembayaran.alasanPenolakan && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-900 mb-2">
                        Alasan Penolakan Pembayaran
                      </p>
                      <p className="text-sm text-red-700">
                        {order.pembayaran.alasanPenolakan}
                      </p>
                    </div>
                  )}

                  {/* Tombol Verifikasi */}
                  {order.pembayaran.statusPembayaran ===
                    StatusBayar.MENUNGGU_VERIFIKASI && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleVerifyPayment(true)}
                        className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Approve Pembayaran
                      </button>
                      <button
                        onClick={() => handleVerifyPayment(false)}
                        className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject Pembayaran
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Belum ada informasi pembayaran</p>
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

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {order.namaPelanggan}
                  </h4>
                  <p className="text-sm text-gray-600">{order.nomorHp}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Aksi Cepat
              </h3>
              <div className="space-y-3">
                {!showUpdateForm && (
                  <button
                    onClick={() => setShowUpdateForm(true)}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-5 h-5" />
                    Update Status & Harga
                  </button>
                )}
                <button
                  onClick={handleSendWA}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
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
                {order.pembayaran && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Status Bayar</span>
                    <span className="font-medium text-yellow-400">
                      {
                        getPaymentStatusConfig(
                          order.pembayaran.statusPembayaran
                        ).text
                      }
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Harga</span>
                    <span className="font-bold text-green-400 text-xl">
                      {formatCurrency(order.hargaDisepakati)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
