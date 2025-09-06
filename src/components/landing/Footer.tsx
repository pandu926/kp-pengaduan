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

      {/* === Footer === */}
      <footer className="bg-[#3b1f17] text-[#fef7ec] pt-10 pb-5 px-6 md:px-16 rounded-t-[30px] relative">
        <div className="text-2xl font-bold mb-2">Arfilla Jaya Putra</div>
        <p className="text-sm mb-4 capitalize">
          serahkan pembangunan rumahmu bersama kami
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
          © 2025 Arfilla Jaya Putra. All rights reserved.
          <br />
          Denkhul Tech Solution
        </div>
      </footer>
    </section>
  );
}
