"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function FormPengaduan() {
  const router = useRouter();
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    nama: "",
    kontak: "",
    isi: "",
    lokasi: "",
    gambar: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    if (session?.user?.email) {
      // Cek apakah user sudah ada di database
      axios
        .get(`/api/user?email=${session.user.email}`)
        .then((res) => {
          if (res.data?.id) {
            setUserExists(true);
            setUserId(res.data.id);
          } else {
            setUserExists(false);
          }
        })
        .catch(() => setUserExists(false));
    }
  }, [session]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.isi) newErrors.isi = "Isi laporan wajib diisi";
    if (!userExists && !formData.nama) newErrors.nama = "Nama wajib diisi";
    if (!userExists && !formData.kontak)
      newErrors.kontak = "Kontak wajib diisi";
    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      let finalUserId = userId;

      if (!userExists && session?.user?.email) {
        // Buat user baru dulu
        const userRes = await axios.post("/api/user", {
          email: session.user.email,
          nama: formData.nama,
          kontak: formData.kontak,
        });
        finalUserId = userRes.data.id;
      }

      // Kirim pengaduan
      await axios.post("/api/pengaduan", {
        isi: formData.isi,
        lokasi: formData.lokasi,
        gambar: formData.gambar,
        userId: finalUserId,
      });

      alert("Pengaduan berhasil dikirim!");
      router.push("/user/dashboard");
    } catch (error) {
      console.error(error);
      alert("Gagal mengirim pengaduan.");
    } finally {
      setLoading(false);
    }
  };

  if (userExists === null) {
    return <p className="text-center mt-10">Memuat data pengguna...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          formulir pemesan online jasa kontruksi
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!userExists && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nama*
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border rounded-xl"
                />
                {errors.nama && (
                  <p className="text-red-500 text-sm">{errors.nama}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kontak (WA / HP)*
                </label>
                <input
                  type="text"
                  name="kontak"
                  value={formData.kontak}
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border rounded-xl"
                />
                {errors.kontak && (
                  <p className="text-red-500 text-sm">{errors.kontak}</p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Lokasi Kejadian
            </label>
            <input
              type="text"
              name="lokasi"
              value={formData.lokasi}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Isi Laporan*
            </label>
            <textarea
              name="isi"
              value={formData.isi}
              onChange={handleChange}
              rows={4}
              className="mt-1 w-full px-4 py-2 border rounded-xl"
            />
            {errors.isi && <p className="text-red-500 text-sm">{errors.isi}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Link Gambar (opsional)
            </label>
            <input
              type="text"
              name="gambar"
              value={formData.gambar}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-xl"
              placeholder="https://..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Mengirim..." : "Kirim Pengaduan"}
          </button>
        </form>
      </div>
    </div>
  );
}
