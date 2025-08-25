import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('type') || 'demo';

    console.log('🧪 Testing payment flow with loading animations:', testType);

    // Simulate different payment scenarios
    const testScenarios = {
      success: {
        payment_id: 'TEST_SUCCESS_123',
        status: 'PAID',
        message: 'Төлбөр амжилттай! Таны захиалга баталгаажлаа.'
      },
      loading: {
        payment_id: 'TEST_LOADING_456',
        status: 'loading',
        message: 'Төлбөр шалгаж байна...'
      },
      error: {
        payment_id: 'TEST_ERROR_789',
        status: 'FAILED',
        message: 'Төлбөр амжилтгүй болсон.'
      }
    };

    const scenario = testScenarios[testType as keyof typeof testScenarios] || testScenarios.success;

    return NextResponse.json({
      success: true,
      message: 'Payment flow test completed',
      timestamp: new Date().toISOString(),
      testType,
      scenario,
      callbackUrl: 'http://tusgal.shop/checkout',
      testUrls: {
        success: `http://tusgal.shop/checkout?payment_id=${testScenarios.success.payment_id}`,
        loading: `http://tusgal.shop/checkout?payment_id=${testScenarios.loading.payment_id}`,
        error: `http://tusgal.shop/checkout?payment_id=${testScenarios.error.payment_id}`
      }
    });

  } catch (error) {
    console.error('Payment flow test error:', error);
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
