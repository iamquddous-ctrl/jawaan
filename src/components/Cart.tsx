/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CartItem, Product } from '../types';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { colorMap } from '../data';

interface CartProps {
  cart: CartItem[];
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
}

export default function Cart({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onContinueShopping
}: CartProps) {
  const getItemPrice = (product: Product) => {
    const hasDiscount = !!(product.discountPercent && product.discountPercent > 0);
    return hasDiscount ? Math.round(product.price * (1 - (product.discountPercent || 0) / 100)) : product.price;
  };

  const subtotal = cart.reduce((total, item) => total + getItemPrice(item.product) * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-2">Your Shopping Cart is Empty</h2>
        <p className="text-sm text-slate-500 mb-6">
          Looks like you haven&apos;t added any Jawan clothes to your cart yet. Let&apos;s find something cool for the boys!
        </p>
        <button
          onClick={onContinueShopping}
          className="rounded-lg bg-[#1B2A4A] px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-slate-800 transition-all"
        >
          Explore Collection
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-black text-slate-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Cart items list - left column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm">
            <div className="divide-y divide-slate-100">
              {cart.map((item) => {
                const activeColorIndex = item.product.colors.indexOf(item.selectedColor);
                const itemImg = item.product.images[activeColorIndex] || item.product.images[0];
                const itemPrice = getItemPrice(item.product);
                const hasDiscount = !!(item.product.discountPercent && item.product.discountPercent > 0);
                return (
                  <div key={item.id} className="flex flex-col sm:flex-row py-4 first:pt-0 last:pb-0 gap-4">
                    {/* Item Image */}
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
                      <img
                        src={itemImg}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-contain"
                      />
                    </div>

                    {/* Item Info */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between gap-2">
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-900">
                            {item.product.name}
                          </h3>
                          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-slate-500 items-center">
                            <span className="flex items-center gap-1">
                              Size: <strong className="text-slate-800 font-bold uppercase">{item.selectedSize}</strong>
                            </span>
                            {item.selectedWaist && (
                              <span className="flex items-center gap-1">
                                Waist: <strong className="text-amber-800 bg-amber-50 border border-amber-200/50 px-1.5 py-0.5 rounded font-extrabold">{item.selectedWaist}"</strong>
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              Color: 
                              <span 
                                className="h-2.5 w-2.5 rounded-full border border-black/10 inline-block"
                                style={{ backgroundColor: colorMap[item.selectedColor] || '#000' }}
                              />
                              <strong className="text-slate-800 font-bold">{item.selectedColor}</strong>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-[#1B2A4A]">
                            Rs. {(itemPrice * item.quantity).toLocaleString()}
                          </span>
                          <div className="flex flex-col items-end">
                            {hasDiscount ? (
                              <>
                                <span className="text-[10px] text-gray-400 font-medium line-through">
                                  Rs. {item.product.price.toLocaleString()} each
                                </span>
                                <span className="text-[10px] text-emerald-600 font-bold">
                                  Rs. {itemPrice.toLocaleString()} each (-{item.product.discountPercent}%)
                                </span>
                              </>
                            ) : (
                              <p className="text-[10px] text-gray-400 font-medium">
                                Rs. {itemPrice.toLocaleString()} each
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Toggles and Delete */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center rounded-md border border-slate-200">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-2.5 py-1 text-slate-500 hover:text-slate-950 disabled:opacity-30 text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-slate-900 text-xs font-extrabold w-8 text-center select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stockQuantity}
                            className="px-2.5 py-1 text-slate-500 hover:text-slate-950 disabled:opacity-30 text-xs font-bold"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="flex items-center space-x-1.5 text-xs text-rose-500 hover:text-rose-700 font-semibold transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={onContinueShopping}
            className="flex items-center space-x-2 text-sm font-bold text-slate-600 hover:text-slate-950 transition-colors py-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Continue Shopping</span>
          </button>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4">
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Delivery</span>
                <span className="text-emerald-600 font-bold">Calculated next step</span>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="flex justify-between items-baseline">
              <span className="text-base font-extrabold text-slate-900">Total</span>
              <span className="text-2xl font-black text-[#1B2A4A]">Rs. {subtotal.toLocaleString()}</span>
            </div>

            <button
              onClick={onCheckout}
              className="group flex w-full items-center justify-center space-x-2 rounded-xl bg-slate-950 py-3 text-sm font-bold text-white shadow hover:bg-[#1B2A4A] transition-all transform active:scale-95"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
