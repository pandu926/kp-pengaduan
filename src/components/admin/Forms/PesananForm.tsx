"use client";

import { useState, useEffect } from "react";
import { Pesanan, StatusPesanan } from "@/lib/types";
import Button from "../Common/Button";

interface PesananFormProps {
  pesanan?: Pesanan | null;
  onSubmit: (data: Partial<Pesanan>) => void;
  onCancel: () => void;
}

const PesananForm = ({ pesanan, onSubmit, onCancel }: PesananFormProps) => {
  const [formData, setFormData] = useState({
    penggunaId: 0,
    layananId: 0,
    hargaDisepakati: 0,
    tanggalPesan: "",
    status: StatusPesanan.MENUNGGU,
    lokasi: "",
    catatan: "",
  });

  useEffect(() => {
    if (pesanan) {
      setFormData({
        penggunaId: pesanan.penggunaId,
        layananId: pesanan.layananId || 0,
        hargaDisepakati: pesanan.hargaDisepakati || 0,
        tanggalPesan: pesanan.tanggalPesan,
        status: pesanan.status,
        lokasi: pesanan.lokasi || "",
        catatan: pesanan.catatan || "",
      });
    }
  }, [pesanan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ID Pengguna
        </label>
        <input
          type="number"
          value={formData.penggunaId}
          onChange={(e) =>
            setFormData({ ...formData, penggunaId: parseInt(e.target.value) })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ID Layanan
        </label>
        <input
          type="number"
          value={formData.layananId}
          onChange={(e) =>
            setFormData({ ...formData, layananId: parseInt(e.target.value) })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Harga Disepakati
        </label>
        <input
          type="number"
          value={formData.hargaDisepakati}
          onChange={(e) =>
            setFormData({
              ...formData,
              hargaDisepakati: parseFloat(e.target.value),
            })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tanggal Pesan
        </label>
        <input
          type="datetime-local"
          value={formData.tanggalPesan}
          onChange={(e) =>
            setFormData({ ...formData, tanggalPesan: e.target.value })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) =>
            setFormData({
              ...formData,
              status: e.target.value as StatusPesanan,
            })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {Object.values(StatusPesanan).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lokasi
        </label>
        <input
          type="text"
          value={formData.lokasi}
          onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Catatan
        </label>
        <textarea
          value={formData.catatan}
          onChange={(e) =>
            setFormData({ ...formData, catatan: e.target.value })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="secondary" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit">{pesanan ? "Update" : "Simpan"}</Button>
      </div>
    </form>
  );
};

export default PesananForm;
