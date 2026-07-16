/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, ArrowRight, Grid, Play } from 'lucide-react';
import { Category } from '../types';

interface HeroProps {
  onNavigateToCategory: (category: Category) => void;
}

export default function Hero({ onNavigateToCategory }: HeroProps) {
  return (
    <div className="relative overflow-hidden bg-slate-950 text-white rounded-3xl mx-auto max-w-7xl mt-6 mb-10 shadow-2xl border border-white/5">
      {/* Dynamic Animated Ambient Mesh Gradients */}
      <div className="absolute inset-0 bg-slate-950/40 opacity-70" />
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl animate-[pulse_6s_infinite]" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl animate-[pulse_8s_infinite]" />
      
      {/* Grid Overlay decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Hero Content Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 px-6 py-14 sm:px-12 sm:py-24 items-center">
        
        {/* Left column: Text Content */}
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center space-x-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-400 tracking-wider uppercase shadow-[0_0_15px_rgba(245,158,11,0.05)] animate-pulse">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>NEW SUMMER COLLECTION &apos;26</span>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7.5xl font-black font-display tracking-tight leading-none uppercase">
              MADE FOR THE <br />
              <span className="bg-gradient-to-r from-[#E6A11E] to-yellow-400 bg-clip-text text-transparent filter drop-shadow-[0_2px_10px_rgba(230,161,30,0.15)] font-black">
                BOLD &amp; ACTIVE
              </span>
            </h1>
            
            <p className="text-slate-300 max-w-xl text-sm sm:text-base font-medium leading-relaxed">
              Discover street-smart baggy cargo pants, breathable cotton polo shirts, and stretch playground-proof jeans. Built durable. Styled fresh.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => onNavigateToCategory('Shirts')}
              className="group relative flex items-center space-x-2 rounded-xl bg-[#E6A11E] px-6 py-3.5 text-xs font-black uppercase tracking-widest text-slate-950 shadow-[0_4px_20px_rgba(230,161,30,0.3)] hover:shadow-[0_4px_25px_rgba(230,161,30,0.45)] hover:bg-yellow-400 active:scale-98 transition-all duration-300 cursor-pointer"
            >
              <span>Shop Shirts</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </button>
            <button
              onClick={() => onNavigateToCategory('Trousers')}
              className="flex items-center space-x-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest text-white active:scale-98 transition-all duration-300 cursor-pointer"
            >
              <span>Browse Trousers</span>
            </button>
          </div>
        </div>

        {/* Right column: Categories Showcase Bento Grid */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4 mt-8 lg:mt-0">
          
          {/* Bento Box 1 - Shirts */}
          <div 
            onClick={() => onNavigateToCategory('Shirts')}
            className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-5 border border-white/5 hover:border-amber-500/40 shadow-lg hover:shadow-[0_0_30px_rgba(230,161,30,0.15)] transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute top-4 right-4 flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[8px] font-black tracking-widest text-emerald-400 uppercase">Live</span>
            </div>
            
            <span className="text-[9px] font-bold text-amber-400 tracking-widest uppercase block mb-1">
              01 // Topwear
            </span>
            <h3 className="font-display font-black text-lg mb-1 tracking-tight text-white group-hover:text-amber-400 transition-colors">
              SHIRTS
            </h3>
            <p className="text-xs text-slate-400 font-medium">Polos, Casual &amp; Dress Shirts</p>
            
            <div className="mt-5 flex items-center text-[10px] text-amber-400 font-bold uppercase tracking-wider">
              <span>Explore</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>

          {/* Bento Box 2 - Trousers */}
          <div 
            onClick={() => onNavigateToCategory('Trousers')}
            className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-5 border border-white/5 hover:border-blue-500/40 shadow-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute top-4 right-4 flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[8px] font-black tracking-widest text-blue-400 uppercase">New</span>
            </div>
            
            <span className="text-[9px] font-bold text-amber-400 tracking-widest uppercase block mb-1">
              02 // Street
            </span>
            <h3 className="font-display font-black text-lg mb-1 tracking-tight text-white group-hover:text-amber-400 transition-colors">
              TROUSERS
            </h3>
            <p className="text-xs text-slate-400 font-medium">Baggy, Cargos &amp; Formal</p>
            
            <div className="mt-5 flex items-center text-[10px] text-amber-400 font-bold uppercase tracking-wider">
              <span>Explore</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>

          {/* Bento Box 3 - Pants & Denims (Spans 2 cols) */}
          <div 
            onClick={() => onNavigateToCategory('Pants')}
            className="group relative col-span-2 cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/90 p-6 border border-white/5 hover:border-amber-500/40 shadow-lg hover:shadow-[0_0_35px_rgba(230,161,30,0.15)] transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute top-5 right-5 h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
            
            <span className="text-[9px] font-bold text-amber-400 tracking-widest uppercase block mb-1.5">
              03 // Everyday Play
            </span>
            
            <div className="flex justify-between items-end">
              <div>
                <h3 className="font-display font-black text-xl mb-1.5 tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  PANTS &amp; DENIMS
                </h3>
                <p className="text-xs text-slate-400 font-medium max-w-sm">
                  Ultra-stretch Jeans, Chinos &amp; Athletic Joggers. Designed for active lifestyles.
                </p>
              </div>
              
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 group-hover:bg-amber-400 group-hover:text-slate-950 transition-all duration-300">
                <ArrowRight className="h-4.5 w-4.5 text-amber-400 group-hover:text-slate-950 transition-colors" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
