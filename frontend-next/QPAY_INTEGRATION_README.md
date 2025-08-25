# QPay Integration Implementation

This document describes the QPay payment integration implementation with both the original backend-compatible routes and the new specification-compliant routes.

## API Routes

### 1. Invoice Creation Routes

#### A. Original Backend-Compatible Route (Existing)
- **Endpoint**: `POST /api/qpay/create-invoice`
- **Description**: Creates a new QPay invoice (compatible with existing frontend)
- **Request Body**:
  ```json
  {
    "cartItems": [...],
    "customerData": {
      "name": "string",
      "email": "string", 
      "phone": "string"
    },
    "totalAmount": "number"
  }
  ```
- **Response**: Returns formatted response with QR codes and payment URLs

#### B. New Specification-Compliant Route
- **Endpoint**: `POST /api/qpay/create-invoice-simple`
- **Description**: Creates a new QPay invoice (follows exact specification)
- **Request Body**:
  ```json
  {
    "invoice_code": "string",
    "amount": "number"
  }
  ```
- **Response**: Returns QPay's raw invoice response JSON

### 2. Payment Callback Handler
- **Endpoint**: `POST /api/qpay/callback`
- **Description**: Handles QPay payment callbacks
- **Features**:
  - Parses JSON body from QPay
  - Logs all callback data for debugging
  - Updates mock order status in memory
  - Verifies payment with QPay API
  - Responds with `200 OK`

### 3. Payment Status Check via Callback URL
- **Endpoint**: `GET /api/qpay/callback?payment_id=xxx&invoice_id=xxx`
- **Description**: Check payment status using callback URL
- **Features**:
  - Check mock order status in memory
  - Verify with QPay API if needed
  - Returns payment status and verification data

### 3. Payment Check Route
- **Endpoint**: `GET /api/qpay/check-payment/[invoice_id]`
- **Description**: Checks payment status for a specific invoice
- **Response**: Returns QPay's payment check response JSON

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# QPay Configuration
QPAY_BASE_URL=https://merchant.qpay.mn/v2
QPAY_ACCESS_TOKEN=your_qpay_access_token_here
```

## Implementation Details

### Error Handling
- All routes include comprehensive try/catch blocks
- Detailed error logging for debugging
- Proper HTTP status codes for different error scenarios

### Logging
- All request/response bodies are logged for debugging
- Structured logging with emojis for easy identification
- Error details are captured and logged

### Best Practices
- Uses `axios` for HTTP requests
- Async/await pattern throughout
- TypeScript type safety
- Environment variable configuration
- Bearer token authentication

## Usage Examples

### Creating an Invoice (Original Backend-Compatible)
```javascript
const response = await fetch('/api/qpay/create-invoice', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    cartItems: cartItems,
    customerData: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890'
    },
    totalAmount: 10000
  })
});
```

### Creating an Invoice (New Specification-Compliant)
```javascript
const response = await fetch('/api/qpay/create-invoice-simple', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    invoice_code: 'INV-001',
    amount: 10000
  })
});
```

### Checking Payment Status via Callback URL
```javascript
// Check using payment_id
const response = await fetch('/api/qpay/callback?payment_id=PAYMENT_123');
const paymentStatus = await response.json();

// Check using invoice_id
const response = await fetch('/api/qpay/callback?invoice_id=INV-001');
const paymentStatus = await response.json();
```

### Checking Payment Status via Separate Route
```javascript
const response = await fetch('/api/qpay/check-payment/INV-001');
const paymentStatus = await response.json();
```

## Dependencies

- `axios`: For HTTP requests to QPay API
- `next/server`: For Next.js API routes

## Notes

- **Backward Compatibility**: The original `/api/qpay/create-invoice` route is preserved for existing frontend compatibility
- **New Implementation**: `/api/qpay/create-invoice-simple` follows the exact specification provided
- **Callback-Based Payment Checking**: Payment status can be checked via the callback URL using GET requests
- The callback URL is hardcoded to `https://mydomain.com/qpay/callback` as specified
- Mock order status is stored in memory (Map) for demonstration purposes
- All QPay API calls use Bearer token authentication
- Comprehensive logging is implemented for debugging purposes
- Payment verification includes both mock status and QPay API verification
