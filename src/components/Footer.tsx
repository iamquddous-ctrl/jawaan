/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Compass, HelpCircle, Key } from 'lucide-react';

interface FooterProps {
  onSecretAdminClick: () => void;
  brandName?: string;
  tagline?: string;
}

export default function Footer({ onSecretAdminClick, brandName, tagline }: FooterProps) {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs py-14 mt-20 border-t border-white/5 relative overflow-hidden">
      {/* Background glow overlay */}
      <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand Mission Column */}
        <div className="space-y-4">
          <span className="text-xl font-black tracking-wider text-white uppercase font-display">
            {brandName || 'JAWAN'}
          </span>
          <p className="text-slate-400 text-xs leading-relaxed font-medium">
            {tagline ? tagline : 'Durable, high-energy clothing engineered for active boys and teens. Quality-lock fabrics, play-proof double seams, and bold colors that last.'}
          </p>
          <div className="flex items-center space-x-2 text-amber-400 font-extrabold text-[9px] uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            <span>Playground Approved Quality</span>
          </div>
        </div>

        {/* Support Services Column */}
        <div className="space-y-3">
          <h4 className="text-white font-black text-xs tracking-wider uppercase font-display border-b border-white/5 pb-2">
            Client Support
          </h4>
          <ul className="space-y-2 text-slate-400 font-medium">
            <li><a href="#" className="hover:text-amber-400 transition-colors">Exchange &amp; Returns Policy</a></li>
            <li><a href="#" className="hover:text-amber-400 transition-colors">Size Guide Assistance</a></li>
            <li><a href="#" className="hover:text-amber-400 transition-colors">Cash on Delivery Info</a></li>
            <li><a href="#" className="hover:text-amber-400 transition-colors">Track Orders Helpline</a></li>
          </ul>
        </div>

        {/* Contact Info Column */}
        <div className="space-y-3">
          <h4 className="text-white font-black text-xs tracking-wider uppercase font-display border-b border-white/5 pb-2">
            Store Operations
          </h4>
          <ul className="space-y-2 text-slate-400 font-medium">
            <li className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Helpline</span>
              <span>+92 300 1234567</span>
            </li>
            <li className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold">WhatsApp Support</span>
              <span>+92 300 1234567</span>
            </li>
            <li className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Email Inquiry</span>
              <span>customercare@jawan.com</span>
            </li>
          </ul>
        </div>

        {/* Dispatch Area Grid */}
        <div className="space-y-3">
          <h4 className="text-white font-black text-xs tracking-wider uppercase font-display border-b border-white/5 pb-2">
            Nationwide Dispatch
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Fast, flat-rate secure shipping across Karachi, Lahore, Islamabad, Faisalabad, Peshawar, Multan, and other major cities. Paid securely at your door.
          </p>
          <div className="flex items-center space-x-1.5 text-slate-500 text-[9px] font-bold uppercase tracking-wider">
            <Compass className="h-4 w-4 text-slate-500" />
            <span>Dispatched from Karachi Hub</span>
          </div>
        </div>

      </div>

      <hr className="my-8 border-white/5 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" />

      {/* Copy row & Hidden Admin Link */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
        <p>© 2026 {brandName || 'Jawan'}. All rights reserved.</p>
        
        {/* Secret Admin Access trigger */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onSecretAdminClick}
            className="flex items-center space-x-1.5 text-slate-700 hover:text-slate-400 transition-colors cursor-pointer"
            title="Business Gateway Login"
          >
            <Key className="h-4 w-4" />
            <span>Portal Gateway</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
