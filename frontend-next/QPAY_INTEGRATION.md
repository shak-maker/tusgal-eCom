# QPay Integration Documentation

This document explains how our QPay integration works with the official QPay API documentation.

## Overview

Our QPay integration follows the official QPay API v2 specification from [https://developer.qpay.mn/](https://developer.qpay.mn/). The integration handles payment processing, callbacks, and status management for the e-commerce platform.

## Key Components

### 1. QPay Client (`/src/lib/qpay-client.ts`)

The main client class that handles all QPay API interactions:

- **Authentication**: Manages OAuth 2.0 token lifecycle
- **Invoice Creation**: Creates payment invoices with detailed line items
- **Payment Checking**: Verifies payment status
- **Payment Management**: Handles cancellations, refunds, and e-barimt

### 2. QPay Types (`/src/lib/qpay-types.ts`)

TypeScript interfaces that match the official QPay API structure:

- `QPayCallbackData`: Matches official callback response structure
- `QPayPaymentResponse`: Updated to match official payment response
- `QPayInvoiceRequest`: Invoice creation request structure

### 3. Callback Handler (`/src/app/api/qpay/callback/route.ts`)

Handles QPay payment callbacks with proper status mapping:

- **PAID**: Payment successful
- **FAILED**: Payment failed
- **REFUNDED**: Payment refunded
- **NEW**: Payment created but not processed

## Official QPay API Integration

### Authentication

```typescript
// OAuth 2.0 authentication with client_id and client_secret
POST https://merchant-sandbox.qpay.mn/v2/auth/token
Authorization: Basic {base64(username:password)}
```

### Invoice Creation

```typescript
// Create invoice with detailed line items
POST https://merchant-sandbox.qpay.mn/v2/invoice
Authorization: Bearer {access_token}
```

### Payment Status Check

```typescript
// Check payment status using object_id
POST https://merchant-sandbox.qpay.mn/v2/payment/check
Authorization: Bearer {access_token}
```

## Callback Structure

Our callback handler processes the official QPay callback structure:

```typescript
interface QPayCallbackData {
  payment_id: string;           // QPay payment ID
  payment_date: string;         // Payment timestamp
  payment_status: 'NEW' | 'FAILED' | 'PAID' | 'REFUNDED';
  payment_fee: number;          // Transaction fee
  payment_amount: number;       // Payment amount
  payment_currency: string;     // Currency (MNT)
  payment_wallet: string;       // Wallet ID
  payment_name: string;         // Payment name
  payment_description: string;  // Payment description
  qr_code?: string;            // QR code used
  paid_by: 'P2P' | 'CARD';     // Payment method
  object_type: 'MERCHANT' | 'INVOICE' | 'QR';
  object_id: string;           // Invoice or object ID
  invoice_id?: string;         // Invoice ID (if applicable)
  sender_invoice_no?: string;  // Your invoice number
}
```

## Payment Status Mapping

| QPay Status | Our Handler | Description |
|-------------|-------------|-------------|
| `PAID` | `handleSuccessfulPayment` | Payment completed successfully |
| `FAILED` | `handleFailedPayment` | Payment failed or declined |
| `REFUNDED` | `handleRefundedPayment` | Payment was refunded |
| `NEW` | `handleNewPayment` | Payment created, pending processing |

## Configuration

QPay configuration is managed through environment variables:

```env
QPAY_USERNAME=your_client_id
QPAY_PASSWORD=your_client_secret
QPAY_BASE_URL=https://merchant-sandbox.qpay.mn
QPAY_CALLBACK_URL=https://yourdomain.com/api/qpay/callback
QPAY_INVOICE_CODE=your_invoice_code
```

## Error Handling

The integration includes comprehensive error handling:

- **Authentication Errors**: Token refresh and retry logic
- **API Errors**: Proper error response parsing
- **Callback Errors**: Validation and logging
- **Network Errors**: Retry mechanisms

## Security Considerations

1. **Token Management**: Automatic token refresh with expiry tracking
2. **Callback Validation**: Required field validation
3. **HTTPS Only**: All API calls use HTTPS
4. **Error Logging**: Comprehensive error logging for debugging

## Testing

### Sandbox Environment

Use QPay sandbox for testing:
- Base URL: `https://merchant-sandbox.qpay.mn`
- Test credentials provided by QPay
- Test QR codes for payment simulation

### Production Environment

For production:
- Base URL: `https://merchant.qpay.mn`
- Production credentials from QPay
- Real payment processing

## Integration Flow

1. **Order Creation**: User creates order in frontend
2. **Invoice Creation**: QPay invoice created with order details
3. **Payment Processing**: User pays via QPay QR or app
4. **Callback Processing**: QPay sends callback with payment status
5. **Order Update**: Order status updated based on payment result
6. **Confirmation**: User receives confirmation

## Troubleshooting

### Common Issues

1. **Authentication Failures**: Check credentials and token expiry
2. **Callback Not Received**: Verify callback URL configuration
3. **Payment Status Mismatch**: Check object_id mapping
4. **Network Timeouts**: Implement retry logic

### Debugging

Enable detailed logging:
```typescript
console.log('QPay callback received:', JSON.stringify(body, null, 2));
```

## API Endpoints

### Our Endpoints

- `POST /api/qpay/create-invoice` - Create payment invoice
- `POST /api/qpay/callback` - Handle QPay callbacks
- `POST /api/qpay/check-payment` - Check payment status
- `POST /api/qpay/create-order` - Create order after payment

### QPay Endpoints Used

- `POST /v2/auth/token` - Get access token
- `POST /v2/invoice` - Create invoice
- `POST /v2/payment/check` - Check payment status
- `DELETE /v2/payment/cancel/{payment_id}` - Cancel payment
- `DELETE /v2/payment/refund/{payment_id}` - Refund payment

## Best Practices

1. **Always validate callbacks**: Check required fields
2. **Handle all payment statuses**: Don't ignore any status
3. **Log everything**: For debugging and audit trails
4. **Use proper error handling**: Graceful degradation
5. **Test thoroughly**: Use sandbox environment
6. **Monitor callbacks**: Ensure reliable delivery

## Support

For QPay API support:
- Email: info@qpay.mn
- Documentation: https://developer.qpay.mn/
- API Status: Check QPay merchant portal

For our integration support:
- Check logs for detailed error messages
- Verify configuration settings
- Test with sandbox environment first
