"use client";

import { useState, useEffect } from "react";
import { Pesanan, StatusPesanan } from "@/lib/types";
import Button from "../Common/Button";

interface Layanan {
  id: number;
  nama: string;
}

interface PesananFormProps {
  pesanan?: Pesanan | null;
  onSubmit: (data: Partial<Pesanan>) => void;
  onCancel: () => void;
}

const PesananForm = ({ pesanan, onSubmit, onCancel }: PesananFormProps) => {
  const [layananList, setLayananList] = useState<Layanan[]>([]);
  const [formData, setFormData] = useState<Partial<Pesanan>>({
    penggunaId: undefined,
    namaPelanggan: "",
    layananId: undefined,
    hargaDisepakati: undefined,
    tanggalPesan: "",
    nomorHp: "",
    status: undefined,
    lokasi: "",
    catatan: "",
  });

  // Fetch daftar layanan
  useEffect(() => {
    const fetchLayanan = async () => {
      try {
        const res = await fetch("/api/layanan");
        const data = await res.json();
        setLayananList(data.data);
      } catch (err) {
        console.error("Gagal mengambil layanan:", err);
      }
    };
    fetchLayanan();
  }, []);

  // Prefill kalau ada pesanan (mode edit)
  useEffect(() => {
    if (pesanan) {
      setFormData({
        penggunaId: pesanan.penggunaId ?? undefined,
        namaPelanggan: pesanan.namaPelanggan ?? "",
        layananId: pesanan.layananId ?? undefined,
        hargaDisepakati: pesanan.hargaDisepakati ?? undefined,
        tanggalPesan: pesanan.tanggalPesan,
        nomorHp: pesanan.nomorHp,
        status: pesanan.status,
        lokasi: pesanan.lokasi ?? "",
        catatan: pesanan.catatan ?? "",
      });
    }
  }, [pesanan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.status) {
      alert("Status harus diisi");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ID Pengguna */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ID Pengguna (opsional)
        </label>
        <input
          type="number"
          value={formData.penggunaId ?? ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              penggunaId: e.target.value ? parseInt(e.target.value) : undefined,
            })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Nama Pelanggan */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nama Pelanggan
        </label>
        <input
          type="text"
          value={formData.namaPelanggan ?? ""}
          onChange={(e) =>
            setFormData({ ...formData, namaPelanggan: e.target.value })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Layanan */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pilih Layanan
        </label>
        <select
          value={formData.layananId ?? ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              layananId: e.target.value ? parseInt(e.target.value) : undefined,
            })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">-- Pilih Layanan --</option>
          {layananList?.map((layanan) => (
            <option key={layanan.id} value={layanan.id}>
              {layanan.nama}
            </option>
          ))}
        </select>
      </div>

      {/* Harga Disepakati */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Harga Disepakati
        </label>
        <input
          type="number"
          value={formData.hargaDisepakati ?? ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              hargaDisepakati: e.target.value
                ? parseFloat(e.target.value)
                : undefined,
            })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Tanggal Pesan */}
      {/* <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tanggal Pesan
        </label>
        <input
          type="datetime-local"
          value={formData.tanggalPesan ?? ""}
          onChange={(e) =>
            setFormData({ ...formData, tanggalPesan: e.target.value })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div> */}

      {/* Nomor HP */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nomor HP
        </label>
        <input
          type="text"
          value={formData.nomorHp ?? ""}
          onChange={(e) =>
            setFormData({ ...formData, nomorHp: e.target.value })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={formData.status ?? ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              status: e.target.value as StatusPesanan,
            })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">-- Pilih Status --</option>
          {Object.values(StatusPesanan).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Lokasi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lokasi
        </label>
        <input
          type="text"
          value={formData.lokasi ?? ""}
          onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Catatan */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Catatan
        </label>
        <textarea
          value={formData.catatan ?? ""}
          onChange={(e) =>
            setFormData({ ...formData, catatan: e.target.value })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
      </div>

      {/* Actions */}
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
