"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Layanan = {
  id: number;
  nama: string;
};

export default function FormPemesanan() {
  const router = useRouter();
  const { data: session } = useSession();

  const [layananList, setLayananList] = useState<Layanan[]>([]);
  const [formData, setFormData] = useState({
    nama: "",
    kontak: "",
    layananId: "",
    hargaDisepakati: "",
    tanggalPesan: "",
    lokasi: "",
    catatan: "",
    gambar: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    axios.get("/api/layanan").then((res) => {
      setLayananList(res.data);
    });
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
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
    if (!formData.layananId) newErrors.layananId = "Layanan wajib dipilih";
    if (!formData.hargaDisepakati)
      newErrors.hargaDisepakati = "Harga harus diisi";
    if (!formData.tanggalPesan) newErrors.tanggalPesan = "Tanggal harus diisi";
    if (!formData.lokasi) newErrors.lokasi = "Lokasi proyek wajib diisi";
    if (!formData.catatan)
      newErrors.catatan = "Deskripsi pekerjaan wajib diisi";
    if (!userExists && !formData.nama) newErrors.nama = "Nama wajib diisi";
    if (!userExists && !formData.kontak)
      newErrors.kontak = "Kontak wajib diisi";
    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
        const userRes = await axios.post("/api/user", {
          email: session.user.email,
          nama: formData.nama,
          kontak: formData.kontak,
        });
        finalUserId = userRes.data.id;
      }

      await axios.post("/api/pesanan", {
        penggunaId: finalUserId,
        layananId: Number(formData.layananId),
        hargaDisepakati: parseFloat(formData.hargaDisepakati),
        tanggalPesan: formData.tanggalPesan,
        lokasi: formData.lokasi,
        catatan: formData.catatan,
        gambar: formData.gambar,
      });

      alert("Pemesanan berhasil dikirim!");
      router.push("/user/dashboard");
    } catch (error) {
      console.error(error);
      alert("Gagal mengirim pemesanan.");
    } finally {
      setLoading(false);
    }
  };

  if (userExists === null) {
    return <p className="text-center mt-10">Memuat data pengguna...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white px-4 py-10">
      <div className="max-w-xl w-full bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
          Formulir Pemesanan Jasa Konstruksi
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!userExists && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap*
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300"
                />
                {errors.nama && (
                  <p className="text-red-500 text-sm">{errors.nama}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kontak (WhatsApp / HP)*
                </label>
                <input
                  type="text"
                  name="kontak"
                  value={formData.kontak}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300"
                />
                {errors.kontak && (
                  <p className="text-red-500 text-sm">{errors.kontak}</p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pilih Layanan*
            </label>
            <select
              name="layananId"
              value={formData.layananId}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-300"
            >
              <option value="">-- Pilih layanan --</option>
              {layananList.map((layanan) => (
                <option key={layanan.id} value={layanan.id}>
                  {layanan.nama}
                </option>
              ))}
            </select>
            {errors.layananId && (
              <p className="text-red-500 text-sm">{errors.layananId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Harga Disepakati (Rp)*
            </label>
            <input
              type="number"
              name="hargaDisepakati"
              value={formData.hargaDisepakati}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-300"
            />
            {errors.hargaDisepakati && (
              <p className="text-red-500 text-sm">{errors.hargaDisepakati}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Pemesanan*
            </label>
            <input
              type="date"
              name="tanggalPesan"
              value={formData.tanggalPesan}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-300"
            />
            {errors.tanggalPesan && (
              <p className="text-red-500 text-sm">{errors.tanggalPesan}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lokasi Proyek*
            </label>
            <input
              type="text"
              name="lokasi"
              value={formData.lokasi}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-300"
            />
            {errors.lokasi && (
              <p className="text-red-500 text-sm">{errors.lokasi}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi / Catatan*
            </label>
            <textarea
              name="catatan"
              value={formData.catatan}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 rounded-xl border border-gray-300"
            />
            {errors.catatan && (
              <p className="text-red-500 text-sm">{errors.catatan}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link Gambar Dokumentasi (Opsional)
            </label>
            <input
              type="text"
              name="gambar"
              value={formData.gambar}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-4 py-2 rounded-xl border border-gray-300"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-xl transition disabled:opacity-50"
          >
            {loading ? "Mengirim..." : "Kirim Pemesanan"}
          </button>
        </form>
      </div>
    </div>
  );
}
