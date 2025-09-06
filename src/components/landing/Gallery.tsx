"use client";

import Image from "next/image";

const images = [
  "/assets/gallery/1.jpg", // kiri besar
  "/assets/gallery/2.jpg", // kanan atas
  "/assets/gallery/3.jpg", // kanan bawah kiri
  "/assets/gallery/4.jpg", // kanan bawah kanan
];

export default function Gallery() {
  return (
    <section id="gallery" className="py-12  px-4 md:px-12 max-w-7xl mx-auto">
      <h2 className="text-2xl md:text-3xl  font-semibold text-center mb-8">
        Gallery
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kolom kiri - 1 gambar besar */}
        <div className="w-full h-full rounded-xl overflow-hidden shadow">
          <Image
            src={images[0]}
            alt="Main gallery"
            width={800}
            height={1000}
            className="object-cover w-full h-full"
          />
        </div>

        {/* Kolom kanan */}
        <div className="flex flex-col gap-4">
          {/* Gambar atas kanan */}
          <div className="rounded-xl overflow-hidden shadow">
            <Image
              src={images[1]}
              alt="Top right"
              width={800}
              height={300}
              className="object-cover w-full h-full"
            />
          </div>

          {/* Gambar bawah kanan - 2 kolom */}
          <div className="flex gap-4">
            <div className="w-1/2 rounded-xl overflow-hidden shadow">
              <Image
                src={images[2]}
                alt="Bottom right 1"
                width={400}
                height={300}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="w-1/2 rounded-xl overflow-hidden shadow">
              <Image
                src={images[3]}
                alt="Bottom right 2"
                width={400}
                height={300}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
