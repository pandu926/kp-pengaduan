"use client";

import { useState, useEffect } from "react";
import { Pengguna } from "@/lib/types";
import Button from "../Common/Button";

interface PenggunaFormProps {
  pengguna?: Pengguna | null;
  onSubmit: (data: Partial<Pengguna>) => void;
  onCancel: () => void;
}

const PenggunaForm = ({ pengguna, onSubmit, onCancel }: PenggunaFormProps) => {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    googleId: "",
  });

  useEffect(() => {
    if (pengguna) {
      setFormData({
        nama: pengguna.nama,
        email: pengguna.email,
        googleId: pengguna.googleId,
      });
    }
  }, [pengguna]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nama
        </label>
        <input
          type="text"
          value={formData.nama}
          onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Google ID
        </label>
        <input
          type="text"
          value={formData.googleId}
          onChange={(e) =>
            setFormData({ ...formData, googleId: e.target.value })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="secondary" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit">{pengguna ? "Update" : "Simpan"}</Button>
      </div>
    </form>
  );
};

export default PenggunaForm;
