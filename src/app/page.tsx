import About from "../components/landing/About";
import Fasilitas from "../components/landing/Fasilitas";
import BookingAndFooter from "../components/landing/Footer";
import Gallery from "../components/landing/Gallery";
import Main from "../components/landing/Main";
import Navbar from "../components/landing/Navbar";
import TestimonialCards from "../components/landing/Testimoni";

export default function page() {
  return (
    <div>
      <Navbar />
      <Main />

      <Gallery />
      <About />
      <TestimonialCards />
      <BookingAndFooter />
    </div>
  );
}
