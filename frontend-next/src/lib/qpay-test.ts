// QPay Integration Test Script
// This file can be used to test QPay API connectivity

import { QPayClient } from './qpay-client';
import { getQPayConfig } from './qpay-config';

export async function testQPayIntegration() {
  try {
    console.log('🧪 Testing QPay Integration...');
    
    // Get configuration
    const config = getQPayConfig();
    console.log('✅ Configuration loaded:', {
      baseUrl: config.baseUrl,
      username: config.username,
      merchantId: config.merchantId,
      invoiceCode: config.invoiceCode
    });

    // Initialize client
    const qpayClient = new QPayClient(config);
    console.log('✅ QPay client initialized');

    // Test authentication
    console.log('🔐 Testing authentication...');
    try {
      // This will test the auth token endpoint
      const token = await (qpayClient as any).getAuthToken();
      console.log('✅ Authentication successful');
      console.log('Token:', token.substring(0, 20) + '...');
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      return false;
    }

    // Test simple invoice creation
    console.log('📄 Testing invoice creation...');
    try {
      const invoice = await qpayClient.createSimpleInvoice(
        'TEST-' + Date.now(),
        1000, // 1000 MNT
        'Test invoice for integration testing',
        {
          name: 'Test User',
          email: 'test@example.com',
          phone: '12345678'
        }
      );
      console.log('✅ Invoice created successfully');
      console.log('Invoice ID:', invoice.id);
      console.log('Invoice Code:', invoice.invoice_code);
      console.log('Amount:', invoice.amount);
      
      // Test payment status check
      console.log('🔍 Testing payment status check...');
      const payments = await qpayClient.checkPayment(invoice.id);
      console.log('✅ Payment status check successful');
      console.log('Payment count:', payments.length);
      
      return true;
    } catch (error) {
      console.error('❌ Invoice creation failed:', error);
      return false;
    }

  } catch (error) {
    console.error('❌ QPay integration test failed:', error);
    return false;
  }
}

// Test function that can be called from browser console
export function runQPayTest() {
  console.log('🚀 Starting QPay integration test...');
  testQPayIntegration()
    .then(success => {
      if (success) {
        console.log('🎉 QPay integration test completed successfully!');
      } else {
        console.log('💥 QPay integration test failed!');
      }
    })
    .catch(error => {
      console.error('💥 Test execution error:', error);
    });
}

// Make it available globally for browser testing
if (typeof window !== 'undefined') {
  (window as any).testQPay = runQPayTest;
}
