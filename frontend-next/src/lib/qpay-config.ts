import { QPayConfig } from './qpay-types';

// QPay Configuration
// Replace these values with your actual QPay merchant credentials
export const qpayConfig: QPayConfig = {
  merchantId: process.env.NEXT_PUBLIC_QPAY_MERCHANT_ID || 'TUSGAL_OPTIC',
  username: process.env.NEXT_PUBLIC_QPAY_USERNAME || 'TUSGAL_OPTIC',
  password: process.env.NEXT_PUBLIC_QPAY_PASSWORD || 'h1H1Wq4S',
  baseUrl: process.env.NEXT_PUBLIC_QPAY_BASE_URL || 'https://merchant.qpay.mn',
  callbackUrl: process.env.NEXT_PUBLIC_QPAY_CALLBACK_URL || 'https://tusgal.shop/api/qpay/callback',
  invoiceCode: process.env.NEXT_PUBLIC_QPAY_INVOICE_CODE || 'TUSGAL_OPTIC_INVOICE',
};

// Always use production configuration
export const getQPayConfig = (): QPayConfig => {
  return {
    ...qpayConfig,
    callbackUrl: 'https://tusgal.shop/api/qpay/callback', // Always use production domain
  };
};

// QPay API endpoints
export const QPAY_ENDPOINTS = {
  AUTH_TOKEN: '/v2/auth/token',
  INVOICE: '/v2/invoice',
  PAYMENT: '/v2/payment',
  EBARIMT: '/v2/ebarimt/create',
} as const;

// QPay status constants
export const QPAY_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  FAILED: 'FAILED',
} as const;

// QPay error messages
export const QPAY_ERROR_MESSAGES = {
  AUTHENTICATION_FAILED: 'Authentication failed. Please check your credentials.',
  INVOICE_CREATION_FAILED: 'Failed to create invoice. Please try again.',
  PAYMENT_CHECK_FAILED: 'Failed to check payment status. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_RESPONSE: 'Invalid response from QPay server.',
} as const;
