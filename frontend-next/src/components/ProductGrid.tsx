"use client";


import { useState, useEffect } from "react";
import Image from "next/image";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import TryOnModal from "./TryOnModal";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  faceShape?: string;
  categoryId?: string;
  category?: {
    name: string;
  };
};

type ProductGridProps = {
  title?: string;
  description?: string;
  showCategories?: boolean;
  className?: string;
};

export default function ProductGrid({
  title = "Бэлэн байгаа загварууд",
  description = "Та баруун дээд талд байгаа зүүж үзэх товчыг даран тухайн загвар танд яаж харагдахыг үзээрэй.",
  showCategories = true,
  className = "",
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [tryOnModal, setTryOnModal] = useState<{
    isOpen: boolean;
    product: Product | null;
  }>({
    isOpen: false,
    product: null,
  });

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }

  async function fetchProducts() {
    try {
      setLoading(true);
      const url =
        selectedCategory === "all"
          ? "/api/products"
          : `/api/products?category=${selectedCategory}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  async function addToCart(productId: string) {
    try {
      setAddingToCart(productId);
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
        credentials: "include", // ✅ this line is the fix
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        console.error("Backend responded with error:", res.status, errorBody);
        throw new Error("Failed to add to cart");
      }

      // Show success feedback with animation
      const button = document.querySelector(`[data-product-id="${productId}"]`);
      if (button) {
        button.classList.add("scale-110", "bg-green-600");
        setTimeout(() => {
          button.classList.remove("scale-110", "bg-green-600");
        }, 300);
      }

      // Update cart count in header
      const event = new CustomEvent("cartUpdated");
      window.dispatchEvent(event);
    } catch (err) {
      console.error("Failed to add to cart:", err);
      alert("❌ Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  }

  function toggleWishlist(productId: string) {
    setWishlist((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  }

  function handleTryOn(product: Product) {
    setTryOnModal({
      isOpen: true,
      product,
    });
  }

  function closeTryOnModal() {
    setTryOnModal({
      isOpen: false,
      product: null,
    });
  }

  if (loading) {
    return (
      <section className={`bg-gray-50 py-12 px-4 ${className}`}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-96 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            {showCategories && (
              <div className="flex space-x-4 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded w-24"></div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-lg p-4">
                  <div className="w-full h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="products" className={`bg-gray-50 py-12 px-4 ${className}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              {description}
            </p>
          </div>

          {/* Categories */}
          {showCategories && categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === "all"
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "bg-white text-gray-700 hover:bg-blue-50 hover:scale-105"
                }`}
              >
                Эрэлттэй
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === category.id
                      ? "bg-blue-600 text-white shadow-lg scale-105"
                      : "bg-white text-gray-700 hover:bg-blue-50 hover:scale-105"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />

                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-300 hover:scale-110"
                  >
                    <Heart
                      size={20}
                      className={`transition-all duration-300 ${
                        wishlist.has(product.id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-600"
                      }`}
                    />
                  </button>

                  {/* Try On Button */}
                  <button
                    onClick={() => handleTryOn(product)}
                    className="absolute top-3 left-3 px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-all duration-300 hover:scale-110"
                  >
                    Зүүж үзэх
                  </button>

                  {/* Face Shape Badge */}
                  {product.faceShape && (
                    <div className="absolute bottom-3 left-3 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      {product.faceShape}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 truncate">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      ₮ {product.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {product.stock > 0
                        ? `${product.stock} in stock`
                        : "Out of stock"}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleTryOn(product)}
                      className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Eye size={16} className="mr-1" />
                      Харах
                    </button>
                    <button
                      data-product-id={product.id}
                      onClick={() => addToCart(product.id)}
                      disabled={
                        addingToCart === product.id || product.stock === 0
                      }
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingToCart === product.id ? (
                        "Нэмэх..."
                      ) : (
                        <>
                          <ShoppingCart size={16} className="mr-1" />
                          Авах
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {products.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <ShoppingCart size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600">
                Try selecting a different category or check back later.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Try On Modal */}
      <TryOnModal
        isOpen={tryOnModal.isOpen}
        onClose={closeTryOnModal}
        product={tryOnModal.product}
      />
    </>
  );
}
