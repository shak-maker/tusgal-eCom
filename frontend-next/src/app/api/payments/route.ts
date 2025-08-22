import { NextRequest, NextResponse } from 'next/server';
import { QPayCallbackData } from '@/lib/qpay-types';

// Handle GET requests with query parameters (e.g., ?payment_id=12345678)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('payment_id');
    
    console.log('QPay callback received (GET):', { payment_id: paymentId });
    
    if (!paymentId) {
      return NextResponse.json({ error: 'Missing payment_id parameter' }, { status: 400 });
    }
    
    // For GET requests, we might just want to acknowledge receipt
    // The actual payment processing will happen via POST callbacks
    return NextResponse.json({ 
      success: true, 
      message: 'Payment callback received',
      payment_id: paymentId 
    });
    
  } catch (error) {
    console.error('Error processing QPay GET callback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const callbackData: QPayCallbackData = await request.json();
    
    console.log('QPay callback received (POST):', JSON.stringify(callbackData, null, 2));

    // Extract payment information from callback data
    const {
      payment_id,
      payment_status,
      payment_amount,
      payment_date,
      object_id, // This should be the invoice_id
      sender_invoice_no
    } = callbackData;

    if (!object_id) {
      console.error('No object_id (invoice_id) found in callback data');
      return NextResponse.json({ error: 'Missing invoice_id' }, { status: 400 });
    }

    switch (payment_status) {
      case 'PAID':
        console.log('Payment successful for invoice:', object_id);
        await handleSuccessfulPayment(callbackData);
        break;
        
      case 'FAILED':
        console.log('Payment failed for invoice:', object_id);
        await handleFailedPayment(callbackData);
        break;
        
      case 'REFUNDED':
        console.log('Payment refunded for invoice:', object_id);
        await handleRefundedPayment(callbackData);
        break;
        
      case 'NEW':
        console.log('New payment status for invoice:', object_id);
        await handleNewPayment(callbackData);
        break;
        
      default:
        console.log('Unknown payment status:', payment_status);
        break;
    }

    // Return success to QPay
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error processing QPay callback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(callbackData: QPayCallbackData) {
  try {
    const { object_id, payment_amount, payment_date } = callbackData;
    
    // Find the invoice and update its status
    // You might want to create an order here or update existing order status
    console.log('Processing successful payment for invoice:', object_id);
    
    // TODO: Implement order creation/update logic here
    // This could involve:
    // 1. Finding the invoice in your database
    // 2. Creating an order record
    // 3. Updating inventory
    // 4. Sending confirmation emails
    
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

async function handleFailedPayment(callbackData: QPayCallbackData) {
  try {
    const { object_id } = callbackData;
    console.log('Processing failed payment for invoice:', object_id);
    
    // TODO: Implement failed payment handling
    // This could involve:
    // 1. Updating invoice status
    // 2. Sending failure notification
    // 3. Releasing reserved inventory
    
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

async function handleRefundedPayment(callbackData: QPayCallbackData) {
  try {
    const { object_id } = callbackData;
    console.log('Processing refunded payment for invoice:', object_id);
    
    // TODO: Implement refund handling
    // This could involve:
    // 1. Updating order status
    // 2. Processing refund logic
    // 3. Updating inventory
    
  } catch (error) {
    console.error('Error handling refunded payment:', error);
  }
}

async function handleNewPayment(callbackData: QPayCallbackData) {
  try {
    const { object_id } = callbackData;
    console.log('Processing new payment for invoice:', object_id);
    
    // TODO: Implement new payment handling
    // This could involve:
    // 1. Updating invoice status
    // 2. Sending confirmation
    
  } catch (error) {
    console.error('Error handling new payment:', error);
  }
}
