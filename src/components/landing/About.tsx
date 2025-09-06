export default function About() {
  return (
    <section id="about" className="bg-[#A75E2B] text-white py-20 px-6 md:px-20">
      <div className="max-w-6xl mx-5 md:mx-40 flex flex-row items-start gap-8">
        {/* Garis putus-putus */}
        <div className="flex flex-col items-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-2 h-8 bg-white rounded-full mb-4" />
          ))}
        </div>

        {/* Teks */}
        <div className="pl-2 md:pl-20">
          <h2 className="text-xl md:text-3xl font-bold mb-4">ABOUT</h2>
          <p className="text-sm md:text-lg leading-relaxed w-full md:w-2/4">
            CV Arfilla Jaya Putra merupakan perusahaan yang bergerak di bidang
            konstruksi dengan komitmen menghadirkan hasil kerja yang
            berkualitas, tepat waktu, dan berdaya guna.
            <br />
            Dengan pengalaman dan tenaga profesional, kami melayani pembangunan
            infrastruktur, gedung, serta proyek konstruksi lainnya yang
            mengutamakan standar mutu dan kepuasan klien.
            <br />
            Kami percaya bahwa setiap proyek adalah wujud tanggung jawab dan
            kepercayaan, sehingga kami selalu berusaha memberikan yang terbaik
            untuk mendukung pembangunan yang berkelanjutan.
          </p>
        </div>
      </div>
    </section>
  );
}
