'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, ArrowLeft } from 'lucide-react'
import CartItem from '@/components/cartItem'
import { useOrderExtrasStore } from '@/lib/orderExtrasStore'
import { useUserPreferencesStore } from '@/lib/userPreferencesStore'

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

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { buyingEyeglasses, setBuyingEyeglasses, lensInfo, setLensInfo } = useOrderExtrasStore()
  const { pdCm } = useUserPreferencesStore()

  useEffect(() => {
    fetchCart()
  }, [])

  async function fetchCart() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/cart')
      if (!res.ok) throw new Error('Failed to fetch cart')
      const data = await res.json()
      setCartItems(data)
    } catch (err) {
      console.error('Failed to fetch cart items:', err)
      setError('Failed to load cart items')
    } finally {
      setLoading(false)
    }
  }

  async function updateQuantity(productId: string, newQuantity: number) {
    if (newQuantity < 1) return
    
    try {
      setUpdating(productId)
      const res = await fetch(`/api/cart/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity })
      })
      
      if (!res.ok) throw new Error('Failed to update quantity')
      
      setCartItems(prev => 
        prev.map(item => 
          item.product.id === productId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      )
    } catch (err) {
      console.error('Failed to update quantity:', err)
      setError('Failed to update quantity')
    } finally {
      setUpdating(null)
    }
  }

  async function removeItem(productId: string) {
    try {
      setUpdating(productId)
      const res = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE'
      })
      
      if (!res.ok) throw new Error('Failed to remove item')
      
      setCartItems(prev => prev.filter(item => item.product.id !== productId))
    } catch (err) {
      console.error('Failed to remove item:', err)
      setError('Failed to remove item')
    } finally {
      setUpdating(null)
    }
  }

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
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
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Үргэлжүүлэх</span>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Таны сагс</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex justify-center mb-6">
              <ShoppingBag size={64} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Таны сагс хоосон байна</h2>
            <p className="text-gray-600 mb-8">Та хараахан сагсанд бараа аваагүй байна</p>
            <Link 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Шилээ сонгох
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Сагсан дахь шилнүүд ({itemCount})
                  </h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.id}
                      product={item.product}
                      quantity={item.quantity}
                      onUpdateQuantity={updateQuantity}
                      onRemoveItem={removeItem}
                      isUpdating={updating === item.product.id}
                    />
                  ))}
                </div>

                {/* Eyeglasses toggle and lens form */}
                <div className="p-6 border-t border-gray-200">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={buyingEyeglasses}
                      onChange={(e) => setBuyingEyeglasses(e.target.checked)}
                    />
                    <span className="text-gray-800 font-medium">Та харааны шил захиалж байна уу?</span>
                  </label>

                  {buyingEyeglasses && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">PD (см)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="ж: 6.5"
                          defaultValue={lensInfo?.pdCm ?? pdCm ?? ''}
                          onChange={(e) => {
                            const v = parseFloat(e.target.value)
                            setLensInfo({
                              ...(lensInfo ?? {}),
                              pdCm: Number.isNaN(v) ? undefined : v,
                            })
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Баруун нүд хараа</label>
                        <input
                          type="text"
                          placeholder="ж: -1.25"
                          value={lensInfo?.rightVision ?? ''}
                          onChange={(e) => setLensInfo({ ...(lensInfo ?? {}), rightVision: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Зүүн нүд хараа</label>
                        <input
                          type="text"
                          placeholder="ж: -1.00"
                          value={lensInfo?.leftVision ?? ''}
                          onChange={(e) => setLensInfo({ ...(lensInfo ?? {}), leftVision: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm text-gray-700 mb-1">Тэмдэглэл</label>
                        <textarea
                          value={lensInfo?.notes ?? ''}
                          onChange={(e) => setLensInfo({ ...(lensInfo ?? {}), notes: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Захиалгийн хураангуй</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Дүн ({itemCount} Ширхэг)</span>
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

                <Link
                  href="/checkout"
                  className="w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors text-center block font-medium"
                >
                  Үргэлжүүлэн төлбөрөө хийх
                </Link>

                <div className="mt-4 text-center">
                  <Link 
                    href="/" 
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Дахин шил нэмэх
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
