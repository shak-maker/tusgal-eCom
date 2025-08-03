'use client'

import { useState } from 'react'

export default function ProductForm() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    stock: '',
    faceShape: '',
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
      }),
    })

    setLoading(false)
    if (res.ok) {
      alert('✅ Product added successfully!')
      setForm({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        stock: '',
        faceShape: '',
      })
    } else {
      alert('❌ Failed to add product.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {[
        { label: 'Name', name: 'name' },
        { label: 'Description', name: 'description' },
        { label: 'Price', name: 'price' },
        { label: 'Image URL', name: 'imageUrl' },
        { label: 'Stock Quantity', name: 'stock' },
        { label: 'Face Shape', name: 'faceShape' },
      ].map(({ label, name }) => (
        <input
          key={name}
          type="text"
          name={name}
          value={form[name as keyof typeof form]}
          onChange={handleChange}
          placeholder={label}
          className="w-full bg-white/80 text-gray-900 placeholder-gray-500 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
          required
        />
      ))}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-white/20 text-white border border-white/30 backdrop-blur-md rounded-lg px-4 py-2 font-semibold transition duration-300 hover:bg-white/30 hover:text-white hover:scale-105 active:scale-100 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : '🚀 Add Product'}
      </button>
    </form>
  )
}
