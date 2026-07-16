/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { ArrowLeft, ShoppingCart, Zap, Check, ShieldCheck, Truck, RefreshCw, ZoomIn } from 'lucide-react';
import { colorMap } from '../data';
import ProductCard from './ProductCard';

interface ProductDetailProps {
  product: Product;
  allProducts: Product[];
  onBack: () => void;
  onAddToCart: (product: Product, size: string, color: string, quantity: number, waist?: string) => void;
  onBuyNow: (product: Product, size: string, color: string, quantity: number, waist?: string) => void;
  onSelectProduct: (product: Product) => void;
}

export default function ProductDetail({
  product,
  allProducts,
  onBack,
  onAddToCart,
  onBuyNow,
  onSelectProduct
}: ProductDetailProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || 'Navy Blue');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '7-8yr');
  const [selectedWaist, setSelectedWaist] = useState(product.waistInches?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'desc' | 'fabric' | 'care'>('desc');
  const [addedSuccess, setAddedSuccess] = useState(false);

  const [lensState, setLensState] = useState({
    showLens: false,
    x: 0,
    y: 0,
    containerWidth: 0,
    containerHeight: 0,
  });

  const handleInteraction = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;
    
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
    
    setLensState({
      showLens: true,
      x,
      y,
      containerWidth: rect.width,
      containerHeight: rect.height,
    });
  };

  const handleLeave = () => {
    setLensState(prev => ({ ...prev, showLens: false }));
  };

  const hasDiscount = !!(product.discountPercent && product.discountPercent > 0);
  const salePrice = hasDiscount ? product.price * (1 - (product.discountPercent || 0) / 100) : product.price;

  // Update selection if product changes
  useEffect(() => {
    setSelectedColor(product.colors[0] || 'Navy Blue');
    setSelectedSize(product.sizes[0] || '7-8yr');
    setSelectedWaist(product.waistInches && product.waistInches.length > 0 ? product.waistInches[0] : '');
    setQuantity(1);
    setActiveImageIndex(0);
    setAddedSuccess(false);
  }, [product]);

  // Synchronize active image index with selected color
  const handleColorChange = (colorName: string, index: number) => {
    setSelectedColor(colorName);
    setActiveImageIndex(index);
  };

  const handleAddToCart = () => {
    onAddToCart(
      product, 
      selectedSize, 
      selectedColor, 
      quantity, 
      (product.category === 'Trousers' || product.category === 'Pants') ? selectedWaist : undefined
    );
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  const handleBuyNow = () => {
    onBuyNow(
      product, 
      selectedSize, 
      selectedColor, 
      quantity, 
      (product.category === 'Trousers' || product.category === 'Pants') ? selectedWaist : undefined
    );
  };

  // Get related products (same category, excluding current product, active only)
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id && p.isActive)
    .slice(0, 4);

  const isOutOfStock = product.stockQuantity === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Collection</span>
      </button>

      {/* Product Information Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm">
        
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div 
            onMouseMove={handleInteraction}
            onMouseLeave={handleLeave}
            onTouchMove={handleInteraction}
            onTouchEnd={handleLeave}
            className={`relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 select-none ${
              lensState.showLens ? 'cursor-none' : 'cursor-zoom-in'
            }`}
          >
            {/* Base Product Image */}
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="h-full w-full object-contain p-4 object-center"
            />

            {/* Hover instruction badge */}
            {!lensState.showLens && (
              <div className="absolute bottom-3 right-3 z-10 flex items-center space-x-1.5 rounded-lg bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 text-[10px] font-black text-white uppercase tracking-wider select-none border border-white/10 pointer-events-none transition-all duration-300">
                <ZoomIn className="h-3.5 w-3.5 text-amber-400" />
                <span>Hover to zoom</span>
              </div>
            )}

            {/* Zooming Glass Mirror / Lens */}
            {lensState.showLens && (
              <div 
                className="absolute pointer-events-none rounded-full border-2 border-white/95 shadow-[0_15px_35px_rgba(0,0,0,0.3)] w-24 h-24 overflow-hidden z-20 bg-slate-50 ring-4 ring-slate-900/10"
                style={{
                  left: `${lensState.x - 48}px`,
                  top: `${lensState.y - 48}px`,
                }}
              >
                <img
                  src={product.images[activeImageIndex] || product.images[0]}
                  alt="Magnified Detail"
                  referrerPolicy="no-referrer"
                  style={{
                    position: 'absolute',
                    width: `${lensState.containerWidth * 2.5}px`,
                    height: `${lensState.containerHeight * 2.5}px`,
                    left: `${-(lensState.x * 2.5 - 48)}px`,
                    top: `${-(lensState.y * 2.5 - 48)}px`,
                    maxWidth: 'none',
                    maxHeight: 'none',
                  }}
                  className="object-contain p-10 bg-slate-50"
                />
              </div>
            )}
          </div>

          {/* Thumbnail Gallery Row */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border bg-slate-50 transition-all ${
                    activeImageIndex === idx 
                      ? 'border-[#E6A11E] ring-2 ring-[#E6A11E]/20' 
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img src={img} alt={`${product.name} thumbnail ${idx}`} className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Buying controls */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Tag/Category */}
            <span className="rounded bg-[#E6A11E]/10 px-3 py-1 text-xs font-bold text-[#E6A11E] uppercase tracking-wider">
              {product.category} // {product.subtype}
            </span>

            {/* Product Name */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Price & Rating Placeholder */}
            <div className="flex items-baseline flex-wrap gap-3">
              {hasDiscount ? (
                <>
                  <span className="text-3xl font-black text-[#1B2A4A]">
                    Rs. {Math.round(salePrice).toLocaleString()}
                  </span>
                  <span className="text-lg font-bold text-slate-400 line-through">
                    Rs. {product.price.toLocaleString()}
                  </span>
                  <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-black uppercase">
                    {product.discountPercent}% OFF
                  </span>
                </>
              ) : (
                <span className="text-3xl font-black text-[#1B2A4A]">
                  Rs. {product.price.toLocaleString()}
                </span>
              )}
              {isOutOfStock ? (
                <span className="rounded bg-rose-100 text-rose-700 px-2.5 py-1 text-xs font-bold uppercase">
                  Out of Stock
                </span>
              ) : product.stockQuantity <= 10 ? (
                <span className="rounded bg-amber-100 text-amber-700 border border-amber-200/50 px-2.5 py-1 text-xs font-black uppercase animate-pulse flex items-center gap-1.5">
                  ⚠️ Only {product.stockQuantity} Piece{product.stockQuantity > 1 ? 's' : ''} Left!
                </span>
              ) : (
                <span className="rounded bg-emerald-100 text-emerald-700 px-2.5 py-1 text-xs font-bold uppercase">
                  In Stock ({product.stockQuantity} available)
                </span>
              )}
            </div>

            <hr className="border-slate-100" />

            {/* COLOR SELECTOR */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Color: <span className="text-slate-900 font-extrabold">{selectedColor}</span>
              </span>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((colorName, idx) => (
                  <button
                    key={colorName}
                    onClick={() => handleColorChange(colorName, idx)}
                    className={`group flex items-center space-x-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                      selectedColor === colorName
                        ? 'border-[#1B2A4A] bg-[#1B2A4A] text-white shadow-md'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span 
                      className="h-3 w-3 rounded-full border border-black/10"
                      style={{ backgroundColor: colorMap[colorName] || '#000000' }}
                    />
                    <span>{colorName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SIZE SELECTOR */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Size (Age Group): <span className="text-slate-900 font-extrabold">{selectedSize}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-lg border px-4 py-2 text-xs font-bold tracking-wide uppercase transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'border-[#E6A11E] bg-[#E6A11E] text-slate-950 shadow-md'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* WAIST SELECTOR (Trouser / Pants only) */}
            {(product.category === 'Trousers' || product.category === 'Pants') && product.waistInches && product.waistInches.length > 0 && (
              <div className="bg-amber-50/45 border border-amber-200 p-4 rounded-xl mt-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block mb-2">
                  Waist Size (Inches): <span className="text-amber-950 font-black">{selectedWaist}"</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.waistInches.map((waist) => (
                    <button
                      key={waist}
                      type="button"
                      onClick={() => setSelectedWaist(waist)}
                      className={`rounded-lg border px-3.5 py-1.5 text-xs font-extrabold tracking-wide transition-all cursor-pointer ${
                        selectedWaist === waist
                          ? 'border-amber-600 bg-amber-500 text-slate-950 shadow-md'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {waist}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QUANTITY SELECTOR */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Quantity
              </span>
              <div className="flex items-center space-x-3">
                <div className="flex items-center rounded-lg border border-slate-200 bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="px-3.5 py-2 text-slate-500 hover:text-slate-900 disabled:opacity-30 text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-slate-900 text-sm font-extrabold w-12 text-center select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    disabled={quantity >= product.stockQuantity || isOutOfStock}
                    className="px-3.5 py-2 text-slate-500 hover:text-slate-900 disabled:opacity-30 text-sm font-bold"
                  >
                    +
                  </button>
                </div>
                {product.stockQuantity > 0 && quantity >= product.stockQuantity && (
                  <span className="text-xs text-amber-600 font-semibold">
                    Maximum stock reached
                  </span>
                )}
              </div>
            </div>

            {/* CTA BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 flex items-center justify-center space-x-2 rounded-xl py-3 text-sm font-bold shadow transition-all transform active:scale-95 ${
                  isOutOfStock 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : addedSuccess
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-slate-950 text-white hover:bg-[#1B2A4A]'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`flex-1 flex items-center justify-center space-x-2 rounded-xl py-3 text-sm font-bold shadow transition-all transform active:scale-95 ${
                  isOutOfStock 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-[#E6A11E] text-slate-950 hover:bg-[#d49015]'
                }`}
              >
                <Zap className="h-4 w-4" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* Delivery & Security Perks */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            <div className="flex flex-col items-center p-2 rounded bg-slate-50">
              <Truck className="h-4 w-4 text-[#1B2A4A] mb-1" />
              <span className="font-bold text-slate-800">Flat Delivery</span>
              <span>Fast home dispatch</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded bg-slate-50">
              <RefreshCw className="h-4 w-4 text-[#1B2A4A] mb-1" />
              <span className="font-bold text-slate-800">Easy Exchange</span>
              <span>Fit size guarantee</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded bg-slate-50">
              <ShieldCheck className="h-4 w-4 text-[#1B2A4A] mb-1" />
              <span className="font-bold text-slate-800">Cash on Delivery</span>
              <span>Pay only at door</span>
            </div>
          </div>

        </div>

      </div>

      {/* Accordion Specification Tabs */}
      <div className="mt-8 bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 text-sm font-extrabold border-b-2 mr-6 transition-all ${
              activeTab === 'desc' 
                ? 'border-[#E6A11E] text-[#E6A11E]' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Product Description
          </button>
          <button
            onClick={() => setActiveTab('fabric')}
            className={`pb-3 text-sm font-extrabold border-b-2 mr-6 transition-all ${
              activeTab === 'fabric' 
                ? 'border-[#E6A11E] text-[#E6A11E]' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Fabric &amp; Care
          </button>
          <button
            onClick={() => setActiveTab('care')}
            className={`pb-3 text-sm font-extrabold border-b-2 transition-all ${
              activeTab === 'care' 
                ? 'border-[#E6A11E] text-[#E6A11E]' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Care Instructions
          </button>
        </div>

        <div className="pt-6 text-sm text-slate-600 leading-relaxed">
          {activeTab === 'desc' && (
            <div className="space-y-2">
              <p>{product.description}</p>
              <p>Each Jawan garment is carefully tailored with premium threads, robust double stitching at critical stress areas, and vibrant dye-lock colors that remain shiny and gorgeous wash after wash. Designed to offer freedom of movement and absolute comfort for active kids and boys.</p>
            </div>
          )}
          {activeTab === 'fabric' && (
            <div className="space-y-1">
              <p className="font-semibold text-slate-800">Specifications:</p>
              <p>{product.fabricDetails}</p>
              <p>Selected dye matches highest hypoallergenic grades, making it perfectly safe and non-irritable for sensitive young skins.</p>
            </div>
          )}
          {activeTab === 'care' && (
            <div className="space-y-1">
              <p className="font-semibold text-slate-800">Washing Guide:</p>
              <p>{product.careInstructions}</p>
            </div>
          )}
        </div>
      </div>

      {/* RELATED PRODUCTS SECTION */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-black text-slate-900 mb-6">
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelectProduct={onSelectProduct}
                onAddToCart={(prod, sz, col) => onAddToCart(prod, sz, col, 1)}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
