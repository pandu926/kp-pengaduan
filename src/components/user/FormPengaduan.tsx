"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Layanan {
  id: number;
  nama: string;
  deskripsi?: string;
  hargaDasar?: number;
  urlGambar?: string;
}

enum StatusPesanan {
  MENUNGGU = "MENUNGGU",
  DALAM_PROSES = "DALAM_PROSES",
  SELESAI = "SELESAI",
  DIBATALKAN = "DIBATALKAN",
}

interface OrderFormData {
  layananId: number | null;
  hargaDisepakati: string;
  namaPelanggan: string;
  nomerHp: string;
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

  const [formData, setFormData] = useState<OrderFormData>({
    layananId: null,
    namaPelanggan: "",
    hargaDisepakati: "0",
    nomerHp: "",
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
        setError("Gagal memuat daftar layanan");
      } finally {
        setLoadingLayanan(false);
      }
    };
    fetchLayanan();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "layananId" ? (value ? parseInt(value) : null) : value,
    }));

    // Clear error when user starts typing
    if (error) setError(null);
  };

  // Improved phone number formatter
  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, "");

    // Handle different formats
    if (cleaned.startsWith("62")) {
      return cleaned; // Already in correct format (62xxx)
    } else if (cleaned.startsWith("0")) {
      return "62" + cleaned.substring(1); // Convert 08xxx to 628xxx
    } else if (cleaned.length >= 9) {
      return "62" + cleaned; // Add 62 prefix
    }

    return cleaned;
  };

  // Phone number validation
  const isValidPhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, "");

    // Indonesian phone number patterns
    const patterns = [
      /^62[0-9]{9,13}$/, // 62xxxxxxxxx (9-13 digits after 62)
      /^0[0-9]{9,12}$/, // 0xxxxxxxxx (9-12 digits after 0)
      /^[0-9]{9,12}$/, // xxxxxxxxx (9-12 digits, will be prefixed with 62)
    ];

    return patterns.some((pattern) => pattern.test(cleaned));
  };

  const validateForm = (): boolean => {
    // Reset error
    setError(null);

    if (!formData.layananId) {
      setError("Silakan pilih layanan");
      return false;
    }

    if (!formData.namaPelanggan.trim()) {
      setError("Masukkan nama pelanggan");
      return false;
    }

    if (!formData.nomerHp.trim()) {
      setError("Nomor HP tidak boleh kosong");
      return false;
    }

    if (!isValidPhoneNumber(formData.nomerHp)) {
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
      setError("Anda harus login terlebih dahulu");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Format phone number before sending
      const formattedPhone = formatPhoneNumber(formData.nomerHp);

      const orderData = {
        penggunaId: session.user.id,
        layananId: formData.layananId,
        namaPelanggan: formData.namaPelanggan.trim(),
        hargaDisepakati: parseFloat(formData.hargaDisepakati) || 0,
        nomerHp: formattedPhone,
        lokasi: formData.lokasi.trim(),
        catatan: formData.catatan.trim() || null,
        status: StatusPesanan.MENUNGGU,
      };

      console.log("Sending order data:", orderData);

      const response = await axios.post("/api/pesanan", orderData);

      if (response.data.success) {
        setSuccess("Pesanan berhasil dibuat!");

        // Reset form
        setFormData({
          layananId: null,
          namaPelanggan: "",
          hargaDisepakati: "0",
          nomerHp: "",
          lokasi: "",
          catatan: "",
        });

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/user/dashboard");
        }, 2000);
      } else {
        throw new Error(response.data.error || "Gagal membuat pesanan");
      }
    } catch (error: any) {
      console.error("Error creating order:", error);

      // Improved error handling
      let errorMessage = "Gagal membuat pesanan";

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Handle specific error cases
      if (errorMessage.includes("Format nomor HP tidak valid")) {
        errorMessage =
          "Format nomor HP tidak valid. Gunakan format: 08xxxxxxxxx atau +628xxxxxxxxx";
      } else if (
        errorMessage.includes("Nama pelanggan dan nomor HP wajib diisi")
      ) {
        errorMessage = "Nama pelanggan dan nomor HP harus diisi";
      } else if (errorMessage.includes("Layanan tidak ditemukan")) {
        errorMessage = "Layanan yang dipilih tidak tersedia";
      } else if (errorMessage.includes("Pengguna tidak ditemukan")) {
        errorMessage = "Sesi login tidak valid. Silakan login ulang";
      }

      setError(errorMessage);
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
            Anda harus login untuk membuat pesanan
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

  const selectedLayanan = layananList.find((l) => l.id === formData.layananId);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Buat Pesanan Baru
          </h1>
          <p className="text-gray-600">
            Isi form di bawah untuk membuat pesanan layanan
          </p>
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

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Service Selection */}
            <div>
              <label
                htmlFor="layananId"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Pilih Layanan *
              </label>
              {loadingLayanan ? (
                <div className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
              ) : (
                <select
                  id="layananId"
                  name="layananId"
                  value={formData.layananId || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  required
                >
                  <option value="">-- Pilih Layanan --</option>
                  {layananList.map((layanan) => (
                    <option key={layanan.id} value={layanan.id}>
                      {layanan.nama}{" "}
                      {layanan.hargaDasar &&
                        `(Rp ${layanan.hargaDasar.toLocaleString("id-ID")})`}
                    </option>
                  ))}
                </select>
              )}

              {/* Selected Service Preview */}
              {selectedLayanan && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    {selectedLayanan.urlGambar ? (
                      <img
                        src={selectedLayanan.urlGambar}
                        alt={selectedLayanan.nama}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
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
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-blue-900">
                        {selectedLayanan.nama}
                      </h3>
                      {selectedLayanan.deskripsi && (
                        <p className="text-sm text-blue-700 mt-1">
                          {selectedLayanan.deskripsi}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Name and Phone Row */}
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
                  placeholder="Masukkan nama pelanggan"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="nomerHp"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Nomor HP *
                </label>
                <input
                  type="tel"
                  id="nomerHp"
                  name="nomerHp"
                  value={formData.nomerHp}
                  onChange={handleInputChange}
                  placeholder="08123456789 atau +628123456789"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: 08xxxxxxxxx atau +628xxxxxxxxx
                </p>
              </div>
            </div>

            {/* Price Field (Optional) */}

            {/* Location */}
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
                placeholder="Masukkan alamat lengkap proyek"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="catatan"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Catatan Tambahan
              </label>
              <textarea
                id="catatan"
                name="catatan"
                value={formData.catatan}
                onChange={handleInputChange}
                rows={4}
                placeholder="Berikan detail tambahan tentang proyek Anda..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>

            {/* User Info Display */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
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
                  <p className="text-sm font-medium text-gray-900">Pemesan</p>
                  <p className="text-sm text-gray-600">
                    {session.user?.name || session.user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || loadingLayanan}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? <LoadingSpinner /> : "Buat Pesanan"}
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
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
              <h3 className="font-semibold text-blue-900 mb-2">
                Informasi Penting
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Pesanan akan diproses dalam 1x24 jam</li>
                <li>• Anda akan dihubungi via WhatsApp untuk konfirmasi</li>
                <li>• Harga dapat berubah setelah survei lokasi</li>
                <li>• Status pesanan dapat dipantau di dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
