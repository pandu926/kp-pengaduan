"use client";
import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = (): void => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Navbar */}
      <nav className="bg-white fixed w-full z-50 ">
        <div className="  px-5 sm:px-6 lg:px-20">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="text-2xl font-bold text-[#954C2E]">NANA CABIN</div>

            {/* Menu Desktop */}
            <div className="hidden md:flex text-xl space-x-6">
              <a
                href="#main"
                className="text-gray-700 hover:text-[#954C2E] px-4 py-2"
              >
                Beranda
              </a>
              <a
                href="#about"
                className="text-gray-700 hover:text-[#954C2E] px-4 py-2"
              >
                Tentang
              </a>
              <a
                href="#gallery"
                className="text-gray-700 hover:text-[#954C2E] px-4 py-2"
              >
                Galeri
              </a>
              <a
                href=" https://wa.me/6281234567890?text=Halo%20admin%20Villa%20Nana%2C%20saya%20ingin%20melakukan%20pemesanan.%20Mohon%20informasi%20ketersediaan%20dan%20cara%20booking%20nya%2C%20terima%20kasih."
                className="bg-[#954C2E] text-white font-semibold px-6 py-2 rounded-xl hover:bg-[#7c3e26]"
              >
                Booking
              </a>
            </div>

            {/* Hamburger (Mobile) */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-gray-700 text-2xl"
                aria-label="Toggle Menu"
              >
                {isOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white px-4 pb-4 shadow">
            <a
              href="#main"
              className="block py-2 text-gray-700 hover:text-[#954C2E]"
            >
              Beranda
            </a>
            <a
              href="#about"
              className="block py-2 text-gray-700 hover:text-[#954C2E]"
            >
              Tentang
            </a>
            <a
              href="#gallery"
              className="block py-2 text-gray-700 hover:text-[#954C2E]"
            >
              Galeri
            </a>
            <a
              href="#booking"
              className="block py-2 px-4 rounded bg-[#954C2E] text-white font-semibold hover:bg-[#7c3e26]"
            >
              Booking
            </a>
          </div>
        )}
      </nav>
    </>
  );
}
