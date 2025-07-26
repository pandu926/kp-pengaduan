"use client";
import React from "react";
import Slider from "react-slick";
import Image from "next/image";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// 🔸 Ganti path sesuai file asli kamu
const imagePaths = [
  "/assets/img/1.jpg",
  "/assets/img/2.jpg",
  "/assets/img/3.jpg",
  "/assets/img/4.jpg",
  "/assets/img/5.jpg",
];

const NextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <div
      className="absolute -right-8 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer text-3xl text-[#a45a2a] hover:text-[#7c3e26]"
      onClick={onClick}
    >
      <FaArrowRight />
    </div>
  );
};

const PrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <div
      className="absolute -left-8 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer text-3xl text-[#a45a2a] hover:text-[#7c3e26]"
      onClick={onClick}
    >
      <FaArrowLeft />
    </div>
  );
};

export default function SliderClient() {
  const settings = {
    infinite: true,
    speed: 200,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <div className="relative overflow-visible">
      <Slider {...settings}>
        {imagePaths.map((src, index) => (
          <div key={index} className="w-full px-4 mx-auto mb-8 overflow-hidden">
            <Image
              src={src}
              alt={`rumah-${index}`}
              width={626}
              height={704}
              className="rounded-xl shadow-lg w-full h-auto"
              priority
            />
          </div>
        ))}
      </Slider>
    </div>
  );
}
