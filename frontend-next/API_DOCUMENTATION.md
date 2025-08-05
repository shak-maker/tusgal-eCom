# Admin API Documentation

This document describes all the API endpoints available for the admin dashboard.

## Base URL
All endpoints are prefixed with `/api/admin/`

## Authentication
All endpoints require admin authentication. The admin status is checked via the `useAuth` hook.

---

## 📦 Products API

### GET /api/admin/products
**Get all products**

**Response:**
```json
[
  {
    "id": "clx1234567890",
    "name": "Ray-Ban Aviator Classic",
    "description": "Timeless aviator sunglasses",
    "price": 154.99,
    "imageUrl": "https://example.com/image.jpg",
    "stock": 25,
    "faceShape": "Oval",
    "categoryId": "clx1234567891",
    "category": {
      "id": "clx1234567891",
      "name": "Sunglasses",
      "description": "Stylish sunglasses for all occasions"
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### POST /api/admin/products
**Create a new product**

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "imageUrl": "https://example.com/image.jpg",
  "stock": 10,
  "faceShape": "Round",
  "categoryId": "clx1234567891"
}
```

**Required Fields:** `name`, `price`, `imageUrl`, `categoryId`

**Response:** `201 Created` with the created product

### GET /api/admin/products/[id]
**Get a single product**

**Response:** Product object with category included

### PUT /api/admin/products/[id]
**Update a product**

**Request Body:** Same as POST, but all fields are optional

**Response:** Updated product object

### DELETE /api/admin/products/[id]
**Delete a product**

**Response:** `200 OK` with success message

---

## 📂 Categories API

### GET /api/admin/categories
**Get all categories**

**Response:**
```json
[
  {
    "id": "clx1234567891",
    "name": "Sunglasses",
    "description": "Stylish sunglasses for all occasions",
    "_count": {
      "products": 2
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### POST /api/admin/categories
**Create a new category**

**Request Body:**
```json
{
  "name": "New Category",
  "description": "Category description"
}
```

**Required Fields:** `name`

**Response:** `201 Created` with the created category

### GET /api/admin/categories/[id]
**Get a single category**

**Response:** Category object with products included

### PUT /api/admin/categories/[id]
**Update a category**

**Request Body:** Same as POST, but all fields are optional

**Response:** Updated category object

### DELETE /api/admin/categories/[id]
**Delete a category**

**Note:** Cannot delete categories that have products

**Response:** `200 OK` with success message

---

## 📥 Orders API

### GET /api/admin/orders
**Get all orders with pagination**

**Query Parameters:**
- `status` (optional): Filter by order status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "orders": [
    {
      "id": "clx1234567892",
      "userId": "clx1234567893",
      "total": 154.99,
      "status": "PENDING",
      "paid": false,
      "shippingAddress": "123 Main St, New York, NY 10001",
      "phone": "+1-555-0123",
      "email": "john@example.com",
      "user": {
        "id": "clx1234567893",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "items": [
        {
          "id": "clx1234567894",
          "quantity": 1,
          "price": 154.99,
          "product": {
            "id": "clx1234567890",
            "name": "Ray-Ban Aviator Classic",
            "price": 154.99,
            "category": {
              "name": "Sunglasses"
            }
          }
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 4,
    "totalPages": 1
  }
}
```

### GET /api/admin/orders/[id]
**Get a single order**

**Response:** Order object with user and items included

### PUT /api/admin/orders/[id]
**Update order status**

**Request Body:**
```json
{
  "status": "SHIPPED",
  "paid": true,
  "shippingAddress": "Updated address",
  "phone": "+1-555-9999",
  "email": "updated@email.com"
}
```

**All fields are optional**

**Response:** Updated order object

### DELETE /api/admin/orders/[id]
**Delete an order**

**Response:** `200 OK` with success message

---

## Order Status Values

- `PENDING` - Order is placed but not yet confirmed
- `CONFIRMED` - Order is confirmed and being processed
- `SHIPPED` - Order has been shipped
- `DELIVERED` - Order has been delivered
- `CANCELLED` - Order has been cancelled

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (missing required fields)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (e.g., category name already exists)
- `500` - Internal Server Error

---

## Database Schema

The API uses the following Prisma schema:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  phone     String?
  address   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  orders    Order[]
  cartItems CartItem[]
}

model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  description String?
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Product {
  id          String    @id @default(cuid())
  name        String
  description String
  price       Float
  imageUrl    String
  stock       Int
  faceShape   String?
  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id])
  cartItems   CartItem[]
  orderItems  OrderItem[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Order {
  id              String      @id @default(cuid())
  userId          String
  user            User        @relation(fields: [userId], references: [id])
  items           OrderItem[]
  total           Float
  status          OrderStatus @default(PENDING)
  paid            Boolean     @default(false)
  shippingAddress String?
  phone           String?
  email           String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model OrderItem {
  id        String @id @default(cuid())
  orderId   String
  productId String
  quantity  Int
  price     Float
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id])
  createdAt DateTime @default(now())
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}
``` 