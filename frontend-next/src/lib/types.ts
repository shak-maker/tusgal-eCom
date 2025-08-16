// API Route Context Types
export interface ApiContext {
  params: Promise<{
    id: string;
    productId?: string;
  }>;
}

// Product Types
export interface ProductData {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  faceShape?: string;
  categoryId?: string;
}

export interface ProductUpdateData extends Partial<ProductData> {
  id: string;
}

// Category Types
export interface CategoryData {
  name: string;
  description?: string;
}

export interface CategoryUpdateData extends Partial<CategoryData> {
  id: string;
}

// Order Types
export interface OrderData {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: string;
  phone: string;
  email: string;
  latitude?: number;
  longitude?: number;
}

// Cart Types
export interface CartItemData {
  productId: string;
  quantity: number;
}

export interface CartItemUpdateData {
  quantity: number;
}

// Admin Types
export interface AdminAuthData {
  password: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
}
