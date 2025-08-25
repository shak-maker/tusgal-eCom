import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { prisma } from '@/lib/db';
import { OrderStatus } from '@prisma/client';

// Mock order status storage in memory
const mockOrderStatus = new Map<string, string>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('payment_id');
    const invoiceId = searchParams.get('invoice_id');
    const test = searchParams.get('test');

    console.log('🔍 GET request received with params:', { paymentId, invoiceId, test });

    // Simple test endpoint - check this first
    if (test === 'ping') {
      console.log('🏓 Callback test ping received');
      return NextResponse.json({
        success: true,
        message: 'Callback endpoint is accessible',
        timestamp: new Date().toISOString(),
        headers: Object.fromEntries(request.headers.entries())
      });
    }

    // Only validate payment_id/invoice_id if not a test request
    if (!paymentId && !invoiceId) {
      console.log('❌ Missing payment_id or invoice_id parameter');
      return NextResponse.json(
        { error: 'Missing payment_id or invoice_id parameter' },
        { status: 400 }
      );
    }

    console.log(`🔍 Payment status check via GET: paymentId=${paymentId}, invoiceId=${invoiceId}`);

    // Check mock order status first
    const orderId = invoiceId || paymentId;
    const mockStatus = mockOrderStatus.get(orderId || '');
    
    if (mockStatus) {
      console.log(`📋 Mock order status for ${orderId}: ${mockStatus}`);
      return NextResponse.json({
        success: true,
        orderId,
        status: mockStatus,
        source: 'mock'
      });
    }

    // If no mock status, check with QPay API
    if (invoiceId) {
      try {
        const qpayStatus = await verifyPaymentWithQPay(invoiceId, paymentId || '');
        return NextResponse.json({
          success: true,
          orderId: invoiceId,
          status: 'verified_with_qpay',
          qpayData: qpayStatus,
          source: 'qpay_api'
        });
      } catch (error) {
        console.error('Failed to check with QPay API:', error);
        return NextResponse.json({
          success: false,
          orderId: invoiceId,
          error: 'Failed to verify with QPay API',
          source: 'qpay_api_error'
        });
      }
    }

    return NextResponse.json({
      success: false,
      orderId,
      error: 'No status found',
      source: 'not_found'
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 QPay callback POST received');
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    const body = await request.json();
    
    // Log the callback data for debugging
    console.log('📥 QPay callback received:', JSON.stringify(body, null, 2));

    // Parse JSON body from QPay
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
    } = body;

    console.log('🔍 Parsed callback data:', {
      payment_id,
      payment_status,
      payment_amount,
      object_id,
      invoice_id,
      sender_invoice_no
    });

    // Validate required fields based on QPay documentation
    if (!payment_id || !payment_status || !payment_amount || !object_id) {
      console.error('❌ QPay callback missing required fields:', body);
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('✅ Required fields validation passed');

    // Handle different payment statuses according to QPay documentation
    switch (payment_status) {
      case 'PAID':
        console.log('💰 Processing PAID payment...');
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
        console.log('❌ Processing FAILED payment...');
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
        console.log('🔄 Processing REFUNDED payment...');
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
        console.log('🆕 Processing NEW payment...');
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
        console.warn('⚠️ Unknown QPay payment status:', payment_status);
    }

    // Update mock order status in memory
    const orderId = invoice_id || object_id || payment_id;
    if (orderId) {
      mockOrderStatus.set(orderId, payment_status);
      console.log(`📝 Updated mock order status for ${orderId}: ${payment_status}`);
    }

    // Check payment status with QPay API for verification
    try {
      console.log('🔍 Verifying payment with QPay API...');
      await verifyPaymentWithQPay(invoice_id || object_id, payment_id);
    } catch (error) {
      console.error('❌ Failed to verify payment with QPay:', error);
    }

    console.log('✅ QPay callback processed successfully');
    // Respond with 200 OK
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ QPay callback processing error:', error);
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

    // Update order status in the database
    await updateOrderStatus(data.invoiceId || data.objectId, 'PAID', data.paymentId);
    
    // TODO: Send confirmation email to customer
    // Example: await sendPaymentConfirmationEmail(data.paymentName, data.paymentAmount);
    
    // TODO: Update inventory
    // Example: await updateInventory(data.invoiceId || data.objectId);
    
    // TODO: Log payment details for accounting
    // Example: await logPaymentDetails(data);
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

    // Update order status to failed
    await updateOrderStatus(data.invoiceId || data.objectId, 'FAILED', data.paymentId);
    
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

    // Update order status to refunded
    await updateOrderStatus(data.invoiceId || data.objectId, 'CANCELLED', data.paymentId);
    
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

    // Update order status to pending
    await updateOrderStatus(data.invoiceId || data.objectId, 'PENDING', data.paymentId);
    
    // TODO: Send payment pending notification
    // Example: await sendPaymentPendingEmail(data.senderInvoiceNo);
  } catch (error) {
    console.error('Error handling new payment:', error);
  }
}

// Verify payment with QPay API
async function verifyPaymentWithQPay(invoiceId: string, paymentId: string) {
  try {
    console.log(`🔍 Verifying payment with QPay API: invoiceId=${invoiceId}, paymentId=${paymentId}`);

    // Get QPay configuration from environment variables
    const QPAY_BASE_URL = process.env.QPAY_BASE_URL || 'https://merchant.qpay.mn/v2';
    const QPAY_ACCESS_TOKEN = process.env.QPAY_ACCESS_TOKEN;

    if (!QPAY_ACCESS_TOKEN) {
      console.error('QPAY_ACCESS_TOKEN not configured for payment verification');
      return;
    }

    // Prepare payment check request
    const checkRequest = {
      object_type: 'INVOICE',
      object_id: invoiceId,
      offset: { 
        page_number: 1, 
        page_limit: 100 
      }
    };

    console.log('QPay payment verification request:', JSON.stringify(checkRequest, null, 2));

    // Call QPay API to verify payment
    const response = await axios.post(
      `${QPAY_BASE_URL}/payment/check`,
      checkRequest,
      {
        headers: {
          'Authorization': `Bearer ${QPAY_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('QPay payment verification response:', JSON.stringify(response.data, null, 2));

    // Check if the payment is confirmed in QPay's system
    const payments = response.data;
    const confirmedPayment = payments.find((payment: any) => 
      payment.payment_id === paymentId && payment.payment_status === 'PAID'
    );

    if (confirmedPayment) {
      console.log('✅ Payment confirmed with QPay API:', {
        paymentId: confirmedPayment.payment_id,
        status: confirmedPayment.payment_status,
        amount: confirmedPayment.payment_amount,
        date: confirmedPayment.payment_date
      });
    } else {
      console.warn('⚠️ Payment not found or not confirmed in QPay API');
    }

    return response.data;
  } catch (error) {
    console.error('Error verifying payment with QPay API:', error);
    throw error;
  }
}

// Update order status in database
async function updateOrderStatus(orderId: string, status: OrderStatus, paymentId?: string) {
  try {
    console.log(`📝 Updating order status in database: orderId=${orderId}, status=${status}, paymentId=${paymentId}`);

    const updateData: any = {
      status: status,
      paid: status === 'PAID',
      updatedAt: new Date(),
    };

    // Add payment details if provided
    if (paymentId) {
      updateData.paymentId = paymentId;
    }

    console.log('🔍 Searching for order with criteria:', {
      invoiceId: orderId,
      orderId: orderId
    });

    // Try to find order by invoiceId first, then by orderId
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { invoiceId: orderId },
          { id: orderId }
        ]
      }
    });

    console.log('🔍 Order search result:', order ? {
      id: order.id,
      invoiceId: order.invoiceId,
      status: order.status,
      paid: order.paid
    } : 'No order found');

    if (order) {
      console.log('📝 Updating order with data:', updateData);
      
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: updateData
      });

      console.log(`✅ Order status updated successfully:`, {
        orderId: updatedOrder.id,
        invoiceId: updatedOrder.invoiceId,
        status: updatedOrder.status,
        paid: updatedOrder.paid,
        paymentId: updatedOrder.paymentId
      });

      return updatedOrder;
    } else {
      console.warn(`⚠️ Order not found for orderId: ${orderId}`);
      
      // Let's also search for any orders with similar invoiceId patterns
      const similarOrders = await prisma.order.findMany({
        where: {
          OR: [
            { invoiceId: { contains: orderId } },
            { id: { contains: orderId } }
          ]
        },
        select: {
          id: true,
          invoiceId: true,
          status: true,
          paid: true
        }
      });
      
      console.log('🔍 Similar orders found:', similarOrders);
      
      return null;
    }
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    throw error;
  }
}
