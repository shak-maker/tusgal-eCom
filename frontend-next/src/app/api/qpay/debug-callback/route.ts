import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('payment_id');
    const testType = searchParams.get('test') || 'mock';

    console.log('🔍 Debug callback test:', { paymentId, testType });

    // Simulate different callback scenarios
    const testScenarios = {
      mock: {
        success: true,
        orderId: paymentId || 'TEST_MOCK',
        status: 'PAID',
        source: 'mock',
        message: 'Mock payment successful'
      },
      qpay_api: {
        success: true,
        orderId: paymentId || 'TEST_QPAY',
        status: 'verified_with_qpay',
        source: 'qpay_api',
        qpayData: {
          payment_id: paymentId || 'TEST_PAYMENT',
          payment_status: 'PAID',
          payment_amount: 10000
        }
      },
      error: {
        success: false,
        orderId: paymentId || 'TEST_ERROR',
        error: 'Payment failed',
        source: 'error'
      },
      not_found: {
        success: false,
        orderId: paymentId || 'TEST_NOT_FOUND',
        error: 'No status found',
        source: 'not_found'
      }
    };

    const response = testScenarios[testType as keyof typeof testScenarios] || testScenarios.mock;

    console.log('📊 Debug callback response:', response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Debug callback error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Debug test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔍 Debug POST callback received:', JSON.stringify(body, null, 2));

    // Simulate successful payment callback
    const mockResponse = {
      success: true,
      message: 'Debug callback processed successfully',
      receivedData: body,
      timestamp: new Date().toISOString()
    };

    console.log('📊 Debug POST callback response:', mockResponse);

    return NextResponse.json(mockResponse);

  } catch (error) {
    console.error('Debug POST callback error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Debug POST callback failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
