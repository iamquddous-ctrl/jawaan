/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Order, AdminSettings } from '../types';
import { CheckCircle2, Home, MessageSquare, Mail, ShieldCheck, ClipboardCheck } from 'lucide-react';

interface ConfirmationProps {
  order: Order;
  settings: AdminSettings;
  onReturnHome: () => void;
}

export default function Confirmation({ order, settings, onReturnHome }: ConfirmationProps) {
  
  // Format WhatsApp link for optional support inquiry
  const getSupportWhatsappLink = () => {
    const message = `Hello! I have placed an order *#${order.id}* at ${settings.brandName || 'Jawan'} and have some questions. Please assist me! 😊`;
    // Format the number internationally to be extremely safe
    let cleanAdminPhone = settings.storeWhatsapp.replace(/[^0-9]/g, '');
    if (cleanAdminPhone.startsWith('0') && !cleanAdminPhone.startsWith('00')) {
      cleanAdminPhone = '92' + cleanAdminPhone.substring(1);
    } else if (cleanAdminPhone.length === 10 && cleanAdminPhone.startsWith('3')) {
      cleanAdminPhone = '92' + cleanAdminPhone;
    }
    return `https://wa.me/${cleanAdminPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      
      {/* Receipt Card Wrapper */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-10 shadow-lg text-center space-y-6">
        
        {/* Animated Check */}
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 ring-8 ring-emerald-50 mb-2">
          <CheckCircle2 className="h-9 w-9 animate-bounce" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
            Order Placed Successfully!
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Thank you for shopping at <span className="text-[#1B2A4A] font-extrabold">{settings.brandName || 'Jawan'}</span>. Your Order ID is <span className="text-[#E6A11E] font-bold">#{order.id}</span>
          </p>
        </div>

        {/* Automated System Dispatch Pipeline Panel */}
        <div className="bg-[#1B2A4A]/5 border border-[#1B2A4A]/10 rounded-2xl p-5 sm:p-6 text-left space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
            <h3 className="text-xs font-black text-[#1B2A4A] uppercase tracking-wider flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Order Processing Pipeline</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full">
              Status: Active
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Step 1: Database sync */}
            <div className="flex items-start space-x-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mt-0.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="font-extrabold text-slate-800">Order Registered Successfully</p>
                <p className="text-[10px] text-slate-500 font-medium">Your order has been recorded securely in our database. Stock levels are adjusted.</p>
              </div>
            </div>

            {/* Step 2: Automated Email Dispatch */}
            <div className="flex items-start space-x-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mt-0.5">
                <Mail className="h-3.5 w-3.5" />
              </span>
              <div className="flex-1">
                <p className="font-extrabold text-slate-800 flex items-center justify-between">
                  <span>Invoice Email Automatically Dispatched</span>
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  A digital copy of your order invoice has been sent to <span className="font-semibold text-[#1B2A4A] underline">{order.email}</span>
                </p>
              </div>
            </div>

            {/* Step 3: Admin Review Notification */}
            <div className="flex items-start space-x-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 mt-0.5">
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="font-extrabold text-slate-800">Admin Notification Sent</p>
                <p className="text-[10px] text-slate-500 font-medium">
                  The store administrator has been notified. <strong className="text-slate-800">The admin will contact you on WhatsApp or call you shortly</strong> to verify your address and coordinate delivery. No action is required on your part!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* HELP AND OPTIONAL WHATSAPP INTERACTION */}
        <div className="pt-2 text-left bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-[#E6A11E]" />
              Need to ask a question?
            </h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              If you wish to make any changes to your items or shipping details, you can contact our WhatsApp support desk.
            </p>
          </div>
          <a
            href={getSupportWhatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center space-x-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all text-center shrink-0"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Chat with Support</span>
          </a>
        </div>

        <hr className="border-slate-100 my-6" />

        {/* Detailed Item Breakdown Receipt */}
        <div className="text-left space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Order Summary Receipt</h3>
          
          <div className="divide-y divide-slate-100 text-xs">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between py-2.5 text-slate-700">
                <span>
                  {item.productName} (x{item.quantity}) — Size: <strong className="uppercase">{item.size}</strong>, Color: {item.color}
                </span>
                <span className="font-extrabold text-slate-900">Rs. {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-xs text-slate-600 font-medium">
            <div className="flex justify-between">
              <span>Cart Subtotal:</span>
              <span className="font-bold text-slate-900">Rs. {order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Flat Delivery Fee:</span>
              <span className="font-bold text-slate-900">Rs. {order.deliveryCharge.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-900 font-extrabold pt-2 border-t border-slate-200">
              <span>Total Payable (COD):</span>
              <span className="text-[#1B2A4A] font-black">Rs. {order.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Delivery location receipt */}
          <div className="rounded-xl border border-slate-100 p-4 text-xs text-slate-600 space-y-1.5 bg-slate-50/40">
            <p className="font-bold text-slate-800">Dispatch Destination:</p>
            <p>Receiver Name: <strong className="text-slate-950 font-semibold">{order.customerName}</strong></p>
            <p>Contact Details: <strong className="text-slate-950 font-semibold">{order.phone}</strong></p>
            <p>Address: <strong className="text-slate-950 font-semibold">{order.deliveryAddress}, {order.city}</strong></p>
          </div>
        </div>

        {/* Return Home */}
        <div className="pt-4 text-center">
          <button
            onClick={onReturnHome}
            className="inline-flex items-center space-x-1.5 rounded-xl bg-slate-950 hover:bg-[#1B2A4A] text-white px-6 py-3 text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Home className="h-4 w-4" />
            <span>Return to Homepage</span>
          </button>
        </div>

      </div>

    </div>
  );
}
