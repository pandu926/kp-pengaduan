"use client";

import { useState, useEffect } from "react";
import Button from "../Common/Button";

interface ProgresFormData {
  keterangan: string;
  persenProgres: number;
  urlDokumentasi: string;
}

interface ProgresFormProps {
  orderId: number; // ID pesanan langsung dari parent
  progres?: any | null; // Data progres jika edit
  onSubmit: (data: ProgresFormData & { pesananId: number }) => void;
  onCancel: () => void;
}

const ProgresForm = ({
  orderId,
  progres,
  onSubmit,
  onCancel,
}: ProgresFormProps) => {
  const [formData, setFormData] = useState<ProgresFormData>({
    keterangan: "",
    persenProgres: 0,
    urlDokumentasi: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form data ketika progres berubah
  useEffect(() => {
    if (progres) {
      setFormData({
        keterangan: progres.keterangan || "",
        persenProgres: progres.persenProgres || 0,
        urlDokumentasi: progres.urlDokumentasi || "",
      });
    } else {
      // Reset ke default jika tidak ada progres (mode tambah)
      setFormData({
        keterangan: "",
        persenProgres: 0,
        urlDokumentasi: "",
      });
    }
  }, [progres]);

  const handleChange = (
    field: keyof ProgresFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Validasi form
    if (!formData.keterangan.trim()) {
      alert("Keterangan wajib diisi");
      return;
    }

    if (formData.persenProgres < 0 || formData.persenProgres > 100) {
      alert("Persentase progres harus antara 0-100");
      return;
    }

    try {
      setIsSubmitting(true);

      // Kirim data dengan pesananId otomatis
      await onSubmit({
        ...formData,
        pesananId: orderId,
      });
    } catch (error) {
      console.error("Error submitting progress:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Info ID Pesanan - readonly */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ID Pesanan
        </label>
        <div className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
          #{orderId.toString().padStart(6, "0")}
        </div>
      </div>

      {/* Keterangan */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Keterangan <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.keterangan}
          onChange={(e) => handleChange("keterangan", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows={3}
          placeholder="Masukkan keterangan progres..."
          required
        />
      </div>

      {/* Persentase Progres */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Persentase Progres (%) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            max="100"
            value={formData.persenProgres}
            onChange={(e) =>
              handleChange("persenProgres", parseInt(e.target.value) || 0)
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
            required
          />
          <div className="absolute right-3 top-3 text-gray-500 text-sm">%</div>
        </div>
        {/* Progress Bar Preview */}
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(Math.max(formData.persenProgres, 0), 100)}%`,
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Preview: {formData.persenProgres}% selesai
          </p>
        </div>
      </div>

      {/* URL Dokumentasi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL Dokumentasi
        </label>
        <input
          type="url"
          value={formData.urlDokumentasi}
          onChange={(e) => handleChange("urlDokumentasi", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://example.com/dokumentasi"
        />
        <p className="text-xs text-gray-500 mt-1">
          Opsional: Link ke foto/video dokumentasi progres
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className={`${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {progres ? "Updating..." : "Menyimpan..."}
            </>
          ) : progres ? (
            "Update Progres"
          ) : (
            "Simpan Progres"
          )}
        </Button>
      </div>
    </form>
  );
};

export default ProgresForm;
