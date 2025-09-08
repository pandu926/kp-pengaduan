"use client";

import { FaMapMarkerAlt } from "react-icons/fa";
import SliderClient from "./Slider";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function Main() {
  const [refLeft, inViewLeft] = useInView({
    threshold: 0.2,
    triggerOnce: false,
  });
  const [refRight, inViewRight] = useInView({
    threshold: 0.2,
    triggerOnce: false,
  });

  return (
    <main
      id="main"
      className="pt-20 px-5 md:px-20 flex flex-col md:flex-row justify-center gap-10"
    >
      {/* Kiri - Text */}
      <motion.div
        ref={refLeft}
        initial={{ opacity: 0, y: 30 }}
        animate={inViewLeft ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full md:w-1/2 pt-10 md:pt-20"
      >
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 text-[#954C2E] text-center md:text-left">
          Arfilla Jaya Putra
        </h1>
        <p className="text-gray-700 text-base sm:text-lg md:text-xl text-justify leading-relaxed">
          Kami adalah penyedia jasa konstruksi profesional yang melayani
          pembangunan rumah tinggal, ruko, renovasi bangunan, serta penyewaan
          alat berat seperti excavator dan molen. Dengan tim ahli dan
          berpengalaman, kami siap mewujudkan proyek Anda tepat waktu dan
          berkualitas tinggi.
        </p>

        {/* Tombol Booking dan Lokasi */}
        <div className="w-full mt-10">
          <div className="flex overflow-hidden rounded-full text-xl shadow-lg w-full max-w-md mx-auto md:mx-0">
            {/* Location */}
            <div className="flex items-center gap-2 bg-[#fdf8f1] text-[#a45a2a] px-4 py-3 w-full sm:w-1/2 justify-center sm:justify-start">
              <FaMapMarkerAlt className="text-lg" />
              <a
                href="https://maps.app.goo.gl/wekSu76w3LYYdNdW7"
                className="flex flex-col leading-tight"
              >
                <span className="font-semibold text-lg">Lokasi</span>
                <span className="text-xs">Kab. Wonosobo</span>
              </a>
            </div>

            {/* Book Now */}
            <a
              href="/user/pemesanan"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-1/2 bg-[#a45a2a] text-white font-semibold px-6 py-3 hover:bg-[#7c3e26] transition text-center inline-block rounded"
            >
              Pesan Sekarang
            </a>
          </div>
        </div>
      </motion.div>

      {/* Kanan - Gambar */}
      <motion.div
        ref={refRight}
        initial={{ opacity: 0, x: 30 }}
        animate={inViewRight ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        className="w-full md:w-1/2 pt-10 md:pt-24 px-4"
      >
        <SliderClient />
      </motion.div>
    </main>
  );
}
