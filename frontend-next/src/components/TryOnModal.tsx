'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Camera, RotateCcw, Download } from 'lucide-react'

type TryOnModalProps = {
  isOpen: boolean
  onClose: () => void
  product: {
    id: string
    name: string
    imageUrl: string
    faceShape?: string
  } | null
}

export default function TryOnModal({ isOpen, onClose, product }: TryOnModalProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  if (!isOpen || !product) return null

  const handleCapture = () => {
    setIsCapturing(true)
    // Simulate camera capture
    setTimeout(() => {
      setCapturedImage('/womanBackground.png') // Using existing image as placeholder
      setIsCapturing(false)
    }, 1000)
  }

  const handleReset = () => {
    setCapturedImage(null)
  }

  const handleDownload = () => {
    if (capturedImage) {
      const link = document.createElement('a')
      link.href = capturedImage
      link.download = `${product.name}-try-on.png`
      link.click()
    }
  }

  return (
    <div className="fixed inset-0 bg-[rgba(160,160,160,0.5)] backdrop-blur-[8px] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Зүүж үзэх - {product.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Бүтээгдэхүүн</h3>
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                {product.faceShape && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    {product.faceShape}
                  </div>
                )}
              </div>
              <p className="text-gray-600">{product.name}</p>
            </div>

            {/* Try On Area */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Зүүж үзэх</h3>
              
              {!capturedImage ? (
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Camera size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">Зураг авахын тулд дээрх товчийг дарна уу</p>
                    <button
                      onClick={handleCapture}
                      disabled={isCapturing}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isCapturing ? 'Зураг авч байна...' : 'Зураг авах'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                  <Image
                    src={capturedImage}
                    alt="Try on result"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button
                      onClick={handleReset}
                      className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                    >
                      <RotateCcw size={20} />
                    </button>
                    <button
                      onClick={handleDownload}
                      className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                    >
                      <Download size={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Зааварчилгаа:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Царайны зураг авахын тулд &quot;Зураг авах&quot; товчийг дарна уу</li>
              <li>• Зураг авсны дараа шилээ зүүж үзэх боломжтой</li>
              <li>• Үр дүнг хадгалахын тулд татаж авах товчийг дарна уу</li>
              <li>• Дахин зураг авахын тулд сэргээх товчийг дарна уу</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Хаах
          </button>
        </div>
      </div>
    </div>
  )
} 