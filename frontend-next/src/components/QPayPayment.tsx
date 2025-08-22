'use client';

import React, { useState, useEffect } from 'react';
import { useQPay } from '@/lib/hooks/useQPay';
import QRCode from 'qrcode';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QPayPaymentProps {
  onPaymentSuccess?: (paymentData: any) => void;
  onPaymentError?: (error: string) => void;
  className?: string;
  cartItems?: Array<{
    id: string;
    product: {
      id: string;
      name: string;
      price: number;
      imageUrl: string;
    };
    quantity: number;
  }>;
  customerData?: {
    name: string;
    email: string;
    phone: string;
  };
}

export const QPayPayment: React.FC<QPayPaymentProps> = ({
  onPaymentSuccess,
  onPaymentError,
  className = '',
  cartItems = [],
  customerData: propCustomerData,
}) => {
  const [customerData, setCustomerData] = useState({
    name: propCustomerData?.name || '',
    email: propCustomerData?.email || '',
    phone: propCustomerData?.phone || '',
  });
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'qr' | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | null>(null);

  const {
    createInvoice,
    checkPaymentStatus,
    isLoading,
    error,
    paymentData,
    clearError,
  } = useQPay(cartItems);

  // Use cartItems prop for total calculation

  // Handle payment success - only when payment is actually completed
  useEffect(() => {
    if (paymentData && onPaymentSuccess) {
      // Don't call onPaymentSuccess immediately when invoice is created
      // Only call it when payment status is actually PAID
      // This will be handled by the polling mechanism
    }
  }, [paymentData, onPaymentSuccess]);

  // Handle errors
  useEffect(() => {
    if (error && onPaymentError) {
      onPaymentError(error);
    }
  }, [error, onPaymentError]);

  // Start polling for payment status when invoice is created
  useEffect(() => {
    if (paymentData?.invoiceId) {
      setPaymentStatus('pending');
      const interval = setInterval(async () => {
        const status = await checkPaymentStatus(paymentData.invoiceId);
        if (status?.status === 'PAID') {
          clearInterval(interval);
          setPollingInterval(null);
          setPaymentStatus('completed');
          // Call onPaymentSuccess only when payment is actually completed
          if (onPaymentSuccess) {
            onPaymentSuccess({
              ...paymentData,
              paymentId: status.paymentId,
              status: status.status
            });
          }
        }
      }, 5000); // Check every 5 seconds

      setPollingInterval(interval as unknown as number);

      return () => {
        clearInterval(interval);
        setPollingInterval(null);
      };
    }
  }, [paymentData?.invoiceId, checkPaymentStatus, onPaymentSuccess]);

  // Generate QR code automatically when payment options are shown
  useEffect(() => {
    if (showPaymentOptions && paymentData?.invoiceId) {
      generateQRCode();
    }
  }, [showPaymentOptions, paymentData?.invoiceId]);

  const generateQRCode = async () => {
    if (!paymentData?.invoiceId) return;
    
    try {
      // Use QPay's official QR code URL if available
      if (paymentData.qrCodeUrl) {
        setQrCodeDataUrl(paymentData.qrCodeUrl);
        console.log('Using QPay QR code URL:', paymentData.qrCodeUrl);
        return;
      }
      
      // Fallback: Generate QR code with payment information
      const qrData = {
        invoiceId: paymentData.invoiceId,
        invoiceCode: paymentData.invoiceCode,
        amount: paymentData.amount,
        merchantId: 'TUSGAL_OPTIC'
      };
      
      const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeDataUrl(qrDataUrl);
      console.log('QR code generated successfully');
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      setQrCodeDataUrl('');
    }
  };

  // Update customer data when prop changes
  useEffect(() => {
    if (propCustomerData) {
      setCustomerData({
        name: propCustomerData.name || '',
        email: propCustomerData.email || '',
        phone: propCustomerData.phone || '',
      });
    }
  }, [propCustomerData]);

  const handleInputChange = (field: keyof typeof customerData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomerData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!customerData.name.trim()) {
      errors.name = 'Нэрээ оруулна уу';
    }
    
    if (!customerData.email.trim()) {
      errors.email = 'Имэйл хаягаа оруулна уу';
    } else if (!/\S+@\S+\.\S+/.test(customerData.email)) {
      errors.email = 'Зөв имэйл хаяг оруулна уу';
    }
    
    if (!customerData.phone.trim()) {
      errors.phone = 'Утасны дугаараа оруулна уу';
    } else if (!/^\d{8}$/.test(customerData.phone)) {
      errors.phone = '8 оронтой утасны дугаар оруулна уу';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateInvoice = async () => {
    // If customer data is provided via props, use it directly
    if (propCustomerData) {
      const result = await createInvoice(propCustomerData);
      if (result) {
        setShowPaymentOptions(true);
        setValidationErrors({});
      }
      return;
    }

    // Otherwise validate the form
    if (!validateForm()) {
      return;
    }

    const result = await createInvoice(customerData);
    if (result) {
      setShowPaymentOptions(true);
      setValidationErrors({});
    }
  };

  const handlePaymentMethodSelect = (method: 'qr') => {
    if (!paymentData) return;

    if (method === 'qr') {
      // Show QR code inline
      setSelectedPaymentMethod('qr');
    }
  };

  const handleCancelPayment = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setShowPaymentOptions(false);
    setSelectedPaymentMethod(null);
    setQrCodeDataUrl('');
    setPaymentStatus(null);
    // Reset the component state
    clearError();
  };

  // Don't render if no cart items
  if (cartItems.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card>
          <CardHeader>
            <CardTitle>Сагс хоосон</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Төлбөр хийхийн тулд сагсандаа бараа нэмнэ үү.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img 
              src="/qpay-logo.png" 
              alt="QPay" 
              className="w-6 h-6"
              onError={(e) => {
                // Fallback if logo doesn't exist
                e.currentTarget.style.display = 'none';
              }}
            />
            QPay QR Төлбөр
          </CardTitle>
          {/* Display cart total */}
          <div className="mt-2 text-sm text-gray-600">
            <p>Сагсны нийт дүн: <span className="font-semibold text-lg text-green-600">₮{cartItems.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0).toLocaleString()}</span></p>
            <p className="text-xs text-gray-500 mt-1">* Үнэ автоматаар тооцоологдсон</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showPaymentOptions ? (
            // Customer Information Form - Only show if no customer data provided
            propCustomerData ? (
              // Customer data already provided, show summary and proceed button
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Захиалгын мэдээлэл</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Нэр:</span> {propCustomerData.name}</p>
                    <p><span className="font-medium">Имэйл:</span> {propCustomerData.email}</p>
                    <p><span className="font-medium">Утас:</span> {propCustomerData.phone}</p>
                  </div>
                </div>
                
                <Button
                  onClick={handleCreateInvoice}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Нэхэмжлэл үүсгэж байна...' : 'Төлбөр хийх'}
                </Button>
              </div>
            ) : (
              // Show customer form if no data provided
              <div className="space-y-3">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Бүтэн нэр *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={customerData.name}
                    onChange={handleInputChange('name')}
                    placeholder="Нэрээ оруулна уу"
                    required
                    className={validationErrors.name ? 'border-red-500' : ''}
                  />
                  {validationErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Имэйл *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={customerData.email}
                    onChange={handleInputChange('email')}
                    placeholder="Имэйл хаягаа оруулна уу"
                    required
                    className={validationErrors.email ? 'border-red-500' : ''}
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">
                    Утасны дугаар *
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerData.phone}
                    onChange={handleInputChange('phone')}
                    placeholder="Утасны дугаараа оруулна уу"
                    required
                    className={validationErrors.phone ? 'border-red-500' : ''}
                  />
                  {validationErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                  )}
                </div>

                <Button
                  onClick={handleCreateInvoice}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Нэхэмжлэл үүсгэж байна...' : 'Төлбөр хийх'}
                </Button>
              </div>
            )
          ) : (
            // Payment Options
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">QR Код</h3>
                {paymentStatus === 'completed' ? (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm font-medium">
                      ✅ Төлбөр амжилттай! Таны захиалга баталгаажлаа.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 mb-4">
                    Нэхэмжлэл амжилттай үүслээ! QR кодыг уншуулан төлбөрөө хийнэ үү:
                  </p>
                )}
              </div>

              <div className="text-center">
                <div className="h-20 w-full max-w-xs flex flex-col items-center justify-center text-lg mx-auto bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-3xl mb-2">📱</div>
                  <span className="text-base font-medium text-gray-600">QR Код доор байна</span>
                </div>
              </div>

              <div className="text-center text-sm text-gray-600">
                <p>Нэхэмжлэлийн дугаар: {paymentData?.invoiceCode || 'Уншиж байна...'}</p>
                <p>Дүн: ₮{paymentData?.amount ? paymentData.amount.toLocaleString() : cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toLocaleString()}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCancelPayment}
                  variant="outline"
                  className="flex-1"
                >
                  Цуцлах
                </Button>
                <Button
                  onClick={() => paymentData?.invoiceId && checkPaymentStatus(paymentData.invoiceId)}
                  disabled={isLoading || !paymentData?.invoiceId}
                  className="flex-1"
                >
                  {isLoading ? 'Шалгаж байна...' : 'Төлөв шалгах'}
                </Button>
              </div>
            </div>
          )}

          {/* QR Code Display */}
          {showPaymentOptions && paymentData && (
            <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">QR Код</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Утасныхаа камерыг ашиглан QR кодыг уншуулна уу
                </p>
                <p className="text-xs text-blue-600 mb-4">
                  📱 Утасныхаа камерыг ашиглан QR кодыг уншуулна уу
                </p>
                
                {/* QR Code Image */}
                <div className="bg-white p-4 rounded-lg inline-block mb-4">
                  {qrCodeDataUrl ? (
                    qrCodeDataUrl.startsWith('data:') ? (
                      <img 
                        src={qrCodeDataUrl}
                        alt="QPay QR Code"
                        className="w-48 h-48 mx-auto"
                      />
                    ) : (
                      <img 
                        src={qrCodeDataUrl}
                        alt="QPay QR Code"
                        className="w-48 h-48 mx-auto"
                        onError={(e) => {
                          console.error('Failed to load QR code image:', e);
                          // Fallback to generating QR code locally
                          generateQRCode();
                        }}
                      />
                    )
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded">
                      <div className="text-center text-gray-500">
                        <div className="text-2xl mb-2">⏳</div>
                        <p className="text-xs">QR код үүсгэж байна...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Нэхэмжлэлийн дугаар: <span className="font-mono">{paymentData.invoiceCode || 'Уншиж байна...'}</span></p>
                  <p>Дүн: <span className="font-semibold">₮{paymentData.amount ? paymentData.amount.toLocaleString() : cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toLocaleString()}</span></p>
                </div>
                

              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
              <Button
                onClick={clearError}
                variant="ghost"
                size="sm"
                className="mt-2 text-red-600 hover:text-red-700"
              >
                Хаах
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
