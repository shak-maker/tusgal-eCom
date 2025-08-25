import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('type') || 'success';

    console.log('🧪 Testing real payment flow:', { testType });

    // Simulate different real payment scenarios
    const testScenarios = {
      success: {
        success: true,
        paymentId: 'REAL_PAYMENT_' + Date.now(),
        status: 'PAID',
        source: 'qpay_callback',
        message: 'Real payment successful!',
        qpayData: {
          payment_id: 'REAL_PAYMENT_' + Date.now(),
          payment_status: 'PAID',
          payment_amount: 10000,
          payment_date: new Date().toISOString(),
          invoice_id: 'acc8ff7d-04b3-45d7-9f85-7fe3d1a7967f'
        }
      },
      pending: {
        success: false,
        paymentId: 'REAL_PAYMENT_' + Date.now(),
        status: 'PENDING',
        source: 'qpay_callback',
        message: 'Payment is pending...',
        qpayData: {
          payment_id: 'REAL_PAYMENT_' + Date.now(),
          payment_status: 'PENDING',
          payment_amount: 10000,
          payment_date: new Date().toISOString(),
          invoice_id: 'acc8ff7d-04b3-45d7-9f85-7fe3d1a7967f'
        }
      },
      failed: {
        success: false,
        paymentId: 'REAL_PAYMENT_' + Date.now(),
        status: 'FAILED',
        source: 'qpay_callback',
        message: 'Payment failed',
        qpayData: {
          payment_id: 'REAL_PAYMENT_' + Date.now(),
          payment_status: 'FAILED',
          payment_amount: 10000,
          payment_date: new Date().toISOString(),
          invoice_id: 'acc8ff7d-04b3-45d7-9f85-7fe3d1a7967f'
        }
      }
    };

    const response = testScenarios[testType as keyof typeof testScenarios] || testScenarios.success;

    console.log('📊 Real payment test response:', response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Real payment test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Real payment test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔍 Real payment POST callback received:', JSON.stringify(body, null, 2));

    // Simulate QPay callback data
    const qpayCallbackData = {
      payment_id: body.payment_id || 'REAL_PAYMENT_' + Date.now(),
      payment_status: body.payment_status || 'PAID',
      payment_amount: body.payment_amount || 10000,
      payment_date: body.payment_date || new Date().toISOString(),
      invoice_id: body.invoice_id || 'acc8ff7d-04b3-45d7-9f85-7fe3d1a7967f',
      merchant_id: body.merchant_id || 'TUSGAL_OPTIC',
      transaction_id: body.transaction_id || 'TXN_' + Date.now()
    };

    const response = {
      success: true,
      message: 'Real payment callback processed successfully',
      receivedData: qpayCallbackData,
      timestamp: new Date().toISOString(),
      redirect_url: 'http://tusgal.shop/checkout?payment_id=' + qpayCallbackData.payment_id
    };

    console.log('📊 Real payment POST callback response:', response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Real payment POST callback error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Real payment POST callback failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
