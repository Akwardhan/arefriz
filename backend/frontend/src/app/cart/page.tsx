import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import CartView from "@/components/cart/CartView"

export default function CartPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-white">
        <CartView />
      </main>
      <Footer />
    </>
  )
}
