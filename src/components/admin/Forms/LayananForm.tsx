"use client";

import { useState, useEffect } from "react";
import { Layanan } from "@/lib/types";
import Button from "../Common/Button";

interface LayananFormProps {
  layanan?: Layanan | null;
  onSubmit: (data: Partial<Layanan>) => void;
  onCancel: () => void;
}

const LayananForm = ({ layanan, onSubmit, onCancel }: LayananFormProps) => {
  const [formData, setFormData] = useState({
    nama: "",
    deskripsi: "",
    harga: 0,
  });

  useEffect(() => {
    if (layanan) {
      setFormData({
        nama: layanan.nama,
        deskripsi: layanan.deskripsi || "",
        harga: Number(layanan.harga) || 0,
      });
    }
  }, [layanan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Konversi harga ke number (atau string decimal jika backend memerlukan)
    onSubmit({
      ...formData,
      harga: parseFloat(formData.harga.toString()),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nama */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nama Layanan
        </label>
        <input
          type="text"
          value={formData.nama}
          onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Deskripsi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Deskripsi
        </label>
        <textarea
          value={formData.deskripsi}
          onChange={(e) =>
            setFormData({ ...formData, deskripsi: e.target.value })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
      </div>

      {/* Harga */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Harga per meter persegi (Rp)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.harga}
          onChange={(e) =>
            setFormData({ ...formData, harga: parseFloat(e.target.value) || 0 })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Tombol Aksi */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit">{layanan ? "Update" : "Simpan"}</Button>
      </div>
    </form>
  );
};

export default LayananForm;
