'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQPay } from '@/lib/hooks/useQPay';
import QRCode from 'qrcode';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';

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
    pdCm?: number;
    lensInfo?: any;
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
    pdCm: propCustomerData?.pdCm,
    lensInfo: propCustomerData?.lensInfo,
  });
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>('PENDING');
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [pollingCount, setPollingCount] = useState(0);
  const [confirmedPaymentId, setConfirmedPaymentId] = useState<string>('');
  const MAX_POLLING_ATTEMPTS = 60; // 5 minutes (60 * 5 seconds)
  
  // Use ref to track current interval for proper cleanup
  const currentIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    createInvoice,
    isLoading,
    error,
    paymentData,
    clearError,
  } = useQPay(cartItems);

  // Payment polling mechanism
  const startPaymentPolling = useRef((invoiceId: string) => {
    console.log('🔄 Starting payment polling for invoice:', invoiceId);
    setPollingCount(0);
    
    // Clear any existing interval first
    if (currentIntervalRef.current) {
      clearInterval(currentIntervalRef.current);
    }
    
    const interval = setInterval(async () => {
      try {
        setPollingCount(prev => prev + 1);
        console.log(`🔍 Checking payment status for invoice: ${invoiceId} (attempt ${pollingCount + 1}/${MAX_POLLING_ATTEMPTS})`);
        
        // Check if we've exceeded max polling attempts
        if (pollingCount >= MAX_POLLING_ATTEMPTS) {
          console.log('⏰ Max polling attempts reached, stopping polling');
          clearInterval(interval);
          currentIntervalRef.current = null;
          setPollingInterval(null);
          setPaymentProcessing(false);
          setPaymentStatus('TIMEOUT');
          if (onPaymentError) {
            onPaymentError('Payment timeout - please try again');
          }
          return;
        }
        
        const response = await fetch(`/api/qpay/callback?invoice_id=${invoiceId}`);
        const result = await response.json();
        
        console.log('📊 Payment status check result:', result);
        
        if (result.success) {
          console.log('🔍 Checking payment status:', result.status);
          
          if (result.status === 'PAID') {
            console.log('✅ Payment confirmed! Stopping polling.');
            setPaymentStatus('PAID');
            setPaymentProcessing(false);
            
            // Clear polling interval using the current interval reference
            clearInterval(interval);
            currentIntervalRef.current = null;
            setPollingInterval(null);
            
            // Trigger payment success
            if (onPaymentSuccess && paymentData) {
              setConfirmedPaymentId(result.paymentId || 'unknown');
              onPaymentSuccess({
                ...paymentData,
                paymentId: result.paymentId || 'unknown',
                status: 'PAID'
              });
            }
          } else if (result.status === 'FAILED') {
            console.log('❌ Payment failed! Stopping polling.');
            setPaymentStatus('FAILED');
            setPaymentProcessing(false);
            
            // Clear polling interval using the current interval reference
            clearInterval(interval);
            currentIntervalRef.current = null;
            setPollingInterval(null);
            
            if (onPaymentError) {
              onPaymentError('Payment failed');
            }
          } else {
            console.log('⏳ Payment still pending, status:', result.status);
          }
        } else {
          console.log('❌ Payment check failed:', result.error);
        }
      } catch (error) {
        console.error('❌ Error checking payment status:', error);
      }
    }, 5000); // Check every 5 seconds
    
    // Store the interval reference
    currentIntervalRef.current = interval;
    setPollingInterval(interval);
  });

  // Stop polling when component unmounts or payment is completed
  useEffect(() => {
    return () => {
      if (currentIntervalRef.current) {
        clearInterval(currentIntervalRef.current);
        currentIntervalRef.current = null;
      }
    };
  }, []);

  // Start polling when payment options are shown
  useEffect(() => {
    if (showPaymentOptions && paymentData?.invoiceId && !pollingInterval && paymentStatus !== 'PAID') {
      startPaymentPolling.current(paymentData.invoiceId);
    }
  }, [showPaymentOptions, paymentData?.invoiceId, pollingInterval, paymentStatus]);

  // Use cartItems prop for total calculation

  // Handle payment success - only when payment is actually completed
  useEffect(() => {
    if (paymentData && onPaymentSuccess && paymentStatus === 'PAID') {
      // Payment success is now handled by the polling mechanism
    }
  }, [paymentData, onPaymentSuccess, paymentStatus]);

  // Start payment processing animation when QR code is shown
  useEffect(() => {
    if (showPaymentOptions && paymentData) {
      setPaymentProcessing(true);
    }
  }, [showPaymentOptions, paymentData]);

  // Handle errors
  useEffect(() => {
    if (error && onPaymentError) {
      onPaymentError(error);
    }
  }, [error, onPaymentError]);



  // Generate QR code automatically when payment options are shown
  useEffect(() => {
    console.log('QR Code useEffect triggered:', {
      showPaymentOptions,
      invoiceId: paymentData?.invoiceId,
      paymentData: paymentData
    });
    
    if (showPaymentOptions && paymentData?.invoiceId) {
      console.log('Generating QR code...');
      generateQRCode();
    } else {
      console.log('QR Code generation skipped:', {
        showPaymentOptions,
        hasInvoiceId: !!paymentData?.invoiceId,
        paymentDataKeys: paymentData ? Object.keys(paymentData) : 'No paymentData'
      });
    }
  }, [showPaymentOptions, paymentData?.invoiceId, paymentData?.qrImage]);

  const generateQRCode = async () => {
    console.log('generateQRCode called with paymentData:', paymentData);
    
    if (!paymentData?.invoiceId) {
      console.log('No invoiceId found, cannot generate QR code');
      return;
    }
    
    try {
      // Use QPay's pre-generated QR image if available
      if (paymentData.qrImage) {
        console.log('Using QPay pre-generated QR image');
        setQrCodeDataUrl(`data:image/png;base64,${paymentData.qrImage}`);
        return;
      }

      // Fallback: Generate QR code using qrcode library
      console.log('Generating QR code locally using qrcode library');
      
      // Generate QR code with payment information
      const qrData = {
        invoiceId: paymentData.invoiceId,
        invoiceCode: paymentData.invoiceCode,
        amount: paymentData.amount,
        merchantId: 'TUSGAL_OPTIC',
        timestamp: new Date().toISOString()
      };
      
      console.log('QR data to encode:', qrData);
      
      const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeDataUrl(qrDataUrl);
      console.log('QR code generated successfully, data URL length:', qrCodeDataUrl.length);
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
        pdCm: propCustomerData.pdCm,
        lensInfo: propCustomerData.lensInfo,
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
      console.log('Creating invoice with prop customer data:', propCustomerData);
      const result = await createInvoice(propCustomerData);
      console.log('Invoice creation result:', result);
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



  const handleCancelPayment = () => {
    setShowPaymentOptions(false);
    setQrCodeDataUrl('');
    setPaymentProcessing(false);
    setPaymentStatus('PENDING');
    
    // Stop polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    
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
                <p className="text-sm text-gray-600 mb-4">
                  Нэхэмжлэл амжилттай үүслээ! QR кодыг уншуулан төлбөрөө хийнэ үү:
                </p>
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
                  {(() => { console.log('QR Code Display - qrCodeDataUrl:', qrCodeDataUrl); return null; })()}
                  {qrCodeDataUrl ? (
                    <img 
                      src={qrCodeDataUrl}
                      alt="QPay QR Code"
                      className="w-48 h-48 mx-auto"
                      onLoad={() => console.log('QR code image loaded successfully')}
                      onError={(e) => {
                        console.error('QR code image failed to load:', e);
                        setQrCodeDataUrl('');
                      }}
                    />
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

                {/* Payment Processing Animation */}
                {paymentProcessing && paymentStatus !== 'PAID' && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex flex-col items-center gap-3">
                      <Loading size="md" color="blue" text={`Төлбөр хүлээж байна... (${paymentStatus})`} />
                      <p className="text-xs text-blue-600 text-center">
                        QR кодыг уншуулсны дараа төлбөр автоматаар шалгагдана
                      </p>
                      <p className="text-xs text-gray-500 text-center">
                        Төлбөрийн төлөв: {paymentStatus}
                      </p>
                    </div>
                  </div>
                )}

                {/* Payment Success Message */}
                {paymentStatus === 'PAID' && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex flex-col items-center gap-3">
                      <div className="text-3xl">✅</div>
                      <h3 className="text-lg font-semibold text-green-800">Төлбөр амжилттай!</h3>
                      <p className="text-sm text-green-700 text-center">
                        Таны төлбөр амжилттай хүлээн авлаа. Захиалга баталгаажлаа.
                      </p>
                      <p className="text-xs text-green-600 text-center">
                        Төлбөрийн дугаар: {confirmedPaymentId || 'Unknown'}
                      </p>
                    </div>
                  </div>
                )}
                

                

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
// QR code debugging enabled
