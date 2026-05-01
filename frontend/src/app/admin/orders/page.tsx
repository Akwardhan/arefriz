import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import OrdersPanel from "@/components/admin/OrdersPanel"

export default function AdminOrdersPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen" style={{ background: "#F8FAFC" }}>
        <OrdersPanel />
      </main>
      <Footer />
    </>
  )
}
