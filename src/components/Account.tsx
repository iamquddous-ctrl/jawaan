/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Order } from '../types';
import { LogOut, ClipboardList, UserCheck, ShieldAlert, KeyRound, Phone, Mail, ShoppingBag } from 'lucide-react';

interface AccountProps {
  currentUser: User | null;
  orders: Order[];
  onLogin: (user: User) => void;
  onLogout: () => void;
  onRegister: (user: User) => void;
}

export default function Account({
  currentUser,
  orders,
  onLogin,
  onLogout,
  onRegister
}: AccountProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Fetch users from local storage
  const getUsers = (): User[] => {
    const stored = localStorage.getItem('jawan_users');
    return stored ? JSON.parse(stored) : [];
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const users = getUsers();

    if (isSignUp) {
      // Validate unique email
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        setErrorMsg('An account with this email already exists.');
        return;
      }

      const newUser: User = { email, name, phone, whatsapp, password };
      users.push(newUser);
      localStorage.setItem('jawan_users', JSON.stringify(users));
      onRegister(newUser);
      
      // Clean up fields
      setName('');
      setPhone('');
      setWhatsapp('');
      setPassword('');
    } else {
      // Login validation
      const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (matched) {
        onLogin(matched);
        setPassword('');
      } else {
        setErrorMsg('Invalid email or password. Please try again.');
      }
    }
  };

  // Filter orders matching logged-in user's email or phone number
  const userOrders = currentUser
    ? orders.filter(o => o.email.toLowerCase() === currentUser.email.toLowerCase() || o.phone === currentUser.phone)
    : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (currentUser) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 shadow-sm p-6 rounded-2xl gap-4">
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1B2A4A]">
              <UserCheck className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Customer Portal</p>
              <h2 className="text-2xl font-black text-slate-900">Welcome, {currentUser.name}</h2>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-1.5 rounded-lg border border-rose-200 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Account Details & Orders Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Contact Detail Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                Account Information
              </h3>
              <div className="space-y-3.5 text-sm text-slate-600">
                <div className="flex items-center space-x-2.5">
                  <Mail className="h-4.5 w-4.5 text-[#E6A11E]" />
                  <span>{currentUser.email}</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Phone className="h-4.5 w-4.5 text-[#E6A11E]" />
                  <span>{currentUser.phone}</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  {/* WhatsApp Indicator */}
                  <span className="h-4.5 w-4.5 flex items-center justify-center font-black text-[#E6A11E]">W</span>
                  <span>WhatsApp: {currentUser.whatsapp}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order History */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
                <ClipboardList className="h-5 w-5 text-[#E6A11E]" />
                <span>My Orders ({userOrders.length})</span>
              </h3>

              {userOrders.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-3">
                  <ShoppingBag className="h-10 w-10 mx-auto text-slate-300" />
                  <p className="text-sm font-semibold text-slate-500">You haven&apos;t placed any orders yet.</p>
                </div>
              ) : (
                <div className="mt-4 divide-y divide-slate-100">
                  {userOrders.map((order) => (
                    <div key={order.id} className="py-5 first:pt-0 last:pb-0 space-y-4">
                      
                      {/* Order Metadata Row */}
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div>
                          <p className="text-xs font-bold text-[#1B2A4A]">Order ID: #{order.id}</p>
                          <p className="text-[11px] text-gray-400 font-medium">Placed on: {new Date(order.date).toLocaleDateString()}</p>
                        </div>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>

                      {/* Items Row */}
                      <div className="space-y-2 pl-3 border-l-2 border-slate-100">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs text-slate-600">
                            <span>
                              {it.productName} (x{it.quantity}) - Size: <strong className="uppercase">{it.size}</strong>, Color: {it.color}
                            </span>
                            <span className="font-bold text-slate-900">Rs. {(it.price * it.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      {/* Summary Calculation */}
                      <div className="flex justify-between text-xs font-bold text-slate-700 bg-slate-50 p-2.5 rounded-lg">
                        <span>Includes Flat Delivery Charge: Rs. {order.deliveryCharge.toLocaleString()}</span>
                        <span className="text-sm text-[#1B2A4A] font-black">Total Paid: Rs. {order.total.toLocaleString()}</span>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-md space-y-6">
        
        {/* Portal Header */}
        <div className="text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1B2A4A]/5 text-[#1B2A4A] mb-3">
            <KeyRound className="h-6 w-6" />
          </span>
          <h2 className="text-2xl font-black text-slate-900">
            {isSignUp ? 'Create Customer Account' : 'Customer Sign In'}
          </h2>
          <p className="text-xs text-gray-400 font-medium mt-1">
            Access order logs and real-time shipping alerts.
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center space-x-2 rounded-lg bg-rose-50 border border-rose-100 p-3 text-xs text-rose-600">
            <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
            <p className="font-semibold">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          
          {isSignUp && (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Sarah Khan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm placeholder-gray-400 focus:border-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g., +92 300 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm placeholder-gray-400 focus:border-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">WhatsApp Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g., +92 300 1234567"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm placeholder-gray-400 focus:border-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g., customer@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm placeholder-gray-400 focus:border-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm placeholder-gray-400 focus:border-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="w-full rounded-lg bg-[#1B2A4A] py-2.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-all"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="h-px bg-slate-100 my-4" />

        {/* Toggle Mode Link */}
        <p className="text-center text-xs text-slate-500 font-medium">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
            }}
            className="text-[#E6A11E] font-bold hover:underline ml-1"
          >
            {isSignUp ? 'Sign In' : 'Sign Up Here'}
          </button>
        </p>

      </div>
    </div>
  );
}
