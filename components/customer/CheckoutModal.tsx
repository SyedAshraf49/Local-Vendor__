import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslations } from '../../hooks/useTranslations';
import { useToast } from '../../context/ToastContext';
import { type Location, type Order, type ProductLocation, type CartItem, type PaymentMethod } from '../../types';
import ThankYouModal from './ThankYouModal';

interface CheckoutModalProps {
  onClose: () => void;
}

const VENDOR_LOCATIONS: Record<ProductLocation, Location> = {
    'royapuram': { lat: 13.1143, lng: 80.2936 },
    't.nagar': { lat: 13.0392, lng: 80.2337 },
    'ashok nagar': { lat: 13.0406, lng: 80.2123 },
    'saidapetu': { lat: 13.0232, lng: 80.2235 }
};

const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose }) => {
  const { cartItems, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { user } = useAuth();
  const t = useTranslations();
  const { addToast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [customerLocation, setCustomerLocation] = useState<Location | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(true);
  const [locationError, setLocationError] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);
  const [fullName, setFullName] = useState(user?.name || '');
  const [address, setAddress] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiMode, setUpiMode] = useState<'qr' | 'id'>('qr');
  const [upiId, setUpiId] = useState('');


  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCustomerLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError('');
        setIsFetchingLocation(false);
      },
      (error) => {
        setLocationError(t.locationFetchFailed);
        console.error("Geolocation error: ", error);
        setIsFetchingLocation(false);
      }
    );
  }, [t.locationFetchFailed]);

  const handlePlaceOrder = () => {
    const hasWhiteChocolate = cartItems.some(item => item.name === 'White Chocolate (100g)');
    const hasDarkChocolate = cartItems.some(item => item.name === 'Dark Chocolate (100g)' || item.name === 'Dark Chocolate (70%)');

    if (hasWhiteChocolate && hasDarkChocolate) {
      addToast("december i found ya", 'success');
    }
    
    if (!user || !fullName.trim() || !address.trim()) return;

    if (paymentMethod === 'card') {
      const cardValid = cardName.trim() && cardNumber.trim() && cardExpiry.trim() && cardCvv.trim();
      if (!cardValid) return;
    }

    if (paymentMethod === 'upi' && upiMode === 'id') {
      const upiIdValid = upiId.trim() && upiId.includes('@');
      if (!upiIdValid) return;
    }

    // Group items by vendor location
    const ordersByVendor = cartItems.reduce<Record<ProductLocation, CartItem[]>>((acc, item) => {
        if (!acc[item.location]) {
            acc[item.location] = [];
        }
        acc[item.location].push(item);
        return acc;
    }, {} as Record<ProductLocation, CartItem[]>);

    // Create a separate order for each vendor
    Object.entries(ordersByVendor).forEach(([location, items]) => {
        const vendorLocationName = location as ProductLocation;
        const vendorLocation = VENDOR_LOCATIONS[vendorLocationName];
        const total = items.reduce((sum, item) => sum + (item.offer ? item.offer.newPrice : item.price) * item.quantity, 0);

        const newOrder: Order = {
            id: `ORD-${Date.now()}-${vendorLocationName.substring(0, 2).toUpperCase()}`,
            items,
            total,
            customerName: fullName,
            customerLocation,
            customerAddress: address,
            vendorLocation,
            vendorLocationName,
          paymentMethod: paymentMethod as PaymentMethod,
          upiMode: paymentMethod === 'upi' ? upiMode : undefined,
          upiId: paymentMethod === 'upi' && upiMode === 'id' ? upiId.trim() : undefined,
            status: 'Order Placed',
            timestamp: new Date(),
        };
        addOrder(newOrder);
    });

    addToast(t.orderPlacedToast, 'success');
    clearCart();
    setShowThankYou(true);
  };
  
  if (showThankYou) {
      return <ThankYouModal onClose={onClose} />;
  }

  const isCardInfoMissing = paymentMethod === 'card'
    && (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim());
  const isUpiInfoMissing = paymentMethod === 'upi' && upiMode === 'id'
    && (!upiId.trim() || !upiId.includes('@'));
  const isOrderButtonDisabled = !address.trim() || !fullName.trim() || cartItems.length === 0 || isCardInfoMissing || isUpiInfoMissing;
  
  const locationStatusText = isFetchingLocation 
    ? t.fetchingLocation 
    : locationError 
    ? locationError 
    : 'Location found!';
    
  const cartTotal = cartItems.reduce((total, item) => {
    const price = item.offer ? item.offer.newPrice : item.price;
    return total + price * item.quantity;
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start sm:items-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md my-4 max-h-[calc(100vh-2rem)] overflow-y-auto animate-scale-in">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t.checkout}</h2>
        
        <div className="space-y-4 mb-6">
            <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.fullName}</label>
                <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
            </div>
             <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.address}</label>
                <textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
            </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">{t.paymentMethod}</h3>
          <div className="space-y-2">
            <label className="flex items-center p-3 border dark:border-gray-600 rounded-md has-[:checked]:bg-indigo-50 dark:has-[:checked]:bg-indigo-900/50 has-[:checked]:border-indigo-500">
              <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="form-radio h-4 w-4 text-indigo-600"/>
              <span className="ml-2 text-gray-700 dark:text-gray-300">{t.cashOnDelivery}</span>
            </label>
            <label className="flex items-center p-3 border dark:border-gray-600 rounded-md has-[:checked]:bg-indigo-50 dark:has-[:checked]:bg-indigo-900/50 has-[:checked]:border-indigo-500">
              <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="form-radio h-4 w-4 text-indigo-600"/>
              <span className="ml-2 text-gray-700 dark:text-gray-300">{t.creditCard}</span>
            </label>
            <label className="flex items-center p-3 border dark:border-gray-600 rounded-md has-[:checked]:bg-indigo-50 dark:has-[:checked]:bg-indigo-900/50 has-[:checked]:border-indigo-500">
              <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="form-radio h-4 w-4 text-indigo-600"/>
              <span className="ml-2 text-gray-700 dark:text-gray-300">{t.upi}</span>
            </label>
          </div>
        </div>

        {paymentMethod === 'card' && (
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.cardholderName}</label>
              <input
                type="text"
                id="cardName"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                placeholder="Alex Johnson"
                autoComplete="cc-name"
              />
            </div>
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.cardNumber}</label>
              <input
                type="text"
                id="cardNumber"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                placeholder="4111 1111 1111 1111"
                inputMode="numeric"
                autoComplete="cc-number"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.cardExpiry}</label>
                <input
                  type="text"
                  id="cardExpiry"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                  placeholder="MM/YY"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                />
              </div>
              <div>
                <label htmlFor="cardCvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.cardCvv}</label>
                <input
                  type="password"
                  id="cardCvv"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                  placeholder="123"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                />
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'upi' && (
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center justify-center p-2 border dark:border-gray-600 rounded-md has-[:checked]:bg-indigo-50 dark:has-[:checked]:bg-indigo-900/50 has-[:checked]:border-indigo-500 cursor-pointer">
                <input
                  type="radio"
                  name="upiMode"
                  value="qr"
                  checked={upiMode === 'qr'}
                  onChange={() => setUpiMode('qr')}
                  className="form-radio h-4 w-4 text-indigo-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t.qrCode}</span>
              </label>
              <label className="flex items-center justify-center p-2 border dark:border-gray-600 rounded-md has-[:checked]:bg-indigo-50 dark:has-[:checked]:bg-indigo-900/50 has-[:checked]:border-indigo-500 cursor-pointer">
                <input
                  type="radio"
                  name="upiMode"
                  value="id"
                  checked={upiMode === 'id'}
                  onChange={() => setUpiMode('id')}
                  className="form-radio h-4 w-4 text-indigo-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t.upiId}</span>
              </label>
            </div>

            {upiMode === 'qr' ? (
              <div className="rounded-md border border-gray-300 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-700/50">
                <div className="mx-auto w-36 h-36 bg-white p-2 rounded-md border border-gray-200">
                  <svg viewBox="0 0 100 100" className="w-full h-full" aria-label="UPI QR Code">
                    <rect width="100" height="100" fill="white" />
                    <rect x="4" y="4" width="24" height="24" fill="black" />
                    <rect x="8" y="8" width="16" height="16" fill="white" />
                    <rect x="12" y="12" width="8" height="8" fill="black" />
                    <rect x="72" y="4" width="24" height="24" fill="black" />
                    <rect x="76" y="8" width="16" height="16" fill="white" />
                    <rect x="80" y="12" width="8" height="8" fill="black" />
                    <rect x="4" y="72" width="24" height="24" fill="black" />
                    <rect x="8" y="76" width="16" height="16" fill="white" />
                    <rect x="12" y="80" width="8" height="8" fill="black" />
                    <rect x="36" y="8" width="8" height="8" fill="black" />
                    <rect x="48" y="8" width="8" height="8" fill="black" />
                    <rect x="60" y="8" width="8" height="8" fill="black" />
                    <rect x="36" y="20" width="8" height="8" fill="black" />
                    <rect x="52" y="20" width="8" height="8" fill="black" />
                    <rect x="64" y="20" width="8" height="8" fill="black" />
                    <rect x="36" y="36" width="8" height="8" fill="black" />
                    <rect x="48" y="36" width="8" height="8" fill="black" />
                    <rect x="60" y="36" width="8" height="8" fill="black" />
                    <rect x="72" y="36" width="8" height="8" fill="black" />
                    <rect x="84" y="36" width="8" height="8" fill="black" />
                    <rect x="36" y="48" width="8" height="8" fill="black" />
                    <rect x="52" y="48" width="8" height="8" fill="black" />
                    <rect x="68" y="48" width="8" height="8" fill="black" />
                    <rect x="84" y="48" width="8" height="8" fill="black" />
                    <rect x="36" y="60" width="8" height="8" fill="black" />
                    <rect x="48" y="60" width="8" height="8" fill="black" />
                    <rect x="64" y="60" width="8" height="8" fill="black" />
                    <rect x="76" y="60" width="8" height="8" fill="black" />
                    <rect x="88" y="60" width="8" height="8" fill="black" />
                    <rect x="36" y="72" width="8" height="8" fill="black" />
                    <rect x="52" y="72" width="8" height="8" fill="black" />
                    <rect x="68" y="72" width="8" height="8" fill="black" />
                    <rect x="84" y="72" width="8" height="8" fill="black" />
                    <rect x="40" y="84" width="8" height="8" fill="black" />
                    <rect x="56" y="84" width="8" height="8" fill="black" />
                    <rect x="72" y="84" width="8" height="8" fill="black" />
                  </svg>
                </div>
                <p className="mt-3 text-center text-sm text-gray-600 dark:text-gray-300">{t.upiQrHint}</p>
              </div>
            ) : (
              <div>
                <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.upiId}</label>
                <input
                  type="text"
                  id="upiId"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                  placeholder={t.upiIdPlaceholder}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t.upiIdHint}</p>
              </div>
            )}
          </div>
        )}

        <div className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4 h-5">
            {locationStatusText}
        </div>
        
        <div className="flex justify-between items-center font-bold text-xl mb-2">
            <span className="text-gray-800 dark:text-gray-200">{t.total}:</span>
            <span className="text-indigo-600 dark:text-indigo-400">₹{cartTotal.toFixed(2)}</span>
        </div>

        <div className="flex gap-4 mt-6">
          <button onClick={onClose} className="w-full bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 py-2 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-gray-500">
            {t.close}
          </button>
          <button onClick={handlePlaceOrder} disabled={isOrderButtonDisabled} className="w-full bg-indigo-600 text-white py-2 rounded-md font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
            {t.placeOrder}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;