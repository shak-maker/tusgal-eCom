import {
  QPayAuthResponse,
  QPayInvoiceRequest,
  QPaySimpleInvoiceRequest,
  QPayInvoiceResponse,
  QPayPaymentCheckRequest,
  QPayPaymentResponse,
  QPayPaymentListRequest,
  QPayEbarimtRequest,
  QPayEbarimtResponse,
  QPayErrorResponse,
  QPayConfig,
  QPayCallbackData
} from './qpay-types';

export class QPayClient {
  private config: QPayConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0; // Unix timestamp (seconds)

  constructor(config: QPayConfig) {
    this.config = config;
  }

  private async getAuthToken(): Promise<string> {
    // Check if we have a valid token using timestamp
    const currentTimestamp = Math.floor(Date.now() / 1000);
    
    if (this.accessToken && currentTimestamp < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      console.log('🔐 Getting new QPay auth token...');
      
      const response = await fetch(`${this.config.baseUrl}/v2/auth/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${this.config.username}:${this.config.password}`)}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const authData: QPayAuthResponse = await response.json();
      
      this.accessToken = authData.access_token;
      // Store expiry as timestamp (not milliseconds) for accurate comparison
      this.tokenExpiry = currentTimestamp + authData.expires_in;
      
      console.log(`✅ QPay token obtained, expires at: ${new Date(this.tokenExpiry * 1000).toISOString()}`);
      console.log(`Token: ${this.accessToken}`);
      
      return this.accessToken;
    } catch (error) {
      console.error('QPay authentication error:', error);
      throw new Error('Failed to authenticate with QPay');
    }
  }

  private async makeAuthenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();

    console.log(`📞 Making authenticated request to ${endpoint} with token: ${token}`);
    console.log('Request options:', JSON.stringify(options, null, 2));

    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData: QPayErrorResponse = await response.json().catch(() => ({
        error: 'Unknown error',
        message: response.statusText,
        status: response.status,
      }));
      
      throw new Error(`QPay API error: ${errorData.message || response.statusText}`);
    }

    return response.json();
  }

  // Create a simple invoice
  async createSimpleInvoice(
    senderInvoiceNo: string,
    amount: number,
    description: string,
    receiverData: {
      name: string;
      email: string;
      phone: string;
    }
  ): Promise<QPayInvoiceResponse> {
    const invoiceRequest: QPaySimpleInvoiceRequest = {
      invoice_code: this.config.invoiceCode,
      sender_invoice_no: senderInvoiceNo,
      invoice_receiver_code: 'terminal', // Default to terminal
      invoice_description: description,
      amount: amount,
      callback_url: this.config.callbackUrl,
    };

    return this.makeAuthenticatedRequest<QPayInvoiceResponse>('/v2/invoice', {
      method: 'POST',
      body: JSON.stringify(invoiceRequest),
    });
  }

  // Create a detailed invoice with line items
  async createDetailedInvoice(
    senderInvoiceNo: string,
    amount: number,
    description: string,
    receiverData: {
      name: string;
      email: string;
      phone: string;
      register?: string;
    },
    lineItems: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      taxCode?: string;
      discountAmount?: number;
      surchargeAmount?: number;
    }>
  ): Promise<QPayInvoiceResponse> {
    const lines = lineItems.map(item => ({
      tax_product_code: '6401', // Default product code
      line_description: item.description,
      line_quantity: item.quantity.toString(),
      line_unit_price: item.unitPrice.toString(),
      note: '',
      discounts: item.discountAmount ? [{
        discount_code: 'NONE',
        description: 'Discount',
        amount: item.discountAmount,
        note: 'Discount applied'
      }] : [],
      surcharges: item.surchargeAmount ? [{
        surcharge_code: 'NONE',
        description: 'Surcharge',
        amount: item.surchargeAmount,
        note: 'Surcharge applied'
      }] : [],
      taxes: item.taxCode ? [{
        tax_code: item.taxCode,
        description: 'Tax',
        amount: (item.quantity * item.unitPrice * 0.1), // 10% VAT
        note: 'VAT'
      }] : []
    }));

    const invoiceRequest: QPayInvoiceRequest = {
      invoice_code: this.config.invoiceCode,
      sender_invoice_no: senderInvoiceNo,
      invoice_receiver_code: '83', // Default receiver code
      invoice_description: description,
      amount: amount,
      callback_url: this.config.callbackUrl,
      invoice_receiver_data: {
        register: receiverData.register,
        name: receiverData.name,
        email: receiverData.email,
        phone: receiverData.phone,
      },
      lines: lines,
    };

    return this.makeAuthenticatedRequest<QPayInvoiceResponse>('/v2/invoice', {
      method: 'POST',
      body: JSON.stringify(invoiceRequest),
    });
  }

  // Check payment status
  async checkPayment(invoiceId: string): Promise<QPayPaymentResponse[]> {
    const checkRequest: QPayPaymentCheckRequest = {
      object_type: 'INVOICE',
      object_id: invoiceId,
      offset: {
        page_number: 1,
        page_limit: 100,
      },
    };

    return this.makeAuthenticatedRequest<QPayPaymentResponse[]>('/v2/payment/check', {
      method: 'POST',
      body: JSON.stringify(checkRequest),
    });
  }

  // Get payment details
  async getPayment(paymentId: string): Promise<QPayPaymentResponse> {
    return this.makeAuthenticatedRequest<QPayPaymentResponse>(`/v2/payment/${paymentId}`, {
      method: 'GET',
    });
  }

  // List payments
  async listPayments(
    objectType: string,
    objectId: string,
    startDate: string,
    endDate: string
  ): Promise<QPayPaymentResponse[]> {
    const listRequest: QPayPaymentListRequest = {
      object_type: objectType,
      object_id: objectId,
      start_date: startDate,
      end_date: endDate,
      offset: {
        page_number: 1,
        page_limit: 1000,
      },
    };

    return this.makeAuthenticatedRequest<QPayPaymentResponse[]>('/v2/payment/list', {
      method: 'POST',
      body: JSON.stringify(listRequest),
    });
  }

  // Cancel invoice
  async cancelInvoice(invoiceId: string): Promise<void> {
    await this.makeAuthenticatedRequest(`/v2/invoice/${invoiceId}`, {
      method: 'DELETE',
    });
  }

  // Cancel payment
  async cancelPayment(
    paymentId: string,
    callbackUrl: string,
    note?: string
  ): Promise<void> {
    await this.makeAuthenticatedRequest(`/v2/payment/cancel/${paymentId}`, {
      method: 'DELETE',
      body: JSON.stringify({
        callback_url: callbackUrl,
        note: note || 'Payment cancelled',
      }),
    });
  }

  // Refund payment
  async refundPayment(paymentId: string): Promise<void> {
    await this.makeAuthenticatedRequest(`/v2/payment/refund/${paymentId}`, {
      method: 'DELETE',
    });
  }

  // Create e-barimt (electronic receipt)
  async createEbarimt(
    paymentId: string,
    receiverType: 'CITIZEN' | 'COMPANY'
  ): Promise<QPayEbarimtResponse> {
    const ebarimtRequest: QPayEbarimtRequest = {
      payment_id: paymentId,
      ebarimt_receiver_type: receiverType,
    };

    return this.makeAuthenticatedRequest<QPayEbarimtResponse>('/v2/ebarimt/create', {
      method: 'POST',
      body: JSON.stringify(ebarimtRequest),
    });
  }
}
