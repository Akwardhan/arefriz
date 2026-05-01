import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import TrustSection from "@/components/home/TrustSection";
import Footer from "@/components/layout/Footer";

export default function Page() {
  return (
    <>
      <Navbar />
      <Hero />
      <Categories />
      <TrustSection />
      <Footer />
    </>
  );
}
