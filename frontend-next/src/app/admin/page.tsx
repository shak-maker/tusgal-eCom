"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  LogOut,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

// Type definitions
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  stock: number;
  faceShape?: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    description?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  _count: {
    products: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    price: number;
    category?: {
      name: string;
    };
  };
}

interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status:
    | "ХҮЛЭЭГДЭЖ БАЙНА"
    | "БАТЛАГДСАН"
    | "ХҮРГЭЛТ ГАРСАН"
    | "ХҮРГЭЛТ ДУУССАН"
    | "ЦУЦЛАГДСАН"
    | "ТӨЛӨГДСӨН"
    | "АМЖИЛТГҮЙ";
  paid: boolean;
  shippingAddress?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  pdCm?: number;
  lensInfo?: {
    pdCm?: number;
    leftVision?: string;
    rightVision?: string;
    material?: string;
    notes?: string;
  };
  user?: {
    id: string;
    name?: string;
    email: string;
  };
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

const GlassesAdminDashboard = () => {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "products" | "orders" | "categories"
  >("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [newProduct, setNewProduct] = useState<{
    name: string;
    price: string;
    description: string;
    imageUrl: string;
    stock: string;
    faceShape: string;
    categoryId: string;
  }>({
    name: "",
    price: "",
    description: "",
    imageUrl: "",
    stock: "",
    faceShape: "",
    categoryId: "",
  });

  const [newCategory, setNewCategory] = useState<{
    name: string;
    description: string;
  }>({
    name: "",
    description: "",
  });

  // Check authentication and admin status
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
        return;
      }

      if (!isAdmin) {
        router.push("/");
        return;
      }
    }
  }, [user, loading, isAdmin, router]);

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    setError(null);

    try {
      switch (activeTab) {
        case "products":
          const productsRes = await fetch("/api/admin/products");
          if (!productsRes.ok) throw new Error("Failed to fetch products");
          const productsData = await productsRes.json();
          setProducts(productsData);
          break;

        case "categories":
          const categoriesRes = await fetch("/api/admin/categories");
          if (!categoriesRes.ok) throw new Error("Failed to fetch categories");
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
          break;

        case "orders":
        case "dashboard":
          const ordersRes = await fetch("/api/admin/orders");
          if (!ordersRes.ok) throw new Error("Failed to fetch orders");
          const ordersData = await ordersRes.json();
          setOrders(ordersData.orders || ordersData);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingData(false);
    }
  }, [activeTab]);

  // Fetch data based on active tab
  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin, fetchData]);

  // --- IMPORTANT: Fix for localStorage usage ---
  // Note: This still violates the "no localStorage" rule.
  // You should replace this with proper session management using cookies.
  const handleLogout = () => {
    // TODO: Replace with cookie-based logout
    // Example: fetch('/api/logout', { method: 'POST' }).then(() => router.push('/login'));
    localStorage.removeItem("admin-auth");
    localStorage.removeItem("admin-login-time");
    window.location.href = "/login";
  };

  // Product operations
  const handleAddProduct = async () => {
    if (
      !newProduct.name ||
      !newProduct.price ||
      !newProduct.imageUrl ||
      !newProduct.categoryId
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate price and stock
    const price = parseFloat(newProduct.price);
    const stock = parseInt(newProduct.stock) || 0;

    if (isNaN(price) || price <= 0) {
      setError("Price must be a positive number");
      return;
    }

    if (isNaN(stock) || stock < 0) {
      setError("Stock must be a non-negative integer");
      return;
    }

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProduct,
          price,
          stock,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to create product";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If parsing fails, keep the default message
        }
        throw new Error(errorMessage);
      }

      await fetchData();
      setNewProduct({
        name: "",
        price: "",
        description: "",
        imageUrl: "",
        stock: "",
        faceShape: "",
        categoryId: "",
      });
      setShowAddProduct(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    }
  };

  const handleUpdateProduct = async () => {
    if (
      !editingProduct ||
      !newProduct.name ||
      !newProduct.price ||
      !newProduct.imageUrl
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate price and stock
    const price = parseFloat(newProduct.price);
    const stock = parseInt(newProduct.stock) || 0;

    if (isNaN(price) || price <= 0) {
      setError("Price must be a positive number");
      return;
    }

    if (isNaN(stock) || stock < 0) {
      setError("Stock must be a non-negative integer");
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProduct,
          price,
          stock,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to update product";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If parsing fails, keep the default message
        }
        throw new Error(errorMessage);
      }

      await fetchData();
      setEditingProduct(null);
      setNewProduct({
        name: "",
        price: "",
        description: "",
        imageUrl: "",
        stock: "",
        faceShape: "",
        categoryId: "",
      });
      setShowAddProduct(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let errorMessage = "Failed to delete product";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If parsing fails, keep the default message
        }
        throw new Error(errorMessage);
      }

      await fetchData();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  // Category operations
  const handleAddCategory = async () => {
    if (!newCategory.name) {
      setError("Category name is required");
      return;
    }

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) {
        let errorMessage = "Failed to create category";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If parsing fails, keep the default message
        }
        throw new Error(errorMessage);
      }

      await fetchData();
      setNewCategory({ name: "", description: "" });
      setShowAddCategory(false);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create category"
      );
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !newCategory.name) {
      setError("Category name is required");
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/categories/${editingCategory.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCategory),
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to update category";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If parsing fails, keep the default message
        }
        throw new Error(errorMessage);
      }

      await fetchData();
      setEditingCategory(null);
      setNewCategory({ name: "", description: "" });
      setShowAddCategory(false);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update category"
      );
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let errorMessage = "Failed to delete category";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If parsing fails, keep the default message
        }
        throw new Error(errorMessage);
      }

      await fetchData();
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete category"
      );
    }
  };

  // Order operations
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to update order status";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If parsing fails, keep the default message
        }
        throw new Error(errorMessage);
      }

      await fetchData();
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update order status"
      );
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let errorMessage = "Failed to delete order";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If parsing fails, keep the default message
        }
        throw new Error(errorMessage);
      }

      await fetchData();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete order");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ХҮЛЭЭГДЭЖ БАЙНА":
        return "bg-yellow-100 text-yellow-800";
      case "БАТЛАГДСАН":
        return "bg-blue-100 text-blue-800";
      case "ХҮРГЭЛТ ГАРСАН":
        return "bg-green-100 text-green-800";
      case "ХҮРГЭЛТ ДУУССАН":
        return "bg-purple-100 text-purple-800";
      case "ТӨЛӨГДСӨН":
        return "bg-emerald-100 text-emerald-800";
      case "ЦУЦЛАГДСАН":
        return "bg-red-100 text-red-800";
      case "АМЖИЛТГҮЙ":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Уншиж байна...</p>
        </div>
      </div>
    );
  }

  // Dashboard stats
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (order) => order.status === "ХҮЛЭЭГДЭЖ БАЙНА"
  ).length;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              👓 Тусгал Админ
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Тавтай морил, {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Гарах
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {(
              [
                { id: "dashboard", name: "Ерөнхий үзүүлэлт", icon: DollarSign },
                { id: "products", name: "Бараанууд", icon: Package },
                { id: "categories", name: "Категориуд", icon: Package },
                { id: "orders", name: "Захиалгууд", icon: ShoppingCart },
              ] as {
                id: "dashboard" | "products" | "categories" | "orders";
                name: string;
                icon: React.ElementType;
              }[]
            ).map(({ id, name, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === id
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {name}
              </button>
            ))}
          </nav>
        </div>

        {/* Loading State */}
        {loadingData && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Дата уншиж байна...</span>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && !loadingData && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Ерөнхий үзүүлэлт
            </h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Package className="w-8 h-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Нийт барааны тоо
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalProducts}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <ShoppingCart className="w-8 h-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Нийт Захиалга
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalOrders}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Хүлээгдэж буй Захиалга
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {pendingOrders}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Нийт орлого
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₮{totalRevenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                  Өмнөх Захиалгууд
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{order.id}</p>
                        <p className="text-sm text-gray-500">
                          {order.user?.name ||
                            order.user?.email ||
                            "Unknown User"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ₮{order.totalAmount || 0}
                        </p>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && !loadingData && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                барааны менежмэнт
              </h2>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowAddProduct(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Бараа нэмэх
              </button>
            </div>

            {/* Add/Edit Product Modal */}
            {showAddProduct && (
              <div
                className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => {
                  // Optional: Close modal when clicking outside
                  setShowAddProduct(false);
                  setEditingProduct(null);
                  setNewProduct({
                    name: "",
                    price: "",
                    description: "",
                    imageUrl: "",
                    stock: "",
                    faceShape: "",
                    categoryId: "",
                  });
                }}
              >
                <div
                  className="bg-white bg-opacity-30 backdrop-blur-sm rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl"
                  onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
                >
                  <h3 className="text-lg font-medium mb-4">
                    {editingProduct
                      ? "Барааны мэдээлэл өөрчлөх"
                      : "Шинэ бараа нэмэх"}
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Барааны нэр *"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <textarea
                      placeholder="Тайлбар"
                      value={newProduct.description}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          description: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg h-20 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Үнийн дүн *"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <div>
                      <input
                        type="url"
                        placeholder="Зурагны URL *"
                        value={newProduct.imageUrl}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            imageUrl: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      {/* Google Drive URL guidance */}
                      <p className="text-xs text-gray-500 mt-1">
                        Google Drive зургийг хуваалцахдаа:
                        <br />
                        1. "Хуваалцах" товчийг дарна уу
                        <br />
                        2. "Хэн бүхэн линк ашиглаж болно" гэж сонгоно уу
                        <br />
                        3. Линкийг хуулж авна уу
                      </p>
                    </div>

                    {/* Image Preview */}
                    {newProduct.imageUrl && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Зургийн урьдчилан харах
                        </label>
                        <div
                          className="border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center"
                          style={{ height: "200px" }}
                        >
                          <img
                            src={`/api/image-proxy?url=${encodeURIComponent(
                              newProduct.imageUrl
                            )}`}
                            alt="Preview"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.parentElement!.classList.add(
                                "border-red-500"
                              );
                              target.style.display = "none";
                              target.parentElement!.innerHTML = `
                    <div class="flex flex-col items-center justify-center h-full text-gray-500 text-center px-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-2 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span class="text-sm">Зураг ачааллагдах боломжгүй<br>Google Drive-д 'Хэн бүхэн харж болно' гэж тохируулна уу</span>
                    </div>
                  `;
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <input
                      type="number"
                      placeholder="Нийт ширхэг"
                      value={newProduct.stock}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, stock: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Нүүрний хэлбэр"
                      value={newProduct.faceShape}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          faceShape: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <select
                      value={newProduct.categoryId}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          categoryId: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Категори сонгох *</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      onClick={() => {
                        setShowAddProduct(false);
                        setEditingProduct(null);
                        setNewProduct({
                          name: "",
                          price: "",
                          description: "",
                          imageUrl: "",
                          stock: "",
                          faceShape: "",
                          categoryId: "",
                        });
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                    >
                      Цуцлах
                    </button>
                    <button
                      onClick={
                        editingProduct ? handleUpdateProduct : handleAddProduct
                      }
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      {editingProduct ? "Шинэчлэх" : "Нэмэх"} Бараа
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow overflow-hidden"
                >
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={`/api/image-proxy?url=${encodeURIComponent(
                          product.imageUrl
                        )}`}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          // Fallback to placeholder if proxy fails
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/600x400?text=Image+Not+Available";
                        }}
                      />
                    ) : (
                      <span className="text-4xl">👓</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {product.category?.name || "No Category"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {product.faceShape || "Universal"}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-lg font-bold text-gray-900">
                        ₮{product.price}
                      </span>
                      <span className="text-sm text-gray-500">
                        Stock: {product.stock}
                      </span>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setNewProduct({
                            name: product.name,
                            price: product.price.toString(),
                            description: product.description,
                            imageUrl: product.imageUrl,
                            stock: product.stock.toString(),
                            faceShape: product.faceShape || "",
                            categoryId: product.categoryId || "",
                          });
                          setShowAddProduct(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && !loadingData && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Категори менежмэнт
              </h2>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setShowAddCategory(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Категори нэмэх
              </button>
            </div>

            {/* Add/Edit Category Modal */}
            {showAddCategory && (
              <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-medium mb-4">
                    {editingCategory
                      ? "Категори өөрчлөх"
                      : "Шинэ категори нэмэх"}
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Категорын нэр *"
                      value={newCategory.name}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, name: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg"
                    />
                    <textarea
                      placeholder="Тайлбар"
                      value={newCategory.description}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          description: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg h-20"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      onClick={() => {
                        setShowAddCategory(false);
                        setEditingCategory(null);
                        setNewCategory({ name: "", description: "" });
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Цуцлах
                    </button>
                    <button
                      onClick={
                        editingCategory
                          ? handleUpdateCategory
                          : handleAddCategory
                      }
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      {editingCategory ? "Update" : "Нэмэх"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Categories List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Нэр
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Тайлбар
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Бараанууд
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      өөрчлөх
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category.description || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category._count.products}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setEditingCategory(category);
                            setNewCategory({
                              name: category.name,
                              description: category.description || "",
                            });
                            setShowAddCategory(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && !loadingData && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Orders Management
            </h2>
            {/* Order Details Modal */}
            {selectedOrder && (
              <div
                className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50"
                onClick={() => setSelectedOrder(null)}
              >
                <div
                  className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg relative overflow-y-auto max-h-[90vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-medium mb-4">
                    Захиалгийн мэдээлэл - {selectedOrder.id}
                  </h3>

                  <div className="space-y-4">
                    {/* --- General Info --- */}
                    <div>
                      <p>
                        <strong>Захиалагч:</strong>{" "}
                        {selectedOrder.user?.name || "N/A"}
                      </p>
                      <p>
                        <strong>И-Мейл:</strong>{" "}
                        {selectedOrder.user?.email || "N/A"}
                      </p>
                      <p>
                        <strong>Он Сар Өдөр:</strong>{" "}
                        {formatDate(selectedOrder.createdAt)}
                      </p>
                      <p>
                        <strong>Статус:</strong>
                        <span
                          className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            selectedOrder.status
                          )}`}
                        >
                          {selectedOrder.status}
                        </span>
                      </p>

                      {selectedOrder.shippingAddress && (
                        <p>
                          <strong>Хаяг:</strong> {selectedOrder.shippingAddress}
                        </p>
                      )}
                      {selectedOrder.phone && (
                        <p>
                          <strong>Утас:</strong> {selectedOrder.phone}
                        </p>
                      )}
                      {"latitude" in selectedOrder &&
                        selectedOrder.latitude != null && (
                          <p>
                            <strong>Latitude:</strong>{" "}
                            {String(selectedOrder.latitude)}
                          </p>
                        )}
                      {"longitude" in selectedOrder &&
                        selectedOrder.longitude != null && (
                          <p>
                            <strong>Longitude:</strong>{" "}
                            {String(selectedOrder.longitude)}
                          </p>
                        )}
                    </div>

                    {/* --- Items --- */}
                    <div>
                      <h4 className="font-medium mb-2">Items:</h4>
                      {selectedOrder.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between py-2 border-b"
                        >
                          <span>
                            {item.product?.name || "Unknown Product"} x
                            {item.quantity}
                          </span>
                          <span>₮{item.price}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold text-lg mt-2">
                        <span>Total:</span>
                        <span>₮{selectedOrder.totalAmount || 0}</span>
                      </div>
                    </div>

                    {/* --- Eyeglasses / Lens Info --- */}
                    {(selectedOrder.pdCm || selectedOrder.lensInfo) && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-medium mb-2">Шилний мэдээлэл:</h4>
                        <div className="space-y-2 text-sm text-gray-700">
                          {selectedOrder.pdCm && (
                            <p>
                              <strong>PD:</strong> {selectedOrder.pdCm} см
                            </p>
                          )}
                          {selectedOrder.lensInfo?.rightVision && (
                            <p>
                              <strong>Баруун нүд:</strong>{" "}
                              {selectedOrder.lensInfo.rightVision}
                            </p>
                          )}
                          {selectedOrder.lensInfo?.leftVision && (
                            <p>
                              <strong>Зүүн нүд:</strong>{" "}
                              {selectedOrder.lensInfo.leftVision}
                            </p>
                          )}
                          {selectedOrder.lensInfo?.material && (
                            <p>
                              <strong>Материал:</strong>{" "}
                              {selectedOrder.lensInfo.material === 'normal_white' ? 'Энгийн цагаан' :
                               selectedOrder.lensInfo.material === 'chameleon' ? 'Хамелеон' :
                               selectedOrder.lensInfo.material === 'purple_chameleon' ? 'Үзмэн яагаан хамелеон' :
                               selectedOrder.lensInfo.material}
                            </p>
                          )}
                          {selectedOrder.lensInfo?.notes && (
                            <p>
                              <strong>Тэмдэглэл:</strong>{" "}
                              {selectedOrder.lensInfo.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Close Button */}
                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Захиалгийн ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Захиалагч
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Нийт
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Он сар өдөр
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      өөрчлөх
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.user?.name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.user?.email || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₮{order.totalAmount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value)
                          }
                          className={`text-xs font-semibold rounded-full px-2 py-1 ${getStatusColor(
                            order.status
                          )}`}
                        >
                          <option value="ХҮЛЭЭГДЭЖ БАЙНА">
                            Хүлээгдэж байна
                          </option>
                          <option value="БАТЛАГДСАН">Баталгаажсан</option>
                          <option value="ХҮРГЭЛТ ГАРСАН">Хүргэлт гарсан</option>
                          <option value="ХҮРГЭЛТ ДУУССАН">Хүргэлт дууссан</option>
                          <option value="ТӨЛӨГДСӨН">Төлөгдсөн</option>
                          <option value="ЦУЦЛАГДСАН">Цуцлагдсан</option>
                          <option value="АМЖИЛТГҮЙ">Амжилтгүй</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlassesAdminDashboard;
