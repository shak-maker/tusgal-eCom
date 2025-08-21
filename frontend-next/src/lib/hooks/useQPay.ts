import { useState, useCallback } from 'react';

interface QPayPaymentData {
  invoiceId: string;
  invoiceCode: string;
  amount: number;
  status: string;
  qrCodeUrl: string;
  paymentUrl: string;
}

interface QPayPaymentStatus {
  status: string;
  paymentId?: string;
  amount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface UseQPayReturn {
  createInvoice: (customerData: {
    name: string;
    email: string;
    phone: string;
  }) => Promise<QPayPaymentData | null>;
  checkPaymentStatus: (invoiceId: string) => Promise<QPayPaymentStatus | null>;
  isLoading: boolean;
  error: string | null;
  paymentData: QPayPaymentData | null;
  clearError: () => void;
}

export const useQPay = (cartItems: Array<{
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
  quantity: number;
}> = []): UseQPayReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<QPayPaymentData | null>(null);

  const createInvoice = useCallback(async (customerData: {
    name: string;
    email: string;
    phone: string;
  }): Promise<QPayPaymentData | null> => {
    if (cartItems.length === 0) {
      setError('Cart is empty');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      
      const response = await fetch('/api/qpay/create-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems: cartItems,
          customerData,
          totalAmount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create invoice');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setPaymentData(result.data);
        return result.data;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create invoice';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [cartItems]);

  const checkPaymentStatus = useCallback(async (invoiceId: string): Promise<QPayPaymentStatus | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/qpay/check-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check payment status');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Payment status checked successfully
        
        return result.data;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check payment status';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createInvoice,
    checkPaymentStatus,
    isLoading,
    error,
    paymentData,
    clearError,
  };
};
