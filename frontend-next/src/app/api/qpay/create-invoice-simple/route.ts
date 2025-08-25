import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoice_code, amount } = body;

    if (!invoice_code || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: invoice_code and amount' },
        { status: 400 }
      );
    }

    console.log('📝 Creating QPay invoice with:', { invoice_code, amount });

    // Get QPay configuration from environment variables
    const QPAY_BASE_URL = process.env.QPAY_BASE_URL || 'https://merchant.qpay.mn/v2';
    const QPAY_ACCESS_TOKEN = process.env.QPAY_ACCESS_TOKEN;

    if (!QPAY_ACCESS_TOKEN) {
      console.error('QPAY_ACCESS_TOKEN not configured');
      return NextResponse.json(
        { error: 'QPay access token not configured' },
        { status: 500 }
      );
    }

    // Prepare invoice request
    const invoiceRequest = {
      invoice_code,
      amount,
      callback_url: 'http://tusgal.shop/checkout'
    };

    console.log('QPay invoice request:', JSON.stringify(invoiceRequest, null, 2));

    // Call QPay API
    const response = await axios.post(
      `${QPAY_BASE_URL}/invoice`,
      invoiceRequest,
      {
        headers: {
          'Authorization': `Bearer ${QPAY_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('QPay invoice response:', JSON.stringify(response.data, null, 2));

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('QPay invoice creation error:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    }

    return NextResponse.json(
      { 
        error: 'Failed to create invoice',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
