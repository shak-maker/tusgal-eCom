# E-commerce Backend API Documentation

This document describes all the API endpoints available in your Next.js e-commerce backend.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently, the API uses a simple user ID system. In production, you should implement proper authentication with JWT tokens or NextAuth.js.

## API Endpoints

### 1. Products API

#### Get All Products
```http
GET /api/products
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category ID
- `search` (optional): Search in name and description
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `faceShape` (optional): Filter by face shape

**Example:**
```http
GET /api/products?page=1&limit=5&search=glasses&minPrice=50&maxPrice=200
```

**Response:**
```json
{
  "products": [
    {
      "id": "clx123",
      "name": "Sunglasses",
      "description": "Stylish sunglasses",
      "price": 99.99,
      "imageUrl": "https://example.com/image.jpg",
      "stock": 10,
      "faceShape": "round",
      "categoryId": "cat123",
      "category": {
        "id": "cat123",
        "name": "Sunglasses"
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 25,
    "totalPages": 5
  }
}
```

#### Get Single Product
```http
GET /api/products/{id}
```

#### Create Product
```http
POST /api/products
```

**Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "imageUrl": "https://example.com/image.jpg",
  "stock": 10,
  "faceShape": "round",
  "categoryId": "cat123"
}
```

#### Update Product
```http
PUT /api/products/{id}
```

#### Delete Product
```http
DELETE /api/products/{id}
```

### 2. Categories API

#### Get All Categories
```http
GET /api/categories
```

**Response:**
```json
[
  {
    "id": "cat123",
    "name": "Sunglasses",
    "description": "Eye protection",
    "createdAt": "2024-01-01T00:00:00Z",
    "_count": {
      "products": 15
    }
  }
]
```

#### Create Category
```http
POST /api/categories
```

**Body:**
```json
{
  "name": "New Category",
  "description": "Category description"
}
```

### 3. Users API

#### Get/Create User
```http
GET /api/users?email=user@example.com
```

**Response:**
```json
{
  "id": "user123",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "address": "123 Main St",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Create/Update User
```http
POST /api/users
```

**Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "address": "123 Main St"
}
```

### 4. Cart API

#### Get User Cart
```http
GET /api/cart?userId=user123
```

**Response:**
```json
{
  "items": [
    {
      "id": "cart123",
      "userId": "user123",
      "productId": "prod123",
      "quantity": 2,
      "product": {
        "id": "prod123",
        "name": "Sunglasses",
        "price": 99.99,
        "imageUrl": "https://example.com/image.jpg",
        "category": {
          "id": "cat123",
          "name": "Sunglasses"
        }
      }
    }
  ],
  "total": 199.98,
  "itemCount": 1
}
```

#### Add Item to Cart
```http
POST /api/cart
```

**Body:**
```json
{
  "userId": "user123",
  "productId": "prod123",
  "quantity": 1
}
```

#### Update Cart Item
```http
PUT /api/cart
```

**Body:**
```json
{
  "userId": "user123",
  "productId": "prod123",
  "quantity": 3
}
```

#### Remove Item from Cart
```http
DELETE /api/cart?userId=user123&productId=prod123
```

### 5. Orders API

#### Get User Orders
```http
GET /api/orders?userId=user123&status=pending
```

**Response:**
```json
[
  {
    "id": "order123",
    "userId": "user123",
    "total": 199.98,
    "status": "PENDING",
    "paid": false,
    "shippingAddress": "123 Main St",
    "phone": "+1234567890",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00Z",
    "items": [
      {
        "id": "item123",
        "orderId": "order123",
        "productId": "prod123",
        "quantity": 2,
        "price": 99.99,
        "product": {
          "id": "prod123",
          "name": "Sunglasses",
          "price": 99.99,
          "category": {
            "id": "cat123",
            "name": "Sunglasses"
          }
        }
      }
    ]
  }
]
```

#### Create Order
```http
POST /api/orders
```

**Body:**
```json
{
  "userId": "user123",
  "items": [
    {
      "productId": "prod123",
      "quantity": 2
    }
  ],
  "shippingAddress": "123 Main St",
  "phone": "+1234567890",
  "email": "user@example.com"
}
```

#### Get Single Order
```http
GET /api/orders/{id}
```

#### Update Order Status
```http
PUT /api/orders/{id}
```

**Body:**
```json
{
  "status": "CONFIRMED",
  "paid": true
}
```

### 6. Admin API

#### Get All Orders (Admin)
```http
GET /api/admin/orders?status=pending&page=1&limit=20
```

## Order Status Values
- `PENDING`: Order created, waiting for confirmation
- `CONFIRMED`: Order confirmed by admin
- `SHIPPED`: Order has been shipped
- `DELIVERED`: Order has been delivered
- `CANCELLED`: Order has been cancelled

## Error Responses

All endpoints return errors in the following format:
```json
{
  "error": "Error message"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

## Usage Examples

### Frontend Integration

```javascript
// Get products
const response = await fetch('/api/products?page=1&limit=10');
const data = await response.json();

// Add to cart
const cartResponse = await fetch('/api/cart', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    productId: 'prod123',
    quantity: 1
  })
});

// Create order
const orderResponse = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    items: [{ productId: 'prod123', quantity: 2 }],
    shippingAddress: '123 Main St',
    phone: '+1234567890',
    email: 'user@example.com'
  })
});
```

## Database Schema

The backend uses the following main entities:
- **Users**: Customer information
- **Categories**: Product categories
- **Products**: Product information with stock management
- **CartItems**: Shopping cart items
- **Orders**: Order information with status tracking
- **OrderItems**: Individual items in orders

## Next Steps

1. **Authentication**: Implement proper user authentication
2. **Payment Integration**: Add payment processing (Stripe, PayPal, etc.)
3. **File Upload**: Add image upload functionality
4. **Email Notifications**: Send order confirmation emails
5. **Inventory Management**: Add low stock alerts
6. **Analytics**: Add order and sales analytics
7. **Search**: Implement full-text search
8. **Caching**: Add Redis caching for better performance 