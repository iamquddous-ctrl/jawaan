/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CartItem, AdminSettings, Order } from '../types';
import { ShieldCheck, Truck, ShoppingBag, ArrowLeft, Send } from 'lucide-react';

interface CheckoutProps {
  cart: CartItem[];
  settings: AdminSettings;
  currentUser: any;
  onPlaceOrder: (orderData: Omit<Order, 'id' | 'date' | 'status'>) => void;
  onBackToCart: () => void;
}

export default function Checkout({
  cart,
  settings,
  currentUser,
  onPlaceOrder,
  onBackToCart
}: CheckoutProps) {
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    phone: currentUser?.phone || '',
    whatsapp: currentUser?.whatsapp || '',
    email: currentUser?.email || '',
    address: '',
    city: settings.areas[0] || 'Karachi',
    area: '',
    notes: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync current user if logged in
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        fullName: currentUser.name,
        phone: currentUser.phone,
        whatsapp: currentUser.whatsapp,
        email: currentUser.email
      }));
    }
  }, [currentUser]);

  const getItemPrice = (product: any) => {
    const hasDiscount = !!(product.discountPercent && product.discountPercent > 0);
    return hasDiscount ? Math.round(product.price * (1 - (product.discountPercent || 0) / 100)) : product.price;
  };

  const subtotal = cart.reduce((total, item) => total + getItemPrice(item.product) * item.quantity, 0);
  const deliveryCharge = settings.deliveryChargeFlat;
  const total = subtotal + deliveryCharge;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);

    // Mock API delay for professional feel
    setTimeout(() => {
      onPlaceOrder({
        customerName: formData.fullName,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        email: formData.email,
        deliveryAddress: formData.address,
        city: formData.city,
        area: formData.area,
        notes: formData.notes,
        items: cart.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          price: getItemPrice(item.product),
          quantity: item.quantity,
          size: item.selectedSize,
          color: item.selectedColor,
          waist: item.selectedWaist,
          image: item.product.images[0]
        })),
        subtotal,
        deliveryCharge,
        total,
        paymentMethod: paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Online Payment (Placeholder)'
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button
        onClick={onBackToCart}
        className="mb-6 flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Cart</span>
      </button>

      <h1 className="text-2xl font-black text-slate-900 mb-8">Checkout Securely</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Delivery Details Form - Left Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
              <Truck className="h-5 w-5 text-[#E6A11E]" />
              <span>Delivery Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g., Sarah Khan"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm placeholder-gray-400 focus:border-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g., +92 300 1234567"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm placeholder-gray-400 focus:border-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  WhatsApp Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  required
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="e.g., +92 300 1234567"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm placeholder-gray-400 focus:border-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Used to send instant order alerts</span>
              </div>

              {/* Email Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g., sarah@gmail.com"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm placeholder-gray-400 focus:border-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Full Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Delivery Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Apartment, Street Name, Block No."
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm placeholder-gray-400 focus:border-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  City <span className="text-rose-500">*</span>
                </label>
                <select
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white focus:border-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                >
                  {settings.areas.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Area / Locality <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="area"
                  required
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="e.g., Clifton, Gulberg, DHA"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm placeholder-gray-400 focus:border-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Order Notes */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Order Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Notes about your delivery, e.g., special instructions for home entry."
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm placeholder-gray-400 focus:border-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                />
              </div>

            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-[#E6A11E]" />
              <span>Payment Method</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Cash on Delivery (COD) */}
              <div 
                onClick={() => setPaymentMethod('COD')}
                className={`relative cursor-pointer rounded-xl border p-4 flex items-center justify-between transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-[#1B2A4A] bg-blue-50/20 shadow-md ring-2 ring-blue-500/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'COD' ? 'border-[#1B2A4A]' : 'border-slate-300'
                  }`}>
                    {paymentMethod === 'COD' && <span className="h-2 w-2 rounded-full bg-[#1B2A4A]" />}
                  </span>
                  <div>
                    <span className="block font-bold text-sm text-slate-900">Cash on Delivery (COD)</span>
                    <span className="block text-xs text-gray-400">Pay cash at your doorstep</span>
                  </div>
                </div>
              </div>

              {/* Online Payment Integration (Placeholder) */}
              <div 
                onClick={() => setPaymentMethod('ONLINE')}
                className={`relative cursor-pointer rounded-xl border p-4 flex items-center justify-between transition-all ${
                  paymentMethod === 'ONLINE'
                    ? 'border-[#1B2A4A] bg-blue-50/20 shadow-md ring-2 ring-blue-500/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'ONLINE' ? 'border-[#1B2A4A]' : 'border-slate-300'
                  }`}>
                    {paymentMethod === 'ONLINE' && <span className="h-2 w-2 rounded-full bg-[#1B2A4A]" />}
                  </span>
                  <div>
                    <span className="block font-bold text-sm text-slate-900">Credit Card / EasyPaisa</span>
                    <span className="block text-xs text-amber-600 font-semibold">Placeholder - coming soon</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Order Summary & Finalize - Right Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-[#E6A11E]" />
              <span>Review Your Order</span>
            </h2>

            {/* Itemized list */}
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-2">
              {cart.map((item) => {
                const colorIndex = item.product.colors.indexOf(item.selectedColor);
                const itemImg = item.product.images[colorIndex] || item.product.images[0];
                return (
                  <div key={item.id} className="flex py-3 first:pt-0 last:pb-0 gap-3">
                    <div className="h-14 w-14 flex-shrink-0 rounded-md border border-slate-100 bg-slate-50 overflow-hidden">
                      <img src={itemImg} alt={item.product.name} className="h-full w-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{item.product.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5 flex flex-wrap gap-x-1.5 items-center">
                        <span>Qty: {item.quantity}</span>
                        <span>//</span>
                        <span>Size: {item.selectedSize}</span>
                        {item.selectedWaist && (
                          <>
                            <span>//</span>
                            <span className="text-amber-800 font-extrabold bg-amber-50 px-1 rounded">Waist: {item.selectedWaist}"</span>
                          </>
                        )}
                        <span>//</span>
                        <span>{item.selectedColor}</span>
                      </p>
                    </div>
                    <span className="font-black text-xs text-[#1B2A4A] shrink-0">
                      Rs. {(getItemPrice(item.product) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>

            <hr className="border-slate-100" />

            {/* Calculations */}
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Cart Subtotal</span>
                <span className="font-bold text-slate-900">Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charges</span>
                <span className="font-bold text-slate-900">Rs. {deliveryCharge.toLocaleString()}</span>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="flex justify-between items-baseline">
              <span className="text-base font-extrabold text-slate-900">Total Payable</span>
              <span className="text-2xl font-black text-[#1B2A4A]">Rs. {total.toLocaleString()}</span>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting || cart.length === 0}
              className={`group flex w-full items-center justify-center space-x-2 rounded-xl py-3 text-sm font-bold text-white shadow-lg transition-all transform active:scale-95 ${
                isSubmitting 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-[#E6A11E] text-slate-950 hover:bg-[#d49015] hover:shadow-xl'
              }`}
            >
              <Send className="h-4 w-4 animate-bounce" />
              <span>{isSubmitting ? 'Processing Order...' : 'Place Order (COD)'}</span>
            </button>

            {/* Trust Badges */}
            <p className="text-[10px] text-center text-slate-400 font-medium">
              By clicking Place Order, you agree to buy items via Cash on Delivery. Order status will be shared instantly via Email and WhatsApp.
            </p>
          </div>
        </div>

      </form>
    </div>
  );
}
