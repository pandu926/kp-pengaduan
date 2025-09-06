"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const testimonials = [
  {
    name: "Budi Santoso",
    location: "Bekasi, Indonesia",
    image: "/assets/testi/kontruksi1.jpg",
    rating: 5,
    title: "Proyek Tepat Waktu & Berkualitas!",
    message:
      "Tim konstruksi sangat profesional dan selalu on-time. Saya membangun rumah 2 lantai, dan hasil akhirnya lebih dari ekspektasi. Material berkualitas, dan prosesnya transparan. Recommended banget!",
  },
  {
    name: "Maria Lestari",
    location: "Depok, Indonesia",
    image: "/assets/testi/kontruksi2.jpg",
    rating: 4,
    title: "Desain & Eksekusi Bagus",
    message:
      "Saya pakai jasa ini untuk renovasi rumah lama jadi lebih modern. Desain arsiteknya keren dan tim tukangnya detail banget. Hanya sedikit delay karena cuaca, tapi overall puas.",
  },
  {
    name: "Andi Wijaya",
    location: "Tangerang, Indonesia",
    image: "/assets/testi/kontruksi3.jpg",
    rating: 5,
    title: "Bangun Ruko Cepat & Rapi",
    message:
      "Saya kontrak mereka untuk bangun ruko 2 lantai. Prosesnya cepat, timnya komunikatif, dan hasil akhir sangat rapi. Biaya juga transparan sejak awal. Terima kasih!",
  },
  {
    name: "Rina Dewi",
    location: "Bogor, Indonesia",
    image: "/assets/testi/kontruksi4.jpg",
    rating: 4,
    title: "Renovasi Dapur Sangat Memuaskan",
    message:
      "Renovasi dapur selesai dalam 2 minggu. Hasilnya bikin rumah jadi lebih nyaman dan estetik. Pekerjanya sopan dan rapi. Mungkin bisa ditingkatkan di bagian follow-up pasca proyek.",
  },
  {
    name: "Fajar Pratama",
    location: "Cirebon, Indonesia",
    image: "/assets/testi/kontruksi5.jpg",
    rating: 5,
    title: "Bangun Rumah Impian Jadi Nyata",
    message:
      "Terima kasih untuk semua tim! Saya bisa punya rumah impian berkat bantuan mereka. Dari gambar 3D sampai finishing, semua sesuai harapan. Kualitas bangunan juga sangat bagus.",
  },
  {
    name: "Sinta Mulyani",
    location: "Semarang, Indonesia",
    image: "/assets/testi/kontruksi6.jpg",
    rating: 5,
    title: "Profesional & Responsif",
    message:
      "Tim sangat responsif dari awal sampai akhir. Proyek renovasi interior kantor berjalan lancar. Komunikasi jelas dan pengerjaan sesuai timeline. Sangat puas dengan pelayanannya!",
  },
];

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`w-4 h-4 ${filled ? "text-yellow-400" : "text-gray-300"}`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.357 4.176h4.388c.969 0 1.371 1.24.588 1.81l-3.553 2.582 1.357 4.176c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.553 2.582c-.785.57-1.84-.197-1.54-1.118l1.357-4.176-3.553-2.582c-.783-.57-.38-1.81.588-1.81h4.388l1.357-4.176z" />
    </svg>
  );
}

export default function Testimonials() {
  const [ref, inView] = useInView({
    triggerOnce: false, // agar animasi bisa berulang setiap masuk viewport
    threshold: 0.1,
  });

  return (
    <section
      ref={ref}
      className="max-w-7xl mx-auto px-4 md:px-8 py-16 text-center"
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
        className="text-lg text-gray-500 mb-2"
      >
        Apa Kata Tamu Tentang
      </motion.h2>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-4xl md:text-6xl font-bold text-black"
      >
        Arfilla <span className="text-purple-600">Jaya Putra</span>
      </motion.h1>

      <motion.div
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.15,
            },
          },
          hidden: {},
        }}
        className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="p-[4px] rounded-2xl bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 shadow-md"
          >
            <div className="bg-white rounded-[16px] p-6 h-full">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.location}</p>
                </div>
                <div className="flex mb-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} filled={index < t.rating} />
                  ))}
                </div>
              </div>

              <h4 className="font-medium text-base mb-1">{t.title}</h4>
              <p className="text-sm text-gray-600">{t.message}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
