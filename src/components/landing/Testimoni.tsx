"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const testimonials = [
  {
    name: "Sari P.",
    location: "Jakarta, Indonesia",
    image: "/assets/testi/2.jpg",
    rating: 5,
    title: "Liburan Paling Damai!",
    message:
      "Suasananya tenang banget! Bangun pagi disambut kabut dan pemandangan hijau yang adem banget. Kamarnya bersih, kasurnya empuk, dan yang paling penting mandi air hangatnya juara! Ini villa cocok buat kamu yang pengen istirahat dari ribetnya kota.",
  },
  {
    name: "Yoga A.",
    location: "Bandung, Indonesia",
    image: "/assets/testi/1.jpg",
    rating: 5,
    title: "Beneran Healing, Bukan Sekadar Staycation",
    message:
      "Nginep di Villa Nana tuh bener-bener bikin kepala plong. Dapurnya lengkap, bisa masak sendiri, terus makan sambil lihat pemandangan luar biasa. Gak nyangka Dieng bisa senyaman ini. Udah kayak punya rumah di pegunungan!",
  },
  {
    name: "Dina R.",
    location: "Yogyakarta, Indonesia",
    image: "/assets/testi/3.jpg",
    rating: 4,
    title: "Cocok Buat Keluarga",
    message:
      "Aku nginep bareng keluarga dan semuanya betah. Anak-anak bisa main di halaman, orang tuaku suka suasananya yang tenang. Satu hal aja: akses jalannya sempit kalau bawa mobil gede. Tapi selebihnya top banget!",
  },
  {
    name: "Rafi Z.",
    location: "Surabaya, Indonesia",
    image: "/assets/testi/4.jpg",
    rating: 5,
    title: "Lebih Bagus dari Ekspektasi!",
    message:
      "Jujur awalnya gak ekspektasi tinggi, tapi ternyata tempatnya keren banget. Kabin nyaman, fasilitas lengkap, dan pemandangannya luar biasa. Cocok buat self-reward setelah kerja terus-terusan!",
  },
  {
    name: "Wulan T.",
    location: "Semarang, Indonesia",
    image: "/assets/testi/5.jpg",
    rating: 5,
    title: "Tenang, Adem, Ngangenin!",
    message:
      "Udara sejuk, kamar bersih, staff ramah banget. Aku sampai gak mau pulang rasanya. Cocok buat pasangan yang pengen quality time tanpa gangguan. Pasti balik lagi ke sini!",
  },
  {
    name: "Teguh N.",
    location: "Bogor, Indonesia",
    image: "/gallery/1.png",
    rating: 4,
    title: "Worth It Banget!",
    message:
      "Villa ini punya semua yang saya cari: tenang, bersih, nyaman. Ada water heater, dapur, dan tempat tidur super empuk. Nilai plus buat suasana paginya yang damai banget. Recommended!",
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
        Villa <span className="text-purple-600">Nana</span>
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
                <Image
                  src={t.image}
                  alt={t.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover w-10 h-10"
                />
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
