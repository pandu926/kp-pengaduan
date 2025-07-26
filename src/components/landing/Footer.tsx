"use client";
import {
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";

export default function BookingAndFooter() {
  /* -------- 1. DATA SOURCES -------- */
  const socials = [
    {
      Icon: FaInstagram,
      href: "https://www.instagram.com/nana_cabin?utm_source=ig_web_button_share_sheet&igsh=djRrcTRwOHoxdThx",
      label: "Instagram",
    },
    {
      Icon: FaTiktok,
      href: "https://www.tiktok.com/@eka_rachma20?is_from_webapp=1&sender_device=pc",
      label: "TikTok",
    },
    {
      Icon: FaFacebookF,
      href: "https://www.facebook.com/nanacabin",
      label: "Facebook",
    },
    {
      Icon: FaYoutube,
      href: "https://www.youtube.com/@nanacabin",
      label: "YouTube",
    },
  ];

  const admins = [
    { name: "ADMIN 1", phone: "6282328616669" }, // ganti nomor
    { name: "ADMIN 2", phone: "6282237313502" }, // ganti nomor
  ];

  /* -------- 2. RENDER -------- */
  return (
    <section className="bg-white rounded-t-[20px] overflow-hidden">
      {/* === Booking Section === */}
      <div className="flex flex-col lg:flex-row items-start justify-between px-6 py-30 md:px-30 gap-10">
        {/* KIRI: Sosmed & Admin */}
        <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4">
          {/* 2-a. Sosmed */}
          <div className="grid grid-cols-2 gap-4">
            {socials.map(({ Icon, href, label }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-16 h-16 flex items-center justify-center rounded-xl
                           bg-[#fdf7ef] text-brown-800 text-xl
                           hover:bg-brown-800 hover:text-white transition"
              >
                <Icon />
              </a>
            ))}
          </div>

          {/* 2-b. Admin WhatsApp */}
          <div className="flex flex-col gap-4">
            {admins.map(({ name, phone }) => (
              <a
                key={phone}
                href={`https://wa.me/${phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-[#fdf7ef] px-4 py-3
                           rounded-full hover:bg-brown-800 transition group"
              >
                <div className="flex items-center gap-2">
                  <FaWhatsapp className="text-brown-800 group-hover:text-white" />
                  <span className="font-semibold text-brown-800 group-hover:text-white">
                    {name}
                  </span>
                </div>
                <FiArrowRight className="text-brown-800 group-hover:text-white" />
              </a>
            ))}
          </div>
        </div>

        {/* KANAN: Booking teks */}
        <div className="w-full lg:w-1/2">
          <h2 className="text-4xl md:text-5xl font-bold mb-3">
            Booking Sekarang
          </h2>
          <p className="text-gray-600 mb-4">
            Hubungi kami untuk cek ketersediaan dan harga spesial minggu ini!
          </p>
          <a
            href={`https://wa.me/${admins[0].phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#9b502f] text-white font-semibold
                       px-6 py-2 rounded-full hover:bg-[#843f26] transition"
          >
            Booking via WhatsApp
          </a>
        </div>
      </div>

      {/* === Footer === */}
      <footer className="bg-[#3b1f17] text-[#fef7ec] pt-10 pb-5 px-6 md:px-16 rounded-t-[30px] relative">
        <div className="text-2xl font-bold mb-2">NANA CABIN</div>
        <p className="text-sm mb-4">
          Liburan aman dan nyaman bersama kami — NANA CABIN Dieng
        </p>
        <div className="w-full h-[6px] rounded-full bg-[#fef7ec] mb-16" />

        {/* Tombol Back-to-Top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="absolute right-6 top-6 md:right-16 w-12 h-12 bg-[#fdf7ef]
                     rounded-full flex items-center justify-center text-brown-800
                     hover:bg-brown-800 hover:text-white transition"
          aria-label="Kembali ke atas"
        >
          <FiArrowRight className="-rotate-90" />
        </button>

        <div className="text-center text-sm text-[#fef7ec]/80 mt-10">
          © 2025 NANA CABIN. All rights reserved.
          <br />
          Denkhul Tech Solution
        </div>
      </footer>
    </section>
  );
}
