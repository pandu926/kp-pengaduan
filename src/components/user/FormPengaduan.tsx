"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  showSuccessAlert,
  showErrorAlert,
  showLoadingAlert,
  closeLoadingAlert,
  handleApiError,
} from "@/lib/notification.utils";

interface Layanan {
  id: number;
  nama: string;
  deskripsi?: string;
  harga?: number;
}

enum StatusPesanan {
  PENGAJUAN = "PENGAJUAN",
  DALAM_PROSES = "DALAM_PROSES",
  SELESAI = "SELESAI",
  DIBATALKAN = "DIBATALKAN",
}

interface OrderFormData {
  layananId: number | null;
  hargaDisepakati: string;
  namaPelanggan: string;
  nomorHp: string;
  lokasi: string;
  catatan: string;
}

const LoadingSpinner = () => (
  <div className="inline-flex items-center">
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    Memproses...
  </div>
);

export default function CreateOrderPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [layananList, setLayananList] = useState<Layanan[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLayanan, setLoadingLayanan] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedLayanan, setSelectedLayanan] = useState<Layanan | null>(null);

  const [formData, setFormData] = useState<OrderFormData>({
    layananId: null,
    namaPelanggan: "",
    hargaDisepakati: "0",
    nomorHp: "",
    lokasi: "",
    catatan: "",
  });

  // Fetch available services
  useEffect(() => {
    const fetchLayanan = async () => {
      try {
        const res = await axios.get("/api/layanan");
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        setLayananList(data);
      } catch (error) {
        console.error("Error fetching layanan:", error);
        const errorMsg = "Gagal memuat daftar layanan. Silakan refresh halaman.";
        setError(errorMsg);
        showErrorAlert(errorMsg, "Gagal Memuat Data");
      } finally {
        setLoadingLayanan(false);
      }
    };
    fetchLayanan();
  }, []);

  const handleSelectLayanan = (layanan: Layanan) => {
    setSelectedLayanan(layanan);
    setFormData((prev) => ({
      ...prev,
      layananId: layanan.id,
      hargaDisepakati: layanan.harga ? layanan.harga.toString() : "0",
    }));
    setShowForm(true);
    setError(null);

    // Smooth scroll to form
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleBackToServices = () => {
    setShowForm(false);
    setSelectedLayanan(null);
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError(null);
  };

  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, "");

    if (cleaned.startsWith("62")) {
      return cleaned;
    } else if (cleaned.startsWith("0")) {
      return "62" + cleaned.substring(1);
    } else if (cleaned.length >= 9) {
      return "62" + cleaned;
    }

    return cleaned;
  };

  const isValidPhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, "");
    const patterns = [/^62[0-9]{9,13}$/, /^0[0-9]{9,12}$/, /^[0-9]{9,12}$/];
    return patterns.some((pattern) => pattern.test(cleaned));
  };

  const validateForm = (): boolean => {
    setError(null);

    if (!formData.layananId) {
      setError("Silakan pilih layanan");
      return false;
    }

    if (!formData.namaPelanggan.trim()) {
      setError("Masukkan nama pelanggan");
      return false;
    }

    if (!formData.nomorHp.trim()) {
      setError("Nomor HP tidak boleh kosong");
      return false;
    }

    if (!isValidPhoneNumber(formData.nomorHp)) {
      setError(
        "Format nomor HP tidak valid. Gunakan format: 08xxxxxxxxx atau 628xxxxxxxxx"
      );
      return false;
    }

    if (!formData.lokasi.trim()) {
      setError("Lokasi tidak boleh kosong");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      showErrorAlert(
        "Anda harus login terlebih dahulu untuk membuat pesanan",
        "Login Diperlukan"
      );
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      showLoadingAlert("Mengirim pesanan Anda...");

      const formattedPhone = formatPhoneNumber(formData.nomorHp);

      const orderData = {
        penggunaId: session.user.id,
        layananId: formData.layananId,
        namaPelanggan: formData.namaPelanggan.trim(),
        hargaDisepakati: parseFloat(formData.hargaDisepakati) || 0,
        nomorHp: formattedPhone,
        lokasi: formData.lokasi.trim(),
        catatan: formData.catatan.trim() || null,
        status: StatusPesanan.PENGAJUAN,
      };

      const response = await axios.post("/api/pesanan", orderData);

      closeLoadingAlert();

      if (response.data.success) {
        setFormData({
          layananId: null,
          namaPelanggan: "",
          hargaDisepakati: "0",
          nomorHp: "",
          lokasi: "",
          catatan: "",
        });

        await showSuccessAlert(
          "Pesanan Anda berhasil diajukan! Tim kami akan segera menghubungi Anda via WhatsApp untuk konfirmasi dan survei lokasi.",
          "Pesanan Berhasil Dikirim!"
        );

        router.push("/user/dashboard");
      } else {
        throw new Error(response.data.error || "Gagal membuat pesanan");
      }
    } catch (error: any) {
      closeLoadingAlert();
      console.error("Error creating order:", error);

      let errorMessage = "Gagal membuat pesanan. Silakan coba lagi.";

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Translate error messages to Indonesian
      if (errorMessage.includes("Format nomor HP tidak valid")) {
        errorMessage =
          "Format nomor HP tidak valid. Gunakan format: 08xxxxxxxxx atau +628xxxxxxxxx";
      } else if (
        errorMessage.includes("Nama pelanggan dan nomor HP wajib diisi")
      ) {
        errorMessage = "Nama pelanggan dan nomor HP harus diisi dengan lengkap";
      } else if (errorMessage.includes("Layanan tidak ditemukan")) {
        errorMessage = "Layanan yang dipilih tidak tersedia. Silakan pilih layanan lain.";
      } else if (errorMessage.includes("Pengguna tidak ditemukan")) {
        errorMessage = "Sesi login tidak valid. Silakan login ulang.";
      }

      setError(errorMessage);
      showErrorAlert(errorMessage, "Gagal Mengirim Pesanan");
    } finally {
      setLoading(false);
    }
  };

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Login Diperlukan
          </h2>
          <p className="text-gray-600 mb-6">
            Anda harus login untuk membuat pesanan jasa konstruksi
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login Sekarang
          </button>
        </div>
      </div>
    );
  }

  // TAMPILAN FORM PEMESANAN (Tahap 2)
  if (showForm && selectedLayanan) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={handleBackToServices}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Kembali ke Daftar Layanan
            </button>

            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Form Pemesanan
              </h1>
              <p className="text-gray-600">
                Lengkapi data untuk layanan:{" "}
                <span className="font-semibold text-blue-600">
                  {selectedLayanan.nama}
                </span>
              </p>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-600 mr-2"
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
                <p className="text-green-800 font-medium">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Selected Service Info */}
          <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-900 mb-1">
                  {selectedLayanan.nama}
                </h3>
                {selectedLayanan.deskripsi && (
                  <p className="text-sm text-blue-700 mb-2">
                    {selectedLayanan.deskripsi}
                  </p>
                )}
                {selectedLayanan.harga && (
                  <p className="text-xl font-bold text-blue-900">
                    Rp{" "}
                    {parseFloat(
                      selectedLayanan.harga.toString()
                    ).toLocaleString("id-ID")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Customer Info Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Informasi Pelanggan
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="namaPelanggan"
                      className="block text-sm font-semibold text-gray-900 mb-2"
                    >
                      Nama Pelanggan *
                    </label>
                    <input
                      type="text"
                      id="namaPelanggan"
                      name="namaPelanggan"
                      value={formData.namaPelanggan}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama lengkap"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="nomorHp"
                      className="block text-sm font-semibold text-gray-900 mb-2"
                    >
                      Nomor WhatsApp *
                    </label>
                    <input
                      type="tel"
                      id="nomorHp"
                      name="nomorHp"
                      value={formData.nomorHp}
                      onChange={handleInputChange}
                      placeholder="08123456789"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Untuk konfirmasi dan koordinasi proyek
                    </p>
                  </div>
                </div>
              </div>

              {/* Project Details Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Detail Proyek
                </h3>

                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="lokasi"
                      className="block text-sm font-semibold text-gray-900 mb-2"
                    >
                      Lokasi Proyek *
                    </label>
                    <input
                      type="text"
                      id="lokasi"
                      name="lokasi"
                      value={formData.lokasi}
                      onChange={handleInputChange}
                      placeholder="Alamat lengkap lokasi proyek konstruksi"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="catatan"
                      className="block text-sm font-semibold text-gray-900 mb-2"
                    >
                      Deskripsi Proyek & Kebutuhan
                    </label>
                    <textarea
                      id="catatan"
                      name="catatan"
                      value={formData.catatan}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder="Jelaskan detail proyek Anda: luas bangunan, spesifikasi khusus, timeline yang diinginkan, dll."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Informasi detail akan membantu kami memberikan estimasi
                      yang lebih akurat
                    </p>
                  </div>
                </div>
              </div>

              {/* User Info Display */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-white"
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
                    <p className="text-sm font-medium text-gray-700">
                      Diajukan oleh
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {session.user?.name || session.user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? <LoadingSpinner /> : "Ajukan Pesanan Sekarang"}
                </button>
                <p className="text-center text-sm text-gray-500 mt-3">
                  Status akan diset ke{" "}
                  <span className="font-semibold text-blue-600">PENGAJUAN</span>{" "}
                  setelah submit
                </p>
              </div>
            </form>
          </div>

          {/* Info Card */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <svg
                className="w-7 h-7 text-blue-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="font-bold text-blue-900 mb-3 text-lg">
                  Alur Proses Pesanan
                </h3>
                <ol className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-blue-600 flex-shrink-0">
                      1.
                    </span>
                    <span>
                      <strong>Pengajuan:</strong> Pesanan masuk dengan status
                      "PENGAJUAN"
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-blue-600 flex-shrink-0">
                      2.
                    </span>
                    <span>
                      <strong>Notifikasi:</strong> Tim menghubungi via WhatsApp
                      dalam 1x24 jam
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-blue-600 flex-shrink-0">
                      3.
                    </span>
                    <span>
                      <strong>Survei:</strong> Teknisi survei lokasi untuk
                      estimasi akurat
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-blue-600 flex-shrink-0">
                      4.
                    </span>
                    <span>
                      <strong>Konfirmasi:</strong> Harga final disepakati
                      setelah survei
                    </span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TAMPILAN DAFTAR LAYANAN (Tahap 1)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Layanan Jasa Konstruksi
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Pilih layanan konstruksi yang Anda butuhkan. Tim profesional kami
            siap membantu mewujudkan proyek impian Anda.
          </p>
        </div>

        {/* Loading State */}
        {loadingLayanan && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-md overflow-hidden"
              >
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-md mx-auto p-6 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Service Cards */}
        {!loadingLayanan && !error && (
          <>
            {layananList.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Belum Ada Layanan
                </h3>
                <p className="text-gray-600">
                  Layanan konstruksi akan segera tersedia.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {layananList.map((layanan) => (
                  <div
                    key={layanan.id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100"
                  >
                    {/* Card Image/Icon */}
                    <div className="h-52 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                      <svg
                        className="w-24 h-24 text-white transform group-hover:scale-110 transition-transform duration-300"
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

                    {/* Card Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem]">
                        {layanan.nama}
                      </h3>

                      {layanan.deskripsi && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 min-h-[4.5rem]">
                          {layanan.deskripsi}
                        </p>
                      )}

                      {/* Price */}
                      <div className="mb-6">
                        {layanan.harga ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm text-gray-500">
                              Mulai dari
                            </span>
                            <span className="text-2xl font-bold text-blue-600">
                              Rp{" "}
                              {parseFloat(
                                layanan.harga.toString()
                              ).toLocaleString("id-ID")}{" "}
                              <span className="text-base font-medium text-gray-600">
                                / meter persegi
                              </span>
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-semibold text-gray-700">
                              Harga Disesuaikan
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Order Button */}
                      <button
                        onClick={() => handleSelectLayanan(layanan)}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        <span className="flex items-center justify-center gap-2">
                          Pesan Sekarang
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </span>
                      </button>
                    </div>

                    {/* Badge (Optional) */}
                    <div className="px-6 pb-6">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>Gratis Konsultasi & Survei</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
