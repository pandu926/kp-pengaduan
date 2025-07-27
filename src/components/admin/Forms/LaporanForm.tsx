"use client";

import { useState, useEffect } from "react";
import { Laporan } from "@/lib/types";
import Button from "../Common/Button";

interface LaporanFormProps {
  laporan?: Laporan | null;
  onSubmit: (data: Partial<Laporan>) => void;
  onCancel: () => void;
}

const LaporanForm = ({ laporan, onSubmit, onCancel }: LaporanFormProps) => {
  const [formData, setFormData] = useState({
    bulanLaporan: "",
    totalPesanan: "", // gunakan string
    totalPendapatan: "", // gunakan string
  });

  useEffect(() => {
    if (laporan) {
      setFormData({
        bulanLaporan: laporan.bulanLaporan || "",
        totalPesanan: laporan.totalPesanan?.toString() || "",
        totalPendapatan: laporan.totalPendapatan?.toString() || "",
      });
    }
  }, [laporan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // validasi konversi
    onSubmit({
      bulanLaporan: formData.bulanLaporan,
      totalPesanan: parseInt(formData.totalPesanan) || 0,
      totalPendapatan: parseFloat(formData.totalPendapatan) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bulan Laporan
        </label>
        <input
          type="month"
          value={formData.bulanLaporan}
          onChange={(e) =>
            setFormData({ ...formData, bulanLaporan: e.target.value })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Total Pesanan
        </label>
        <input
          type="number"
          value={formData.totalPesanan}
          onChange={(e) =>
            setFormData({ ...formData, totalPesanan: e.target.value })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Total Pendapatan
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.totalPendapatan}
          onChange={(e) =>
            setFormData({ ...formData, totalPendapatan: e.target.value })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="secondary" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit">{laporan ? "Update" : "Simpan"}</Button>
      </div>
    </form>
  );
};

export default LaporanForm;
