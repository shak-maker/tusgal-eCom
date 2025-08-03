import ProductForm from '@/components/ProductForm'

export default function AdminProductsPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#614385] to-[#516395] relative overflow-hidden">
      {/* Background blur overlay */}
      <div className="absolute inset-0 backdrop-blur-md bg-white/10 z-0" />

      {/* Centered content card */}
      <div className="z-10 max-w-xl w-full bg-white/30 backdrop-blur-lg rounded-2xl shadow-2xl p-10 border border-white/40">
        <h1 className="text-3xl font-bold mb-6 text-white drop-shadow">Add New Glasses Product</h1>
        <ProductForm />
      </div>
    </main>
  )
}
