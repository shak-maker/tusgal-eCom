import { NextRequest, NextResponse } from 'next/server';
import { QPayCallbackData } from '@/lib/qpay-types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the callback data for debugging
    console.log('QPay callback received:', JSON.stringify(body, null, 2));

    // Extract payment information from callback using official QPay structure
    const {
      payment_id,
      payment_date,
      payment_status,
      payment_fee,
      payment_amount,
      payment_currency,
      payment_wallet,
      payment_name,
      payment_description,
      qr_code,
      paid_by,
      object_type,
      object_id,
      invoice_id,
      sender_invoice_no,
    } = body as QPayCallbackData;

    // Validate required fields based on QPay documentation
    if (!payment_id || !payment_status || !payment_amount || !object_id) {
      console.error('QPay callback missing required fields:', body);
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Handle different payment statuses according to QPay documentation
    switch (payment_status) {
      case 'PAID':
        // Payment successful - update order status in your database
        await handleSuccessfulPayment({
          paymentId: payment_id,
          paymentDate: payment_date,
          paymentAmount: payment_amount,
          paymentFee: payment_fee,
          paymentCurrency: payment_currency,
          paymentWallet: payment_wallet,
          paymentName: payment_name,
          paymentDescription: payment_description,
          qrCode: qr_code,
          paidBy: paid_by,
          objectType: object_type,
          objectId: object_id,
          invoiceId: invoice_id,
          senderInvoiceNo: sender_invoice_no,
        });
        break;

      case 'FAILED':
        // Payment failed - update order status
        await handleFailedPayment({
          paymentId: payment_id,
          paymentDate: payment_date,
          paymentAmount: payment_amount,
          objectId: object_id,
          invoiceId: invoice_id,
          senderInvoiceNo: sender_invoice_no,
        });
        break;

      case 'REFUNDED':
        // Payment refunded - update order status
        await handleRefundedPayment({
          paymentId: payment_id,
          paymentDate: payment_date,
          paymentAmount: payment_amount,
          objectId: object_id,
          invoiceId: invoice_id,
          senderInvoiceNo: sender_invoice_no,
        });
        break;

      case 'NEW':
        // Payment created but not yet processed
        await handleNewPayment({
          paymentId: payment_id,
          paymentDate: payment_date,
          paymentAmount: payment_amount,
          objectId: object_id,
          invoiceId: invoice_id,
          senderInvoiceNo: sender_invoice_no,
        });
        break;

      default:
        console.warn('Unknown QPay payment status:', payment_status);
    }

    // Return success response to QPay (QPay expects a simple success response)
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
  paymentDate: string;
  paymentAmount: number;
  paymentFee: number;
  paymentCurrency: string;
  paymentWallet: string;
  paymentName: string;
  paymentDescription: string;
  qrCode?: string;
  paidBy: string;
  objectType: string;
  objectId: string;
  invoiceId?: string;
  senderInvoiceNo?: string;
}) {
  try {
    console.log('✅ Payment processed successfully:', {
      paymentId: data.paymentId,
      amount: data.paymentAmount,
      currency: data.paymentCurrency,
      paidBy: data.paidBy,
      objectId: data.objectId,
      invoiceId: data.invoiceId,
    });

    // TODO: Update your order status in the database
    // Example: await updateOrderStatus(data.invoiceId || data.objectId, 'PAID');
    
    // TODO: Send confirmation email to customer
    // Example: await sendPaymentConfirmationEmail(data.paymentName, data.paymentAmount);
    
    // TODO: Update inventory
    // Example: await updateInventory(data.invoiceId || data.objectId);
    
    // TODO: Log payment details for accounting
    // Example: await logPaymentDetails(data);
    
    // Note: Orders are now created in the frontend after successful payment
    // This ensures the order appears in the admin panel
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

// Handle failed payment
async function handleFailedPayment(data: {
  paymentId: string;
  paymentDate: string;
  paymentAmount: number;
  objectId: string;
  invoiceId?: string;
  senderInvoiceNo?: string;
}) {
  try {
    console.log('❌ Payment failed:', {
      paymentId: data.paymentId,
      amount: data.paymentAmount,
      objectId: data.objectId,
      invoiceId: data.invoiceId,
    });

    // TODO: Update order status to failed
    // Example: await updateOrderStatus(data.invoiceId || data.objectId, 'FAILED');
    
    // TODO: Send failure notification to customer
    // Example: await sendPaymentFailureEmail(data.senderInvoiceNo);
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

// Handle refunded payment
async function handleRefundedPayment(data: {
  paymentId: string;
  paymentDate: string;
  paymentAmount: number;
  objectId: string;
  invoiceId?: string;
  senderInvoiceNo?: string;
}) {
  try {
    console.log('🔄 Payment refunded:', {
      paymentId: data.paymentId,
      amount: data.paymentAmount,
      objectId: data.objectId,
      invoiceId: data.invoiceId,
    });

    // TODO: Update order status to refunded
    // Example: await updateOrderStatus(data.invoiceId || data.objectId, 'REFUNDED');
    
    // TODO: Process refund logic (restore inventory, etc.)
    // Example: await processRefund(data.invoiceId || data.objectId);
    
    // TODO: Send refund confirmation to customer
    // Example: await sendRefundConfirmationEmail(data.senderInvoiceNo);
  } catch (error) {
    console.error('Error handling refunded payment:', error);
  }
}

// Handle new payment (created but not yet processed)
async function handleNewPayment(data: {
  paymentId: string;
  paymentDate: string;
  paymentAmount: number;
  objectId: string;
  invoiceId?: string;
  senderInvoiceNo?: string;
}) {
  try {
    console.log('🆕 New payment created:', {
      paymentId: data.paymentId,
      amount: data.paymentAmount,
      objectId: data.objectId,
      invoiceId: data.invoiceId,
    });

    // TODO: Update order status to pending
    // Example: await updateOrderStatus(data.invoiceId || data.objectId, 'PENDING');
    
    // TODO: Send payment pending notification
    // Example: await sendPaymentPendingEmail(data.senderInvoiceNo);
  } catch (error) {
    console.error('Error handling new payment:', error);
  }
}
