import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the callback data for debugging
    console.log('QPay callback received:', JSON.stringify(body, null, 2));

    // Extract payment information from callback
    const {
      payment_id,
      invoice_id,
      amount,
      status,
      transaction_id,
      payment_date,
      customer_info,
    } = body;

    // Validate required fields
    if (!payment_id || !invoice_id || !amount || !status) {
      console.error('QPay callback missing required fields:', body);
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Handle different payment statuses
    switch (status.toUpperCase()) {
      case 'PAID':
        // Payment successful - update order status in your database
        await handleSuccessfulPayment({
          paymentId: payment_id,
          invoiceId: invoice_id,
          amount,
          transactionId: transaction_id,
          paymentDate: payment_date,
          customerInfo: customer_info,
        });
        break;

      case 'CANCELLED':
        // Payment cancelled - update order status
        await handleCancelledPayment({
          paymentId: payment_id,
          invoiceId: invoice_id,
          amount,
        });
        break;

      case 'FAILED':
        // Payment failed - update order status
        await handleFailedPayment({
          paymentId: payment_id,
          invoiceId: invoice_id,
          amount,
        });
        break;

      case 'EXPIRED':
        // Payment expired - update order status
        await handleExpiredPayment({
          paymentId: payment_id,
          invoiceId: invoice_id,
          amount,
        });
        break;

      default:
        console.warn('Unknown QPay payment status:', status);
    }

    // Return success response to QPay
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('QPay callback processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process callback' },
      { status: 500 }
    );
  }
}

// Handle successful payment
async function handleSuccessfulPayment(data: {
  paymentId: string;
  invoiceId: string;
  amount: number;
  transactionId?: string;
  paymentDate?: string;
  customerInfo?: any;
}) {
  try {
    // TODO: Update your order status in the database
    // Example: await updateOrderStatus(data.invoiceId, 'PAID');
    
    // TODO: Send confirmation email to customer
    // Example: await sendPaymentConfirmationEmail(data.customerInfo);
    
    // TODO: Update inventory
    // Example: await updateInventory(data.invoiceId);
    
    console.log('Payment processed successfully:', data);
    
    // Note: Orders are now created in the frontend after successful payment
    // This ensures the order appears in the admin panel
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

// Handle cancelled payment
async function handleCancelledPayment(data: {
  paymentId: string;
  invoiceId: string;
  amount: number;
}) {
  try {
    // TODO: Update order status to cancelled
    // Example: await updateOrderStatus(data.invoiceId, 'CANCELLED');
    
    console.log('Payment cancelled:', data);
  } catch (error) {
    console.error('Error handling cancelled payment:', error);
  }
}

// Handle failed payment
async function handleFailedPayment(data: {
  paymentId: string;
  invoiceId: string;
  amount: number;
}) {
  try {
    // TODO: Update order status to failed
    // Example: await updateOrderStatus(data.invoiceId, 'FAILED');
    
    console.log('Payment failed:', data);
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

// Handle expired payment
async function handleExpiredPayment(data: {
  paymentId: string;
  invoiceId: string;
  amount: number;
}) {
  try {
    // TODO: Update order status to expired
    // Example: await updateOrderStatus(data.invoiceId, 'EXPIRED');
    
    console.log('Payment expired:', data);
  } catch (error) {
    console.error('Error handling expired payment:', error);
  }
}
