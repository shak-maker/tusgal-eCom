'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, CreditCard, Truck, Shield } from 'lucide-react'
import dynamic from 'next/dynamic'
import { QPayPayment } from '@/components/QPayPayment'
import { useUserPreferencesStore } from '@/lib/userPreferencesStore'
import { useOrderExtrasStore } from '@/lib/orderExtrasStore'

const MapPicker = dynamic(() => import('./MapPicker'), { ssr: false })

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
  const { pdCm } = useUserPreferencesStore()
  const { buyingEyeglasses, lensInfo } = useOrderExtrasStore()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    district: '',
    city: '',
    postalCode: '',
    latitude: '',
    longitude: ''
  })
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [phoneTouched, setPhoneTouched] = useState(false)
  const emailDomains = [
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'icloud.com',
    'hotmail.com',
    'proton.me',
    'yandex.com'
  ]
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)

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
  const isPhoneValid = /^\d{8}$/.test(formData.phone)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target
    let { value } = e.target

    if (name === 'phone') {
      // Only allow digits and limit to 8 characters
      const digitsOnly = value.replace(/\D/g, '')
      value = digitsOnly.slice(0, 8)
    }

    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Map click handled inside MapPicker client-only component

  const getEmailSuggestions = (): string[] => {
    const email = formData.email.trim()
    if (!email) return []
    const [localPart, domainPart = ''] = email.split('@')
    if (!localPart) return []

    const normalizedDomainPart = domainPart.toLowerCase()
    const filtered = emailDomains.filter((d) =>
      normalizedDomainPart ? d.startsWith(normalizedDomainPart) : true
    )
    return filtered.slice(0, 5).map((d) => `${localPart}@${d}`)
  }

  const applyEmailSuggestion = (suggestion: string) => {
    setFormData((prev) => ({ ...prev, email: suggestion }))
    setShowEmailSuggestions(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const items = cartItems.map((ci) => ({ productId: ci.product.id, quantity: ci.quantity }))
      const shippingAddress = [
        formData.address,
        formData.district && `Дүүрэг: ${formData.district}`,
        formData.city && `Хот: ${formData.city}`,
        formData.postalCode && `ЗИП: ${formData.postalCode}`,
      ]
        .filter(Boolean)
        .join(', ')

      const payload = {
        items,
        shippingAddress,
        phone: formData.phone,
        email: formData.email,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        totalAmount: cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
        pdCm: typeof pdCm === 'number' ? pdCm : undefined,
        lensInfo: buyingEyeglasses ? lensInfo : undefined,
      }

      // Store order data and show payment
      setOrderData(payload)
      setShowPayment(true)
    } catch (err) {
      console.error(err)
      alert('Алдаа гарлаа. Дахин оролдоно уу.')
    }
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
                  <div className="relative">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Э-майл
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onFocus={() => setShowEmailSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowEmailSuggestions(false), 120)}
                      required
                      autoComplete="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                    {showEmailSuggestions && getEmailSuggestions().length > 0 && (
                      <ul className="absolute z-10 mt-1 w-full border border-gray-200 bg-white rounded-md shadow-lg max-h-56 overflow-auto">
                        {getEmailSuggestions().map((s) => (
                          <li key={s}>
                            <button
                              type="button"
                              className="w-full text-left px-3 py-2 hover:bg-gray-100"
                              onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault()} 
                              onClick={() => applyEmailSuggestion(s)}
                            >
                              {s}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
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
                    onBlur={() => setPhoneTouched(true)}
                    required
                    inputMode="numeric"
                    minLength={8}
                    maxLength={8}
                    pattern="^[0-9]{8}$"
                    title="8 digits required (e.g. 12345678)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  {phoneTouched && !isPhoneValid && (
                    <p className="mt-1 text-sm text-red-600">Утасны дугаар 8 цифр байх ёстой. Жишээ: 12345678</p>
                  )}
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
                    <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                      Дүүрэг
                    </label>
                    <input
                      type="text"
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
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

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Байршил (газрын зураг дээр товшоод сонгоно уу)</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Хаяг хайх (ж: Сүхбаатар дүүрэг 1-р хороо)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const q = (e.target as HTMLInputElement).value.trim()
                          if (!q) return
                          try {
                            const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`)
                            const data: Array<{ lat: string; lon: string }> = await r.json()
                            if (data && data[0]) {
                              const lat = parseFloat(data[0].lat)
                              const lon = parseFloat(data[0].lon)
                              setSelectedLocation({ lat, lng: lon })
                              setFormData((prev) => ({
                                ...prev,
                                latitude: String(lat.toFixed(6)),
                                longitude: String(lon.toFixed(6)),
                              }))
                            }
                          } catch (err) {
                            console.error('Search failed', err)
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="h-60 overflow-hidden rounded-lg border border-gray-300">
                    <MapPicker
                      selectedLocation={selectedLocation}
                      onSelect={(lat, lng) => {
                        setSelectedLocation({ lat, lng })
                        setFormData((prev) => ({
                          ...prev,
                          latitude: String(lat.toFixed(6)),
                          longitude: String(lng.toFixed(6)),
                        }))
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">Өргөрөг</label>
                      <input
                        type="text"
                        id="latitude"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        readOnly
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">Уртраг</label>
                      <input
                        type="text"
                        id="longitude"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        readOnly
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {!showPayment ? (
                  <button
                    type="submit"
                    disabled={!isPhoneValid}
                    className={`w-full py-3 px-6 rounded-lg transition-colors font-medium ${
                      isPhoneValid ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Захиалга хийх
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800 text-sm">
                        Захиалгийн мэдээлэл бэлэн боллоо. Төлбөрөө төлөх хэсэгт орно уу.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPayment(false)}
                      className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Захиалгийн мэдээлэл засах
                    </button>
                  </div>
                )}
                              </form>
              </div>

              {/* QPay Payment Section */}
              {showPayment && orderData && (
                <div className="mt-6">
                  {/* Lens info summary */}
                  {orderData?.lensInfo && (
                    <div className="mb-4 p-4 border border-blue-200 bg-blue-50 rounded-lg text-sm text-blue-900">
                      <div className="font-semibold mb-1">Лензийн мэдээлэл:</div>
                      <div>PD: {orderData.lensInfo.pdCm ?? pdCm ?? '—'} см</div>
                      <div>Баруун нүд: {orderData.lensInfo.rightVision ?? '—'}</div>
                      <div>Зүүн нүд: {orderData.lensInfo.leftVision ?? '—'}</div>
                      {orderData.lensInfo.notes && (
                        <div>Тэмдэглэл: {orderData.lensInfo.notes}</div>
                      )}
                    </div>
                  )}
                  <QPayPayment
                    cartItems={cartItems}
                    customerData={formData}
                    onPaymentSuccess={async (paymentData) => {
                      console.log('Payment successful:', paymentData)
                      
                      try {
                        // Create the actual order in the database
                        const orderPayload = {
                          items: orderData.items,
                          shippingAddress: orderData.shippingAddress,
                          phone: orderData.phone,
                          email: orderData.email,
                          latitude: orderData.latitude,
                          longitude: orderData.longitude,
                          totalAmount: orderData.totalAmount,
                          pdCm: orderData.pdCm,
                          lensInfo: orderData.lensInfo,
                          paymentId: paymentData.paymentId,
                          invoiceId: paymentData.invoiceId,
                          status: 'PAID'
                        };

                        console.log('Sending order payload:', orderPayload);

                        const orderResponse = await fetch('/api/qpay/create-order', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(orderPayload),
                        });

                        if (orderResponse.ok) {
                          const orderResult = await orderResponse.json();
                          console.log('Order created:', orderResult);
                          
                          if (orderResult.success) {
                            // Redirect to success page or show success message
                            alert('Төлбөр амжилттай! Таны захиалга баталгаажлаа.');
                            
                            // Optionally redirect to success page
                            // window.location.href = '/order-success';
                          } else {
                            console.error('Order creation failed:', orderResult.error);
                            alert('Төлбөр амжилттай боловч захиалга үүсгэхэд алдаа гарлаа.');
                          }
                        } else {
                          const errorData = await orderResponse.json();
                          console.error('Failed to create order:', errorData);
                          alert(`Төлбөр амжилттай боловч захиалга үүсгэхэд алдаа гарлаа: ${errorData.error || 'Unknown error'}`);
                        }
                      } catch (error) {
                        console.error('Error creating order:', error);
                        alert('Төлбөр амжилттай боловч захиалга үүсгэхэд алдаа гарлаа.');
                      }
                    }}
                    onPaymentError={(error) => {
                      console.error('Payment error:', error)
                      alert(`Төлбөрийн алдаа: ${error}`)
                    }}
                  />
                </div>
              )}

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
                  <span className="text-xs text-gray-600">100&apos;000₮ өөс дээш худалдан авалтанд</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <CreditCard size={24} className="text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">QPay QR Төлбөр</span>
                  <span className="text-xs text-gray-600">Утасныхаа камерыг ашиглан QR код уншуулна уу</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
