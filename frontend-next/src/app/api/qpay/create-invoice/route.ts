import { NextRequest, NextResponse } from 'next/server';
import { QPayClient } from '@/lib/qpay-client';
import { getQPayConfig } from '@/lib/qpay-config';
import { useCartStore } from '@/lib/cartStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartItems, customerData, totalAmount } = body;

    if (!cartItems || !customerData || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize QPay client
    const qpayConfig = getQPayConfig();
    const qpayClient = new QPayClient(qpayConfig);

    // Generate unique invoice number
    const senderInvoiceNo = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create invoice description
    const invoiceDescription = `Order for ${customerData.name} - ${cartItems.length} items`;

    // Create simple invoice
    const invoice = await qpayClient.createSimpleInvoice(
      senderInvoiceNo,
      totalAmount,
      invoiceDescription,
      {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
      }
    );

    console.log('QPay invoice response:', JSON.stringify(invoice, null, 2));

    return NextResponse.json({
      success: true,
      data: {
        invoiceId: invoice.invoice_id, // Fix: use invoice_id instead of id
        invoiceCode: invoice.invoice_code,
        amount: invoice.amount,
        status: invoice.status,
        qrCodeUrl: `${qpayConfig.baseUrl}/v2/invoice/${invoice.invoice_id}/qr`, // Fix: use invoice_id
        paymentUrl: `${qpayConfig.baseUrl}/v2/invoice/${invoice.invoice_id}/pay`, // Fix: use invoice_id
        // Use QPay's built-in QR data
        qrText: invoice.qr_text,
        qrImage: invoice.qr_image,
        qPayShortUrl: invoice.qPay_shortUrl,
        urls: invoice.urls,
      },
    });
  } catch (error) {
    console.error('QPay invoice creation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create invoice',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
