import { NextRequest, NextResponse } from 'next/server';
import { QPayClient } from '@/lib/qpay-client';
import { getQPayConfig } from '@/lib/qpay-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceId } = body;

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    // Initialize QPay client
    const qpayConfig = getQPayConfig();
    const qpayClient = new QPayClient(qpayConfig);

    // Check payment status
    const payments = await qpayClient.checkPayment(invoiceId);

    if (payments.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          status: 'PENDING',
          message: 'No payment found for this invoice',
          payments: [],
        },
      });
    }

    // Get the latest payment
    const latestPayment = payments[0];
    
    return NextResponse.json({
      success: true,
      data: {
        status: latestPayment.payment_status,
        paymentId: latestPayment.payment_id,
        amount: latestPayment.payment_amount,
        createdAt: latestPayment.payment_date,
        updatedAt: latestPayment.payment_date,
        payments: payments,
      },
    });
  } catch (error) {
    console.error('QPay payment check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check payment status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
