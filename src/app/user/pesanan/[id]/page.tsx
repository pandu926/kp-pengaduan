"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import PaymentModal from "@/components/PaymentModal";

// Fungsi generate kode unik (1-999)
const generateKodeUnik = () => {
  return Math.floor(Math.random() * 999) + 1;
};

const OrderDetailUserPage: React.FC = () => {
  const [order, setOrder] = useState<any>(null);
  const [infoRekening, setInfoRekening] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [kodeUnik, setKodeUnik] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const params = useParams<{ id: string }>();
  const orderId = parseInt(params.id);

  // Get pembayaran yang aktif berdasarkan status
  const getActivePembayaran = () => {
    if (!order?.pembayaran || order.pembayaran.length === 0) return null;

    // Jika status DITERIMA, ambil pembayaran DP
    if (order.status === "DITERIMA") {
      return order.pembayaran.find((p: any) => p.tipePembayaran === "DP");
    }

    // Jika status PROSES_PEMBANGUNAN, ambil pembayaran PELUNASAN
    if (order.status === "PELUNASAN") {
      return order.pembayaran.find(
        (p: any) => p.tipePembayaran === "PELUNASAN"
      );
    }

    return null;
  };

  const activePembayaran = getActivePembayaran();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const orderRes = await axios.get(`/api/pesanan/${orderId}`);
        console.log(orderRes.data);
        setOrder(orderRes.data.data);

        const infoRes = await axios.get("/api/pembayaran/info");
        setInfoRekening(infoRes.data.data);

        // Generate kode unik untuk pembayaran
        setKodeUnik(generateKodeUnik());

        setError(null);
      } catch (err) {
        setError("Gagal memuat data pesanan");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchData();
    }
  }, [orderId]);

  // Auto open modal jika ada pembayaran aktif yang belum bayar
  useEffect(() => {
    if (activePembayaran?.statusPembayaran === "BELUM_BAYAR") {
      setShowPaymentModal(true);
    }
  }, [activePembayaran]);

  const calculateTotalPembayaran = (amount: number) => {
    return amount + kodeUnik;
  };

  // Handler menerima URL gambar yang sudah diupload
  const handleUploadBukti = async (imageUrl: string) => {
    if (!activePembayaran) return;

    try {
      setUploadLoading(true);

      // Simpan URL gambar dan kode unik ke database
      await axios.patch(`/api/pembayaran/${activePembayaran.id}`, {
        buktiPembayaran: imageUrl,
        metodePembayaran: "TRANSFER",
      });

      // Refresh order data
      const orderRes = await axios.get(`/api/pesanan/${orderId}`);
      setOrder(orderRes.data.data);

      setUploadSuccess(true);
      setShowPaymentModal(false);

      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving payment:", err);
      throw err;
    } finally {
      setUploadLoading(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "Belum ditentukan";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

  // Get label pembayaran
  const getPaymentLabel = () => {
    if (!activePembayaran) return "";
    return activePembayaran.tipePembayaran === "DP" ? "DP" : "Pelunasan";
  };

  // Calculate persentase
  const getPercentage = () => {
    if (!activePembayaran || !order?.hargaDisepakati) return 0;
    return (Number(activePembayaran.jumlah) / order.hargaDisepakati) * 100;
  };

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

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md">
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

  const paymentAmount = activePembayaran ? Number(activePembayaran.jumlah) : 0;
  const totalPembayaran = calculateTotalPembayaran(paymentAmount);
  const canShowPayment =
    activePembayaran && activePembayaran.statusPembayaran === "BELUM_BAYAR";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Detail Pesanan #{order.id.toString().padStart(6, "0")}
              </h1>
              <p className="text-gray-600">
                Pantau status dan kelola pembayaran pesanan Anda
              </p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Kembali
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {uploadSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="text-green-800 font-medium">
              Bukti pembayaran berhasil diupload! Menunggu verifikasi admin.
            </p>
          </div>
        )}

        {/* Payment Button - Muncul sesuai status */}
        {canShowPayment && (
          <div className="mb-6">
            <button
              onClick={() => setShowPaymentModal(true)}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <span>
                Bayar {getPaymentLabel()} Sekarang -{" "}
                {formatCurrency(totalPembayaran)}
              </span>
            </button>
          </div>
        )}

        {/* Payment Modal */}
        {activePembayaran && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            orderId={order.id}
            dpAmount={paymentAmount}
            kodeUnik={kodeUnik}
            totalPembayaran={totalPembayaran}
            infoRekening={infoRekening}
            onUploadBukti={handleUploadBukti}
            uploadLoading={uploadLoading}
            typePembayaran={
              activePembayaran.tipePembayaran as "DP" | "PELUNASAN"
            }
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Alert */}
            {order.status === "PENGAJUAN" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-4">
                <svg
                  className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1">
                    Pesanan Dalam Review
                  </h3>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Pesanan Anda sedang direview oleh admin. Anda akan menerima
                    notifikasi pastikan nomer wa anda aktif.
                  </p>
                </div>
              </div>
            )}

            {/* Order Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Informasi Pesanan
                  </h2>
                  <div className="px-3 py-1.5 rounded-full text-sm font-medium border bg-blue-100 text-blue-800 border-blue-200">
                    {order.status}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-gray-400 mt-0.5"
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
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Tanggal Pesanan
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(order.dibuatPada)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-gray-400 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Nomor HP
                        </p>
                        <p className="text-sm text-gray-600">{order.nomorHp}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-gray-400 mt-0.5"
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
                      <svg
                        className="w-5 h-5 text-gray-400 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Harga Disepakati
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(order.hargaDisepakati)}
                        </p>
                      </div>
                    </div>

                    {activePembayaran && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-xs text-blue-700 mb-2">
                          Rincian Pembayaran {getPaymentLabel()}
                        </p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-800">
                              {getPaymentLabel()} ({getPercentage().toFixed(0)}
                              %):
                            </span>
                            <span className="font-semibold text-blue-900">
                              {formatCurrency(paymentAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-800">Kode Unik:</span>
                            <span className="font-semibold text-blue-900">
                              {formatCurrency(kodeUnik)}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-blue-200">
                            <span className="font-semibold text-blue-900">
                              Total Transfer:
                            </span>
                            <span className="font-bold text-blue-900">
                              {formatCurrency(totalPembayaran)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <div className="flex justify-between text-xs">
                            <span className="text-blue-700">Status:</span>
                            <span
                              className={`font-semibold ${
                                activePembayaran.statusPembayaran ===
                                "DIVERIFIKASI"
                                  ? "text-green-700"
                                  : activePembayaran.statusPembayaran ===
                                    "MENUNGGU_VERIFIKASI"
                                  ? "text-yellow-700"
                                  : "text-gray-700"
                              }`}
                            >
                              {activePembayaran.statusPembayaran}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {order.catatan && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-gray-400 mt-0.5"
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
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          Catatan Anda
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
                  {order.layanan.deskripsi && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {order.layanan.deskripsi}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Payment History */}
            {order.pembayaran && order.pembayaran.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Riwayat Pembayaran
                </h2>
                <div className="space-y-3">
                  {order.pembayaran.map((payment: any, index: number) => (
                    <div
                      key={payment.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {payment.tipePembayaran}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              payment.statusPembayaran === "DIVERIFIKASI"
                                ? "bg-green-100 text-green-800"
                                : payment.statusPembayaran ===
                                  "MENUNGGU_VERIFIKASI"
                                ? "bg-yellow-100 text-yellow-800"
                                : payment.statusPembayaran === "DITOLAK"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {payment.statusPembayaran}
                          </span>
                        </div>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(Number(payment.jumlah))}
                        </span>
                      </div>
                      {payment.tanggalBayar && (
                        <p className="text-xs text-gray-500">
                          Dibayar: {formatDate(payment.tanggalBayar)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informasi Pelanggan
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {order.namaPelanggan}
                  </h4>
                  <p className="text-sm text-gray-600">{order.nomorHp}</p>
                </div>
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
                  <span className="text-gray-300">Status Pesanan</span>
                  <span className="font-medium">{order.status}</span>
                </div>
                {activePembayaran && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">
                      Status {getPaymentLabel()}
                    </span>
                    <span className="font-medium text-yellow-400">
                      {activePembayaran.statusPembayaran}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-700">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Total Harga</span>
                    <span className="font-bold text-white text-lg">
                      {formatCurrency(order.hargaDisepakati)}
                    </span>
                  </div>
                  {order.pembayaran && order.pembayaran.length > 0 && (
                    <div className="space-y-1 text-sm">
                      {order.pembayaran.map((payment: any) => (
                        <div
                          key={payment.id}
                          className="flex justify-between text-gray-400"
                        >
                          <span>• {payment.tipePembayaran}</span>
                          <span
                            className={
                              payment.statusPembayaran === "DIVERIFIKASI"
                                ? "text-green-400 font-medium"
                                : ""
                            }
                          >
                            {formatCurrency(Number(payment.jumlah))}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailUserPage;
