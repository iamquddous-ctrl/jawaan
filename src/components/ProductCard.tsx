/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product } from '../types';
import { Eye, ShoppingCart, Sparkles, AlertCircle } from 'lucide-react';
import { colorMap } from '../data';

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
}

export default function ProductCard({ product, onSelectProduct, onAddToCart }: ProductCardProps) {
  // Store the index of the selected color to dynamically change the shown image
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 10;
  const hasDiscount = !!(product.discountPercent && product.discountPercent > 0);
  const salePrice = hasDiscount ? product.price * (1 - (product.discountPercent || 0) / 100) : product.price;

  const activeImage = product.images[selectedColorIndex] || product.images[0];
  const activeColorName = product.colors[selectedColorIndex] || product.colors[0];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    // Add the first available size and active color
    const defaultSize = product.sizes[0] || '7-8yr';
    onAddToCart(product, defaultSize, activeColorName);
  };

  return (
    <div 
      onClick={() => onSelectProduct(product)}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-[0_15px_30px_rgba(0,0,0,0.06)] hover:border-amber-400/20 transition-all duration-300 cursor-pointer transform hover:-translate-y-1.5"
    >
      {/* Badges Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.isFeatured && (
          <span className="flex items-center space-x-1 rounded-md bg-[#E6A11E] px-2.5 py-1 text-[8px] font-black text-slate-950 uppercase tracking-widest shadow-md">
            <Sparkles className="h-2.5 w-2.5" />
            <span>Featured</span>
          </span>
        )}
        {product.discountPercent && product.discountPercent > 0 ? (
          <span className="flex items-center space-x-1 rounded-md bg-emerald-600 px-2.5 py-1 text-[8px] font-black text-white uppercase tracking-widest shadow-md">
            <span>{product.discountPercent}% OFF</span>
          </span>
        ) : null}
        {isOutOfStock ? (
          <span className="rounded-md bg-rose-600 px-2.5 py-1 text-[8px] font-black text-white uppercase tracking-widest shadow-md">
            Sold Out
          </span>
        ) : isLowStock ? (
          <span className="flex items-center space-x-1 rounded-md bg-amber-500 px-2.5 py-1 text-[8px] font-black text-slate-950 uppercase tracking-widest shadow-md">
            <AlertCircle className="h-2.5 w-2.5" />
            <span>Only {product.stockQuantity} Left</span>
          </span>
        ) : null}
      </div>

      {/* Product Image Gallery Wrapper */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50 border-b border-slate-50">
        <img
          src={activeImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-contain p-6 object-center transition-transform duration-700 ease-out group-hover:scale-108"
        />
        
        {/* Hover Action Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            className="flex items-center space-x-2 rounded-xl bg-white/95 backdrop-blur-sm px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg hover:bg-[#E6A11E] hover:text-slate-950 transition-all transform translate-y-3 group-hover:translate-y-0 duration-300"
          >
            <Eye className="h-4 w-4" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Card Info Details */}
      <div className="flex flex-1 flex-col p-4.5 space-y-3">
        {/* Subtype Category */}
        <span className="text-[9px] font-black tracking-widest text-[#E6A11E] uppercase opacity-90">
          {product.category} // {product.subtype}
        </span>

        {/* Title */}
        <h3 className="font-display font-black text-sm text-slate-950 group-hover:text-amber-500 transition-colors line-clamp-1 leading-tight uppercase">
          {product.name}
        </h3>

        {/* Price & Stock status */}
        <div className="flex items-baseline justify-between gap-2 border-b border-slate-100/60 pb-3">
          <div className="flex flex-wrap items-baseline gap-2 min-w-0">
            {hasDiscount ? (
              <>
                <span className="text-base font-black text-slate-950 truncate">
                  Rs. {Math.round(salePrice).toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-slate-400 line-through truncate">
                  Rs. {product.price.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-base font-black text-slate-950 truncate">
                Rs. {product.price.toLocaleString()}
              </span>
            )}
          </div>
          <span className={`text-[9px] font-bold tracking-wider uppercase shrink-0 ${isOutOfStock ? 'text-rose-500' : 'text-emerald-500'}`}>
            ● {isOutOfStock ? 'Out of Stock' : 'In Stock'}
          </span>
        </div>

        {/* Color Indicators Selector */}
        <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
          <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Select Color:</p>
          <div className="flex items-center gap-2">
            {product.colors.map((colorName, idx) => (
              <button
                key={colorName}
                onClick={() => setSelectedColorIndex(idx)}
                className={`h-5 w-5 rounded-full border transition-all duration-300 cursor-pointer ${
                  selectedColorIndex === idx 
                    ? 'ring-2 ring-amber-400 ring-offset-1 scale-110 border-transparent shadow' 
                    : 'border-slate-300 hover:scale-105 hover:border-slate-400'
                }`}
                style={{ backgroundColor: colorMap[colorName] || '#000000' }}
                title={colorName}
              />
            ))}
          </div>
        </div>

        {/* Sizes Showcase */}
        <div className="space-y-1">
          <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Available Sizes:</p>
          <div className="flex flex-wrap gap-1">
            {product.sizes.map(size => (
              <span 
                key={size}
                className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-0.5 text-[8px] font-bold text-slate-600 uppercase tracking-tight"
              >
                {size}
              </span>
            ))}
          </div>
        </div>

        {/* Waist Sizes (Inches) - displayed only for Trousers / Pants */}
        {(product.category === 'Trousers' || product.category === 'Pants') && product.waistInches && product.waistInches.length > 0 && (
          <div className="space-y-1 pt-0.5">
            <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center space-x-1">
              <span>Waist (Inches):</span>
            </p>
            <div className="flex flex-wrap gap-1">
              {product.waistInches.map(waist => (
                <span 
                  key={waist}
                  className="rounded-lg border border-amber-200/50 bg-amber-50 px-2 py-0.5 text-[8px] font-black text-amber-700"
                >
                  {waist}"
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Button: Buy / Add to Cart */}
        <div className="pt-2">
          <button
            disabled={isOutOfStock}
            onClick={handleQuickAdd}
            className={`flex w-full items-center justify-center space-x-2 rounded-xl py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              isOutOfStock 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-950 text-white hover:bg-[#E6A11E] hover:text-slate-950 hover:shadow-[0_4px_15px_rgba(230,161,30,0.25)] active:scale-97'
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>{isOutOfStock ? 'Sold Out' : 'Quick Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
