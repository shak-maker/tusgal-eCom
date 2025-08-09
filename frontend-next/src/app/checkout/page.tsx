'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, CreditCard, Truck, Shield } from 'lucide-react'

type CartItem = {
  id: string
  product: {
    id: string
    name: string
    imageUrl: string
    price: number
  }
  quantity: number
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  })

  useEffect(() => {
    async function fetchCart() {
      try {
        const res = await fetch('/api/cart')
        if (!res.ok) throw new Error('Failed to fetch cart')
        const data = await res.json()
        setCartItems(data)
      } catch (err) {
        console.error('Failed to fetch cart items:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCart()
  }, [])

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement order creation
    alert('Order placement functionality will be implemented next')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-lg p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Таны сагс хоосон байна.</h2>
            <p className="text-gray-600 mb-8">Та төлбөрөө хийхийн тулд сагсандаа шил сонгоно уу.</p>
            <Link 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Дэлгүүр хэсэх
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              href="/cart" 
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Сасруу буцах</span>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Төлбөрөө төлөх</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Захиалгийн хураангуй</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      width={60}
                      height={60}
                      className="rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">Ширхэг: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ₮ {(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Захиалгийн дүн</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Нийт дүн({itemCount} items)</span>
                  <span>₮ {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Хүргэлт</span>
                  <span>Үнэгүй</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Нийт</span>
                    <span>₮ {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Хүргэлтийн мэдээлэл</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Бүтэн нэр
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Э-майл
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Утасны дугаар
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Хаяг
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      Хот 
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                      ЗИП код
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Захиалга хийх
                </button>
              </form>
            </div>

            {/* Security & Shipping Info */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <Shield size={24} className="text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Аюулгүй төлбөрийн систем</span>
                  <span className="text-xs text-gray-600">Таны мэдээлэл хамгаалагдсан </span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <Truck size={24} className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">Үнэгүй хүргэлт</span>
                  <span className="text-xs text-gray-600">100'000₮ өөс дээш худалдан авалтанд</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <CreditCard size={24} className="text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">QPay төлбөрийн систем</span>
                  <span className="text-xs text-gray-600">Та QR код уншуулан төлбөрөө хийнэ үү</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
