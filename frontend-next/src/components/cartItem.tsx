import React from 'react';
import Image from 'next/image';
import { Trash2, Plus, Minus } from 'lucide-react';

type CartItemProps = {
  id: string;
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
  };
  quantity: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  isUpdating: boolean;
};

export default function CartItem({
  id,
  product,
  quantity,
  onUpdateQuantity,
  onRemoveItem,
  isUpdating
}: CartItemProps) {
  return (
    <div className="p-6">
      <div className="flex items-start space-x-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={80}
            height={80}
            className="rounded-lg object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {product.name}
          </h3>
          <p className="text-lg font-semibold text-gray-900">
            ₮ {product.price.toLocaleString()}
          </p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => onUpdateQuantity(product.id, quantity - 1)}
              disabled={isUpdating || quantity <= 1}
              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="px-4 py-2 text-center min-w-[60px]">
              {isUpdating ? '...' : quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(product.id, quantity + 1)}
              disabled={isUpdating}
              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => onRemoveItem(product.id)}
            disabled={isUpdating}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Item Total */}
      <div className="mt-4 flex justify-end">
        <p className="text-lg font-semibold text-gray-900">
          ₮ {(product.price * quantity).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
