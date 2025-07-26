"use client";

import Image from "next/image";
import { useState } from "react";
import {
  FaBed,
  FaShower,
  FaGift,
  FaArrowRight,
  FaArrowDown,
  FaBurn,
  FaCouch,
  FaWifi,
  FaWater,
} from "react-icons/fa";
import { motion, Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function Fasilitas() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const features = [
    {
      key: "dapur",
      label: "Dapur",
      icon: <FaGift />,
      image: "/assets/img/kitchen.png",
    },
    {
      key: "water_heater",
      label: "Water Heater",
      icon: <FaBurn />,
      image: "/assets/img/bathroom.png",
    },
    {
      key: "living_room",
      label: "Living Room",
      icon: <FaCouch />,
      image: "/assets/img/lr.png",
    },
    {
      key: "shower",
      label: "Shower",
      icon: <FaShower />,
      image: "/assets/img/bathroom.png",
    },
    {
      key: "kasur",
      label: "Kasur 2 buah",
      icon: <FaBed />,
      image: "/assets/img/bed.png",
    },
    {
      key: "wifi",
      label: "wifi",
      icon: <FaWifi />,
      image: "/assets/img/fasilitas3.png",
    },
    {
      key: "drink",
      label: "welcome drink",
      icon: <FaWater />,
      image: "/assets/img/fasilitas3.png",
    },
  ];

  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.2 });

  const containerVariant: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariant: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  return (
    <section id="fasilitas" className="bg-white py-20 px-5 md:px-20" ref={ref}>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-4xl font-bold text-center mb-10"
      >
        Fasilitas
      </motion.h2>

      <motion.div
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={containerVariant}
        className="flex flex-col lg:flex-row justify-between gap-10"
      >
        {/* Kolom Kiri - fitur */}
        {/* Kolom Kiri - fitur */}
        <motion.div className="flex flex-col gap-4 w-full lg:w-1/3">
          {features.map((item) => (
            <motion.div
              key={item.key}
              variants={itemVariant}
              onClick={() =>
                setActiveFeature((prev) =>
                  prev === item.key ? null : item.key
                )
              }
              className={`bg-[#fdf8f1] p-4 rounded-2xl cursor-pointer transition-all duration-300`}
            >
              <div className="flex justify-between items-center mb-3 text-[#954C2E] font-semibold text-lg">
                <div className="flex gap-2 items-center">
                  {item.icon} {item.label}
                </div>
                {activeFeature === item.key ? (
                  <FaArrowDown />
                ) : (
                  <FaArrowRight />
                )}
              </div>

              {activeFeature === item.key && (
                <Image
                  src={item.image}
                  alt={item.label}
                  width={300}
                  height={200}
                  className="rounded-md"
                />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Kolom Tengah - deskripsi */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full lg:w-1/3 flex flex-col justify-center"
        >
          <p className="text-[#954C2E] text-lg leading-relaxed">
            Tidur nyenyak? Mandi air hangat di udara dingin? Masak mie rebus
            sendiri sambil ngopi di balkon? Semua bisa di Villa Nana! Kami
            lengkapi setiap unit dengan kasur empuk yang bikin mager, shower +
            water heater biar mandi tetap nikmat meski udara sedingin mantan,
            dan dapur pribadi buat kamu yang suka masak atau sekadar hangatkan
            hati. Liburan santai, fasilitas lengkap, tinggal bawa diri (dan
            cemilan favorit)!
          </p>
          <div className="mt-10 flex justify-center lg:justify-start">
            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">
              +
            </div>
          </div>
        </motion.div>

        {/* Kolom Kanan - Map */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="w-full lg:w-1/3"
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3958.2827851910783!2d109.90912747606997!3d-7.208545492797084!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e700d5523f01baf%3A0xbd09c8b3f52559c6!2sNana%20Cabin!5e0!3m2!1sid!2sid!4v1750866359621!5m2!1sid!2sid"
            width="600"
            height="600"
            loading="lazy"
            className="rounded-xl w-full"
          ></iframe>
        </motion.div>
      </motion.div>
    </section>
  );
}
