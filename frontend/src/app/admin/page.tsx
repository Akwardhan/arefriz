import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import AdminDashboard from "@/components/admin/AdminDashboard"

export default function AdminPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen" style={{ background: "linear-gradient(160deg, #f0f4ff 0%, #f8faff 50%, #f3f0ff 100%)" }}>
        <AdminDashboard />
      </main>
      <Footer />
    </>
  )
}
