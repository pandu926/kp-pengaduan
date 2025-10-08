import React, { useState } from "react";

interface InfoRekening {
  bank: string;
  nomorRekening: string;
  atasNama: string;
  catatan: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  dpAmount: number;
  kodeUnik: number;
  totalPembayaran: number;
  infoRekening: InfoRekening | null;
  onUploadBukti: (imageUrl: string) => Promise<void>;
  uploadLoading: boolean;
  typePembayaran: "DP" | "PELUNASAN";
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  orderId,
  dpAmount,
  kodeUnik,
  totalPembayaran,
  infoRekening,
  onUploadBukti,
  uploadLoading,
  typePembayaran,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      alert("Format file tidak valid. Gunakan JPG, PNG");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImageToAPI = async (file: File): Promise<string> => {
    const uploadFormData = new FormData();
    uploadFormData.append("image", file);

    const response = await fetch("https://apigambar.denkhultech.com/upload", {
      method: "POST",
      body: uploadFormData,
    });

    if (!response.ok) {
      throw new Error("Gagal mengupload gambar");
    }

    const result = await response.json();
    console.log(result);
    return `https://apigambar.denkhultech.com/uploads/${result.fileName}`;
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Silakan pilih file terlebih dahulu");
      return;
    }

    try {
      setUploading(true);

      // Upload image to API first
      const imageUrl = await uploadImageToAPI(selectedFile);

      // Then save the URL to database via parent handler
      await onUploadBukti(imageUrl);

      // Clear state
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Gagal mengupload bukti pembayaran. Silakan coba lagi.");
    } finally {
      setUploading(false);
    }
  };

  const isLoading = uploading || uploadLoading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10  bg-opacity-20 rounded-lg flex items-center justify-center">
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
            </div>
            <div>
              <h2 className="text-xl font-bold">Pembayaran </h2>
              <p className="text-blue-100 text-sm">
                Pesanan #{orderId.toString().padStart(6, "0")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8  bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Payment Amount */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">
                Total Pembayaran {typePembayaran}
              </p>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {formatCurrency(totalPembayaran)}
              </div>
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-blue-200">
                <div className="text-sm">
                  <span className="text-gray-600">DP: </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(dpAmount)}
                  </span>
                  <span className="text-gray-600"> + Kode Unik: </span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(kodeUnik)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Alert */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <svg
              className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Penting!</p>
              <p>
                Transfer <strong>TEPAT</strong> sesuai nominal{" "}
                <strong className="text-amber-900">
                  {formatCurrency(totalPembayaran)}
                </strong>{" "}
                (termasuk kode unik) untuk mempermudah verifikasi otomatis.
              </p>
            </div>
          </div>

          {/* Bank Info */}
          {infoRekening && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-900">
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <h3 className="font-semibold text-lg">Informasi Rekening</h3>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                {/* Bank Name */}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Nama Bank</p>
                    <p className="font-bold text-gray-900 text-lg">
                      {infoRekening.bank}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
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
                </div>

                {/* Account Number */}
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Nomor Rekening</p>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono font-bold text-gray-900 text-xl">
                      {infoRekening.nomorRekening}
                    </p>
                    <button
                      onClick={() =>
                        handleCopy(infoRekening.nomorRekening, "rekening")
                      }
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      {copiedField === "rekening" ? (
                        <>
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Tersalin
                        </>
                      ) : (
                        <>
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
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          Salin
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Account Name */}
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Atas Nama</p>
                  <p className="font-semibold text-gray-900 text-lg">
                    {infoRekening.atasNama}
                  </p>
                </div>

                {/* Amount to Transfer */}
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white">
                  <p className="text-xs text-blue-100 mb-2">
                    Jumlah Transfer (TEPAT)
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono font-bold text-2xl">
                      Rp {totalPembayaran.toLocaleString("id-ID")}
                    </p>
                    <button
                      onClick={() =>
                        handleCopy(totalPembayaran.toString(), "amount")
                      }
                      className="flex items-center gap-2 px-3 py-2  bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors text-sm font-medium"
                    >
                      {copiedField === "amount" ? (
                        <>
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Tersalin
                        </>
                      ) : (
                        <>
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
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          Salin
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Note */}
                {infoRekening.catatan && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5"
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
                      <div className="text-xs text-blue-800">
                        <p className="font-semibold mb-1">Catatan:</p>
                        <p>{infoRekening.catatan}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-900">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <h3 className="font-semibold text-lg">Upload Bukti Transfer</h3>
            </div>

            <div className="space-y-4">
              {/* File Input */}
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 hover:border-purple-400 rounded-xl p-8 text-center transition-colors cursor-pointer bg-gray-50 hover:bg-purple-50">
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-gray-700 font-medium mb-1">
                    {selectedFile ? selectedFile.name : "Klik untuk pilih file"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Format: JPG, PNG (Maks. 5MB)
                  </p>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileSelect}
                    disabled={isLoading}
                    className="hidden"
                  />
                </div>
              </label>

              {/* Preview */}
              {previewUrl && (
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Preview:
                  </p>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-contain bg-gray-50 rounded-lg"
                  />
                </div>
              )}

              {/* Upload Button */}
              {selectedFile && (
                <button
                  onClick={handleUpload}
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {uploading ? "Mengupload gambar..." : "Menyimpan..."}
                    </>
                  ) : (
                    <>
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
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      Upload Bukti Pembayaran
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-5">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Instruksi Pembayaran
            </h4>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 flex-shrink-0">
                  1.
                </span>
                <span>
                  Transfer <strong>TEPAT</strong> sesuai nominal{" "}
                  <strong>{formatCurrency(totalPembayaran)}</strong> (termasuk
                  kode unik {formatCurrency(kodeUnik)})
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 flex-shrink-0">
                  2.
                </span>
                <span>
                  Pastikan transfer ke rekening{" "}
                  <strong>{infoRekening?.bank}</strong> a.n.{" "}
                  <strong>{infoRekening?.atasNama}</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 flex-shrink-0">
                  3.
                </span>
                <span>
                  Ambil screenshot atau foto bukti transfer yang jelas
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 flex-shrink-0">
                  4.
                </span>
                <span>Upload bukti transfer melalui form di atas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 flex-shrink-0">
                  5.
                </span>
                <span>Tunggu verifikasi admin (maksimal 1x24 jam)</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
