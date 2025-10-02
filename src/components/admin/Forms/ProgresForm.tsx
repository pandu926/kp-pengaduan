"use client";

import { useState, useEffect, useRef } from "react";
import Button from "../Common/Button";
import { Upload, X } from "lucide-react";

interface ProgresFormProps {
  orderId: number;
  initialData?: any | null; // Data progres jika edit
  onSubmit: (formData: FormData) => void | Promise<void>;
  onCancel: () => void;
}

const ProgresForm = ({
  orderId,
  initialData,
  onSubmit,
  onCancel,
}: ProgresFormProps) => {
  const [keterangan, setKeterangan] = useState("");
  const [persenProgres, setPersenProgres] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial data jika mode edit
  useEffect(() => {
    if (initialData) {
      setKeterangan(initialData.keterangan || "");
      setPersenProgres(initialData.persenProgres || 0);
      setImagePreview(initialData.urlDokumentasi || null);
    } else {
      setKeterangan("");
      setPersenProgres(0);
      setImagePreview(null);
      setImageFile(null);
    }
  }, [initialData]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG, PNG, GIF, dll)");
      return;
    }

    // Validasi ukuran file (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("Ukuran file maksimal 5MB");
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(initialData?.urlDokumentasi || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload image to external API
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
    return `https://apigambar.denkhultech.com/uploads/${result.fileName}`;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setError(null);

    // Validasi
    if (!keterangan.trim()) {
      setError("Keterangan tidak boleh kosong");
      return;
    }

    if (persenProgres < 0 || persenProgres > 100) {
      setError("Persentase progress harus antara 0-100");
      return;
    }

    try {
      setIsSubmitting(true);

      let imageUrl = initialData?.urlDokumentasi || "";

      // Upload gambar baru jika ada
      if (imageFile) {
        imageUrl = await uploadImageToAPI(imageFile);
      }

      // Jika user hapus gambar (tidak ada file dan tidak ada preview)
      if (!imageFile && !imagePreview) {
        imageUrl = "";
      }

      const formData = new FormData();
      formData.append("keterangan", keterangan);
      formData.append("persenProgres", persenProgres.toString());
      formData.append("pesananId", orderId.toString());
      formData.append("urlDokumentasi", imageUrl);

      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan progress");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Info ID Pesanan */}
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
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
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
            value={persenProgres}
            onChange={(e) => setPersenProgres(parseInt(e.target.value) || 0)}
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
                width: `${Math.min(Math.max(persenProgres, 0), 100)}%`,
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Preview: {persenProgres}% selesai
          </p>
        </div>
      </div>

      {/* Upload Dokumentasi Gambar */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dokumentasi (Opsional)
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Upload gambar dokumentasi progress. Maks 5MB, format: JPG, PNG, GIF
        </p>

        {/* Preview Area */}
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
              title="Hapus gambar"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
              {imageFile
                ? `${(imageFile.size / 1024 / 1024).toFixed(2)} MB`
                : "Gambar dari database"}
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-1">
              Klik untuk upload gambar
            </p>
            <p className="text-xs text-gray-500">
              atau drag & drop file disini
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
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
              {initialData ? "Updating..." : "Menyimpan..."}
            </>
          ) : initialData ? (
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
