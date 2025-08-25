import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('type') || 'demo';

    console.log('🧪 Testing callback-based payment checking:', testType);

    let testResults = [];

    // Test 1: Check payment status via callback URL
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/qpay/callback?payment_id=TEST_PAYMENT_123`);
      const result = await response.json();
      testResults.push({
        test: 'Callback Payment Check',
        success: response.ok,
        result: result
      });
    } catch (error) {
      testResults.push({
        test: 'Callback Payment Check',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Check with invoice ID
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/qpay/callback?invoice_id=TEST_INV_001`);
      const result = await response.json();
      testResults.push({
        test: 'Callback Invoice Check',
        success: response.ok,
        result: result
      });
    } catch (error) {
      testResults.push({
        test: 'Callback Invoice Check',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Callback-based payment checking test completed',
      timestamp: new Date().toISOString(),
      testType,
      results: testResults
    });

  } catch (error) {
    console.error('Test callback error:', error);
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
