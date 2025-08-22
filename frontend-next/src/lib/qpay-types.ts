// QPay API v2 Types and Interfaces

export interface QPayAuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface QPayInvoiceRequest {
  invoice_code: string;
  sender_invoice_no: string;
  invoice_receiver_code: string;
  sender_branch_code?: string;
  invoice_description: string;
  enable_expiry?: boolean;
  allow_partial?: boolean;
  minimum_amount?: number | null;
  allow_exceed?: boolean;
  maximum_amount?: number | null;
  amount: number;
  callback_url: string;
  sender_staff_code?: string;
  note?: string | null;
  invoice_receiver_data?: QPayReceiverData;
  lines?: QPayInvoiceLine[];
}

export interface QPaySimpleInvoiceRequest {
  invoice_code: string;
  sender_invoice_no: string;
  invoice_receiver_code: string;
  invoice_description: string;
  sender_branch_code?: string;
  amount: number;
  callback_url: string;
}

export interface QPayReceiverData {
  register?: string;
  name: string;
  email: string;
  phone: string;
}

export interface QPayInvoiceLine {
  tax_product_code: string;
  line_description: string;
  line_quantity: string;
  line_unit_price: string;
  note?: string;
  discounts?: QPayDiscount[];
  surcharges?: QPaySurcharge[];
  taxes?: QPayTax[];
}

export interface QPayDiscount {
  discount_code: string;
  description: string;
  amount: number;
  note?: string;
}

export interface QPaySurcharge {
  surcharge_code: string;
  description: string;
  amount: number;
  note?: string;
}

export interface QPayTax {
  tax_code: string;
  description: string;
  amount: number;
  note?: string;
}

export interface QPayInvoiceResponse {
  id: string;
  invoice_code: string;
  sender_invoice_no: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface QPayPaymentCheckRequest {
  object_type: 'INVOICE';
  object_id: string;
  offset: {
    page_number: number;
    page_limit: number;
  };
}

// Updated payment response to match official QPay documentation
export interface QPayPaymentResponse {
  payment_id: string;
  payment_date: string;
  payment_status: 'NEW' | 'FAILED' | 'PAID' | 'REFUNDED';
  payment_fee: number;
  payment_amount: number;
  payment_currency: string;
  payment_wallet: string;
  payment_name: string;
  payment_description: string;
  qr_code?: string;
  paid_by: 'P2P' | 'CARD';
  object_type: 'MERCHANT' | 'INVOICE' | 'QR';
  object_id: string;
}

// QPay callback data structure
export interface QPayCallbackData {
  payment_id: string;
  payment_date: string;
  payment_status: 'NEW' | 'FAILED' | 'PAID' | 'REFUNDED';
  payment_fee: number;
  payment_amount: number;
  payment_currency: string;
  payment_wallet: string;
  payment_name: string;
  payment_description: string;
  qr_code?: string;
  paid_by: 'P2P' | 'CARD';
  object_type: 'MERCHANT' | 'INVOICE' | 'QR';
  object_id: string;
  invoice_id?: string;
  sender_invoice_no?: string;
}

export interface QPayPaymentListRequest {
  object_type: string;
  object_id: string;
  start_date: string;
  end_date: string;
  offset: {
    page_number: number;
    page_limit: number;
  };
}

export interface QPayEbarimtRequest {
  payment_id: string;
  ebarimt_receiver_type: 'CITIZEN' | 'COMPANY';
}

export interface QPayEbarimtResponse {
  id: string;
  payment_id: string;
  ebarimt_receiver_type: string;
  status: string;
  created_at: string;
}

// Error Response Types
export interface QPayErrorResponse {
  error: string;
  message: string;
  status: number;
}

// Configuration Types
export interface QPayConfig {
  merchantId: string;
  username: string;
  password: string;
  baseUrl: string;
  callbackUrl: string;
  invoiceCode: string;
}
