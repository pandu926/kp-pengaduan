"use client";

import { useState, useEffect } from "react";
import { ProgresPesanan } from "@/lib/types";
import Button from "../Common/Button";

interface ProgresFormProps {
  progres?: ProgresPesanan | null;
  onSubmit: (data: Partial<ProgresPesanan>) => void;
  onCancel: () => void;
}

const ProgresForm = ({ progres, onSubmit, onCancel }: ProgresFormProps) => {
  const [formData, setFormData] = useState({
    pesananId: 0,
    keterangan: "",
    persenProgres: 0,
    urlDokumentasi: "",
  });

  useEffect(() => {
    if (progres) {
      setFormData({
        pesananId: progres.pesananId,
        keterangan: progres.keterangan || "",
        persenProgres: progres.persenProgres,
        urlDokumentasi: progres.urlDokumentasi || "",
      });
    }
  }, [progres]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ID Pesanan
        </label>
        <input
          type="number"
          value={formData.pesananId}
          onChange={(e) =>
            setFormData({ ...formData, pesananId: parseInt(e.target.value) })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Keterangan
        </label>
        <textarea
          value={formData.keterangan}
          onChange={(e) =>
            setFormData({ ...formData, keterangan: e.target.value })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Persentase Progres (%)
        </label>
        <input
          type="number"
          min="0"
          max="100"
          value={formData.persenProgres}
          onChange={(e) =>
            setFormData({
              ...formData,
              persenProgres: parseInt(e.target.value),
            })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL Dokumentasi
        </label>
        <input
          type="url"
          value={formData.urlDokumentasi}
          onChange={(e) =>
            setFormData({ ...formData, urlDokumentasi: e.target.value })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="secondary" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit">{progres ? "Update" : "Simpan"}</Button>
      </div>
    </form>
  );
};

export default ProgresForm;
