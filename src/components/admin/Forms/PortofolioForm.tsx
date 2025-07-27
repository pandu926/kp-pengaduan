"use client";

import { useState, useEffect } from "react";
import { Portofolio } from "@/lib/types";
import Button from "../Common/Button";

interface PortofolioFormProps {
  portofolio?: Portofolio | null;
  onSubmit: (data: Partial<Portofolio>) => void;
  onCancel: () => void;
}

const PortofolioForm = ({
  portofolio,
  onSubmit,
  onCancel,
}: PortofolioFormProps) => {
  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    urlGambar: "",
    tanggalSelesai: "",
  });

  useEffect(() => {
    if (portofolio) {
      setFormData({
        judul: portofolio.judul,
        deskripsi: portofolio.deskripsi || "",
        urlGambar: portofolio.urlGambar || "",
        tanggalSelesai: portofolio.tanggalSelesai || "",
      });
    }
  }, [portofolio]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Judul Proyek
        </label>
        <input
          type="text"
          value={formData.judul}
          onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

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
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL Gambar
        </label>
        <input
          type="url"
          value={formData.urlGambar}
          onChange={(e) =>
            setFormData({ ...formData, urlGambar: e.target.value })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tanggal Selesai
        </label>
        <input
          type="date"
          value={formData.tanggalSelesai}
          onChange={(e) =>
            setFormData({ ...formData, tanggalSelesai: e.target.value })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="secondary" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit">{portofolio ? "Update" : "Simpan"}</Button>
      </div>
    </form>
  );
};

export default PortofolioForm;
