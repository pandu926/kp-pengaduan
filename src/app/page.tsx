import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-white p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-700 mb-4">
          Sistem Pengaduan Masyarakat Desa Timbang
        </h1>
        <p className="text-gray-700 text-lg mb-8 max-w-xl mx-auto">
          Laporkan keluhan Anda secara langsung kepada pihak desa. Kami siap
          mendengarkan dan menindaklanjuti setiap laporan dengan transparan.
        </p>

        <Link href="/user/pengaduan">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg transition">
            Buat Laporan
          </button>
        </Link>
      </div>
    </div>
  );
}
