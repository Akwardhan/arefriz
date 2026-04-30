import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import CheckoutView from "@/components/checkout/CheckoutView"

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-white">
        <CheckoutView />
      </main>
      <Footer />
    </>
  )
}
