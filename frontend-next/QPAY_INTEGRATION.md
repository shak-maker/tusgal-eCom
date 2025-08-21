# QPay API v2 Integration Guide

This guide explains how to integrate QPay payment processing into your Next.js e-commerce application.

## 🚀 Quick Start

### 1. Environment Variables

Create a `.env.local` file in your project root with the following QPay configuration:

```bash
# QPay API Configuration
NEXT_PUBLIC_QPAY_MERCHANT_ID=your_merchant_id_here
NEXT_PUBLIC_QPAY_USERNAME=your_username_here
NEXT_PUBLIC_QPAY_PASSWORD=your_password_here
NEXT_PUBLIC_QPAY_BASE_URL=https://merchant.qpay.mn
NEXT_PUBLIC_QPAY_CALLBACK_URL=https://yourdomain.com/api/qpay/callback
NEXT_PUBLIC_QPAY_INVOICE_CODE=your_invoice_code_here
```

**For Testing/Development:**
```bash
NEXT_PUBLIC_QPAY_MERCHANT_ID=TEST_MERCHANT
NEXT_PUBLIC_QPAY_USERNAME=TEST_MERCHANT
NEXT_PUBLIC_QPAY_PASSWORD=WBDUzy8n
NEXT_PUBLIC_QPAY_INVOICE_CODE=TEST_INVOICE
```

### 2. Files Created

The integration includes the following files:

- `src/lib/qpay-types.ts` - TypeScript interfaces for QPay API
- `src/lib/qpay-client.ts` - QPay API client class
- `src/lib/qpay-config.ts` - Configuration and constants
- `src/lib/hooks/useQPay.ts` - React hook for QPay functionality
- `src/components/QPayPayment.tsx` - Payment component
- `src/app/api/qpay/create-invoice/route.ts` - Invoice creation API
- `src/app/api/qpay/check-payment/route.ts` - Payment status check API
- `src/app/api/qpay/callback/route.ts` - Webhook callback handler

## 🔧 Usage

### Basic Integration

Import and use the QPayPayment component in your checkout page:

```tsx
import { QPayPayment } from '@/components/QPayPayment';

export default function CheckoutPage() {
  const handlePaymentSuccess = (paymentData: any) => {
    console.log('Payment successful:', paymentData);
    // Redirect to success page, clear cart, etc.
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    // Show error message to user
  };

  return (
    <div>
      <h1>Checkout</h1>
      <QPayPayment
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    </div>
  );
}
```

### Using the Hook

For more control, use the `useQPay` hook directly:

```tsx
import { useQPay } from '@/lib/hooks/useQPay';

function CustomPaymentForm() {
  const { createInvoice, checkPaymentStatus, isLoading, error } = useQPay();

  const handleSubmit = async (customerData: any) => {
    const invoice = await createInvoice(customerData);
    if (invoice) {
      // Handle invoice creation success
      console.log('Invoice created:', invoice);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your custom form fields */}
    </form>
  );
}
```

### API Routes

The integration provides three main API endpoints:

1. **POST /api/qpay/create-invoice** - Creates a QPay invoice
2. **POST /api/qpay/check-payment** - Checks payment status
3. **POST /api/qpay/callback** - Handles QPay webhooks

## 📱 Payment Flow

1. **Customer fills out form** with name, email, and phone
2. **Invoice is created** via QPay API
3. **Payment options are shown** (QR code or card payment)
4. **Customer completes payment** on QPay platform
5. **Payment status is monitored** via polling and webhooks
6. **Success/failure is handled** and cart is updated accordingly

## 🔒 Security Considerations

- **Never expose credentials** in client-side code
- **Use environment variables** for sensitive data
- **Validate all inputs** before sending to QPay
- **Implement proper error handling** for failed payments
- **Use HTTPS** in production for all API calls

## 🧪 Testing

### Test Credentials

QPay provides test credentials for development:
- Username: `TEST_MERCHANT`
- Password: `WBDUzy8n`
- Base URL: `https://merchant.qpay.mn`

### Test Scenarios

1. **Successful Payment Flow**
   - Create invoice
   - Complete payment
   - Verify callback received
   - Check payment status

2. **Error Handling**
   - Invalid credentials
   - Network failures
   - Invalid invoice data
   - Payment cancellations

## 📊 Monitoring & Debugging

### Logs

Check your server logs for:
- QPay API requests/responses
- Callback webhook data
- Payment status updates
- Error messages

### Common Issues

1. **Authentication Failed**
   - Check credentials in environment variables
   - Verify QPay account status

2. **Callback Not Received**
   - Ensure callback URL is accessible
   - Check firewall/network settings
   - Verify QPay webhook configuration

3. **Payment Status Not Updating**
   - Check polling interval
   - Verify invoice ID format
   - Check QPay API response

## 🚀 Production Deployment

### Environment Setup

1. **Update environment variables** with production credentials
2. **Configure callback URL** to your production domain
3. **Set up SSL certificates** for HTTPS
4. **Configure webhook endpoints** in QPay dashboard

### Monitoring

1. **Set up logging** for payment transactions
2. **Monitor API response times**
3. **Track payment success rates**
4. **Set up alerts** for failed payments

## 📚 Additional Resources

- [QPay API Documentation](https://merchant.qpay.mn/docs)
- [QPay Merchant Portal](https://merchant.qpay.mn)
- [QPay Support](mailto:support@qpay.mn)

## 🤝 Support

If you encounter issues:

1. Check the logs for error messages
2. Verify your QPay credentials
3. Test with QPay's test environment
4. Contact QPay support for API-related issues
5. Check this project's issues for known problems

## 📝 License

This integration is provided as-is for educational and development purposes. Please ensure compliance with QPay's terms of service and your local payment regulations.
