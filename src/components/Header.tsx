/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, ShoppingBag, User, Menu, X, LayoutDashboard } from 'lucide-react';
import { Category } from '../types';

interface HeaderProps {
  cartCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNavigate: (view: 'home' | 'category' | 'cart' | 'account' | 'admin', category?: Category) => void;
  currentView: string;
  selectedCategory: Category | 'All';
  currentUser: any;
  onLogout: () => void;
  isAdminMode: boolean;
  brandName?: string;
  tagline?: string;
}

export default function Header({
  cartCount,
  searchQuery,
  setSearchQuery,
  onNavigate,
  currentView,
  selectedCategory,
  currentUser,
  onLogout,
  isAdminMode,
  brandName,
  tagline
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories: (Category | 'All')[] = ['All', 'Shirts', 'Trousers', 'Pants'];

  const handleCategoryClick = (cat: Category | 'All') => {
    setMobileMenuOpen(false);
    if (cat === 'All') {
      onNavigate('home');
    } else {
      onNavigate('category', cat);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-md text-white border-b border-white/5 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between gap-4">
          
          {/* Logo */}
          <div 
            onClick={() => onNavigate('home')} 
            className="flex cursor-pointer items-center space-x-2 group"
          >
            <div className="flex flex-col justify-center">
              <span className="text-2xl font-black tracking-wider text-white leading-none uppercase font-display group-hover:text-amber-400 transition-colors">
                {brandName || 'JAWAN'}
              </span>
              {tagline && (
                <span className="hidden text-[8px] font-black tracking-widest text-amber-400 uppercase sm:block mt-1 opacity-90">
                  {tagline}
                </span>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 text-xs font-bold uppercase tracking-wider">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`transition-all duration-300 py-1.5 border-b-2 hover:text-amber-400 cursor-pointer ${
                  (currentView === 'home' && cat === 'All') || 
                  (currentView === 'category' && selectedCategory === cat)
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-xs sm:max-w-md hidden sm:block">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search shirts, cargo pants, joggers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/5 py-2 pl-11 pr-4 text-xs text-white placeholder-slate-400 focus:bg-white focus:text-slate-900 focus:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-300"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Search toggler for mobile screen */}
            <div className="block sm:hidden relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-24 rounded-lg bg-white/5 border border-white/5 py-1.5 pl-8 pr-2 text-xs text-white focus:w-36 focus:bg-white focus:text-slate-900 focus:outline-none transition-all duration-300"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Admin Badge Indicator */}
            {isAdminMode && (
              <button 
                onClick={() => onNavigate('admin')}
                className="hidden md:flex items-center space-x-1.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider hover:bg-amber-400/20 active:scale-95 cursor-pointer"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Admin View</span>
              </button>
            )}

            {/* Account Icon */}
            <button
              onClick={() => onNavigate('account')}
              className={`rounded-xl p-2 transition-all hover:bg-white/5 cursor-pointer ${
                currentView === 'account' ? 'text-amber-400 bg-white/5' : 'text-slate-300'
              }`}
              title="My Account / Orders"
            >
              <User className="h-5 w-5" />
            </button>

            {/* Cart Icon */}
            <button
              onClick={() => onNavigate('cart')}
              className={`relative rounded-full p-2 transition-colors hover:bg-white/10 ${
                currentView === 'cart' ? 'text-[#E6A11E]' : 'text-gray-200'
              }`}
              title="Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#E6A11E] text-xs font-bold text-white ring-2 ring-[#1B2A4A] animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-full p-2 hover:bg-white/10 md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#152039] px-4 py-4 space-y-3 shadow-inner">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-[#E6A11E] uppercase tracking-wider px-3 mb-1">
              Shop Categories
            </p>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${
                  (currentView === 'home' && cat === 'All') || 
                  (currentView === 'category' && selectedCategory === cat)
                    ? 'bg-[#E6A11E] text-white'
                    : 'text-gray-300 hover:bg-[#1B2A4A]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="h-px bg-white/10 my-2" />

          {isAdminMode && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('admin');
              }}
              className="flex w-full items-center space-x-2 px-3 py-2 rounded text-sm font-medium text-[#E6A11E] bg-[#E6A11E]/10 hover:bg-[#E6A11E]/20"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Admin Panel</span>
            </button>
          )}

          <div className="flex justify-between items-center px-3 text-xs text-gray-400">
            <span>Welcome, {currentUser ? currentUser.name : 'Guest'}</span>
            {currentUser && (
              <button onClick={onLogout} className="text-[#E6A11E] font-medium hover:underline">
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
