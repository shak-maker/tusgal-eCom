import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('type') || 'success';

    console.log('🧪 Testing payment success simulation:', testType);

    // Simulate different payment scenarios
    const testResponses = {
      success: {
        success: true,
        orderId: 'TEST_SUCCESS_123',
        status: 'PAID',
        source: 'mock',
        message: 'Payment successful'
      },
      qpay_api: {
        success: true,
        orderId: 'TEST_QPAY_456',
        status: 'verified_with_qpay',
        source: 'qpay_api',
        qpayData: {
          payment_id: 'TEST_PAYMENT_456',
          payment_status: 'PAID',
          payment_amount: 10000
        }
      },
      mock: {
        success: true,
        orderId: 'TEST_MOCK_789',
        status: 'PAID',
        source: 'mock'
      }
    };

    const response = testResponses[testType as keyof typeof testResponses] || testResponses.success;

    // Add a small delay to simulate real API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Payment success test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
