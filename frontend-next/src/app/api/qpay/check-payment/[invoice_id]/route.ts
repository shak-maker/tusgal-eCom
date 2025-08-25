import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoice_id: string }> }
) {
  const { invoice_id } = await params;
  try {

    if (!invoice_id) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Checking payment status for invoice: ${invoice_id}`);

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

    // Prepare payment check request
    const checkRequest = {
      object_type: 'INVOICE',
      object_id: invoice_id,
      offset: { 
        page_number: 1, 
        page_limit: 100 
      }
    };

    console.log('QPay payment check request:', JSON.stringify(checkRequest, null, 2));

    // Call QPay API
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

    console.log('QPay payment check response:', JSON.stringify(response.data, null, 2));

    // Return QPay's response JSON
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('QPay payment check error:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    }

    return NextResponse.json(
      { 
        error: 'Failed to check payment status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
