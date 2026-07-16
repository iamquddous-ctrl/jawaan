/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, AdminSettings } from './types';

// Map color names to Hex colors for rendering
export const colorMap: Record<string, string> = {
  'Navy Blue': '#1B2A4A',
  'Mustard Yellow': '#E6A11E',
  'White': '#F4F5F7',
  'Olive Green': '#3D5236',
  'Crimson': '#8F1E28',
  'Charcoal Gray': '#2F3E46',
  'Khaki': '#C2B280',
  'Ice Blue': '#D0E1FD'
};

// Generates an SVG data URL for clothing items
export function generateClothingSvg(type: string, colorName: string): string {
  const hex = colorMap[colorName] || '#1B2A4A';
  const shadowHex = '#0f172a15';
  const detailHex = colorName === 'White' ? '#CBD5E1' : '#FFFFFF33';
  const collarHex = colorName === 'White' ? '#E2E8F0' : '#00000022';
  
  let paths = '';
  
  const typeLower = type.toLowerCase();
  
  if (typeLower.includes('polo')) {
    // Polo Shirt SVG
    paths = `
      <!-- Sleeves -->
      <path d="M40 70 L10 90 L25 115 L50 95 Z" fill="${hex}" />
      <path d="M160 70 L190 90 L175 115 L150 95 Z" fill="${hex}" />
      <!-- Body -->
      <path d="M50 80 Q100 85 150 80 L145 180 Q100 185 55 180 Z" fill="${hex}" />
      <!-- Polo Collar (V-neck shape) -->
      <path d="M80 50 L100 85 L120 50 Z" fill="${collarHex}" />
      <!-- Left Collar Flap -->
      <path d="M78 50 L100 85 L90 50 Z" fill="${hex}" stroke="${collarHex}" stroke-width="1.5" />
      <!-- Right Collar Flap -->
      <path d="M122 50 L100 85 L110 50 Z" fill="${hex}" stroke="${collarHex}" stroke-width="1.5" />
      <!-- Placket and Buttons -->
      <path d="M96 85 L104 85 L104 120 L96 120 Z" fill="${collarHex}" />
      <circle cx="100" cy="95" r="2.5" fill="#FFFFFF" />
      <circle cx="100" cy="107" r="2.5" fill="#FFFFFF" />
      <!-- Pocket -->
      <path d="M65 105 L80 105 L80 125 L65 125 Z" fill="${hex}" stroke="${detailHex}" stroke-width="1" />
    `;
  } else if (typeLower.includes('dress')) {
    // Dress Shirt SVG (Long sleeves, sharp collar)
    paths = `
      <!-- Left Sleeve -->
      <path d="M42 65 L5 120 L15 130 L48 90 Z" fill="${hex}" />
      <path d="M5 120 L8 128 L15 130 L10 120 Z" fill="${collarHex}" /> <!-- Cuff -->
      <!-- Right Sleeve -->
      <path d="M158 65 L195 120 L185 130 L152 90 Z" fill="${hex}" />
      <path d="M195 120 L192 128 L185 130 L190 120 Z" fill="${collarHex}" /> <!-- Cuff -->
      <!-- Body -->
      <path d="M48 75 Q100 80 152 75 L145 185 Q100 190 55 185 Z" fill="${hex}" />
      <!-- Fold/Cuts -->
      <path d="M100 78 L100 185" stroke="${detailHex}" stroke-width="1.5" stroke-dasharray="3,3" />
      <!-- Collar -->
      <path d="M75 52 L100 78 L125 52 L112 45 L88 45 Z" fill="${collarHex}" />
      <path d="M75 52 L100 78 L85 45 Z" fill="${hex}" stroke="${collarHex}" stroke-width="1" />
      <path d="M125 52 L100 78 L115 45 Z" fill="${hex}" stroke="${collarHex}" stroke-width="1" />
      <!-- Buttons -->
      <circle cx="100" cy="95" r="2" fill="#FFFFFF" />
      <circle cx="100" cy="115" r="2" fill="#FFFFFF" />
      <circle cx="100" cy="135" r="2" fill="#FFFFFF" />
      <circle cx="100" cy="155" r="2" fill="#FFFFFF" />
    `;
  } else if (typeLower.includes('casual') || typeLower.includes('shirt')) {
    // Casual Shirt SVG (Short sleeves, chest pocket, relaxed)
    paths = `
      <!-- Sleeves -->
      <path d="M42 70 L12 95 L24 118 L48 98 Z" fill="${hex}" />
      <!-- Cuff fold -->
      <path d="M12 95 L24 118 L27 114 L15 91 Z" fill="${collarHex}" />
      <path d="M158 70 L188 95 L176 118 L152 98 Z" fill="${hex}" />
      <!-- Cuff fold -->
      <path d="M188 95 L176 118 L173 114 L185 91 Z" fill="${collarHex}" />
      <!-- Body -->
      <path d="M48 80 Q100 85 152 80 L146 182 L54 182 Z" fill="${hex}" />
      <!-- Placket open neck -->
      <path d="M92 50 L100 85 L108 50 Z" fill="${collarHex}" />
      <path d="M100 85 L100 182" stroke="${collarHex}" stroke-width="1.5" />
      <!-- Buttons -->
      <circle cx="100" cy="105" r="2.5" fill="#00000033" />
      <circle cx="100" cy="130" r="2.5" fill="#00000033" />
      <circle cx="100" cy="155" r="2.5" fill="#00000033" />
      <!-- Double chest pockets -->
      <path d="M60 100 L76 100 L76 120 L60 120 Z" fill="${hex}" stroke="${detailHex}" stroke-width="1" />
      <path d="M124 100 L140 100 L140 120 L124 120 Z" fill="${hex}" stroke="${detailHex}" stroke-width="1" />
    `;
  } else if (typeLower.includes('cargo') || typeLower.includes('baggy')) {
    // Cargo / Baggy Trousers (Wide legs, cargo pocket details)
    paths = `
      <!-- Waistband -->
      <path d="M60 40 L140 40 L138 52 L62 52 Z" fill="${hex}" />
      <path d="M60 40 L140 40" stroke="${detailHex}" stroke-width="2" />
      <!-- Drawstring -->
      <path d="M96 46 Q100 65 92 75 M104 46 Q100 65 108 75" stroke="#E6A11E" stroke-width="2" fill="none" stroke-linecap="round" />
      <!-- Legs -->
      <path d="M62 52 L50 180 Q68 185 86 180 L96 90 L104 90 L114 180 Q132 185 150 180 L138 52 Z" fill="${hex}" />
      <!-- Side Cargo Pockets (Flaps + Pockets) -->
      <path d="M43 100 L53 102 L51 130 L41 128 Z" fill="${hex}" stroke="${detailHex}" stroke-width="1" />
      <path d="M42 96 L54 98 L51 104 L41 102 Z" fill="${collarHex}" /> <!-- pocket flap -->
      <path d="M147 100 L157 102 L159 130 L149 128 Z" fill="${hex}" stroke="${detailHex}" stroke-width="1" />
      <path d="M148 96 L160 98 L157 104 L147 102 Z" fill="${collarHex}" /> <!-- pocket flap -->
      <!-- Knee stitching -->
      <path d="M54 115 Q75 118 93 112" stroke="${detailHex}" stroke-width="1" fill="none" />
      <path d="M107 112 Q125 118 146 115" stroke="${detailHex}" stroke-width="1" fill="none" />
    `;
  } else if (typeLower.includes('jeans') || typeLower.includes('jogger') || typeLower.includes('chino') || typeLower.includes('trousers') || typeLower.includes('pants')) {
    // Pants / Joggers / Jeans SVG
    const seamColor = typeLower.includes('jeans') ? '#D97706' : detailHex; // Orange stitching for jeans
    paths = `
      <!-- Waistband -->
      <path d="M62 40 L138 40 L136 52 L64 52 Z" fill="${hex}" />
      <!-- Belt loops -->
      <rect x="70" y="40" width="4" height="12" fill="${collarHex}" />
      <rect x="98" y="40" width="4" height="12" fill="${collarHex}" />
      <rect x="126" y="40" width="4" height="12" fill="${collarHex}" />
      <!-- Pants legs -->
      <path d="M64 52 L54 180 L88 180 L98 85 L102 85 L112 180 L146 180 L136 52 Z" fill="${hex}" />
      <!-- Side Pockets -->
      <path d="M64 52 Q78 72 74 85" stroke="${seamColor}" stroke-width="1.5" fill="none" />
      <path d="M136 52 Q122 72 126 85" stroke="${seamColor}" stroke-width="1.5" fill="none" />
      <!-- Fly stitch -->
      <path d="M96 52 L96 78 Q100 84 104 84" stroke="${seamColor}" stroke-width="1.5" fill="none" />
      <!-- Ribbed Cuffs (for joggers) -->
      ${typeLower.includes('jogger') ? `
        <rect x="53" y="176" width="36" height="8" rx="2" fill="${collarHex}" />
        <rect x="111" y="176" width="36" height="8" rx="2" fill="${collarHex}" />
      ` : ''}
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%">
      <rect width="200" height="220" rx="16" fill="#F8FAFC" />
      <!-- Background subtle gradient circle -->
      <circle cx="100" cy="115" r="70" fill="#E2E8F0" opacity="0.6" />
      <!-- Shadows -->
      <ellipse cx="100" cy="183" rx="55" ry="10" fill="${shadowHex}" />
      ${paths}
    </svg>
  `;
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Full product catalog
export const initialProducts: Product[] = [
  {
    id: 'p1',
    name: 'Jawan Signature Polo',
    category: 'Shirts',
    subtype: 'Polo Shirts',
    price: 1850.00,
    sizes: ['5-6yr', '7-8yr', '9-10yr', '11-12yr'],
    colors: ['Navy Blue', 'Mustard Yellow', 'White'],
    stockQuantity: 18,
    description: 'A classic short-sleeved Polo shirt designed for young champions. Crafted from premium breathable piqué cotton, it delivers exceptional comfort for active days.',
    fabricDetails: '100% Piqué Cotton, breathable and stretch-resistant.',
    careInstructions: 'Machine wash cold with like colors. Tumble dry low. Do not bleach. Cool iron if needed.',
    images: [], // Populated dynamically with SVGs based on colors
    isActive: true,
    isFeatured: true,
    discountPercent: 15
  },
  {
    id: 'p2',
    name: 'Classic Oxford Dress Shirt',
    category: 'Shirts',
    subtype: 'Dress Shirts',
    price: 2450.00,
    sizes: ['7-8yr', '9-10yr', '11-12yr', '13-14yr'],
    colors: ['White', 'Ice Blue', 'Navy Blue'],
    stockQuantity: 12,
    description: 'Perfect formal attire for semi-formal gatherings, school milestones, or festive events. This Oxford cotton dress shirt features a smart button-down collar and crisp cuffs.',
    fabricDetails: '100% Oxford Cotton, durable weave.',
    careInstructions: 'Warm wash. Warm iron. Wash dark colors separately. Line dry in shade.',
    images: [],
    isActive: true,
    isFeatured: true
  },
  {
    id: 'p3',
    name: 'Urban Explorer Casual Shirt',
    category: 'Shirts',
    subtype: 'Casual Shirts',
    price: 2100.00,
    sizes: ['5-6yr', '7-8yr', '9-10yr', '11-12yr'],
    colors: ['Olive Green', 'Navy Blue', 'Mustard Yellow'],
    stockQuantity: 24,
    description: 'A rugged yet stylish casual shirt featuring twin chest pockets. Roll-up sleeves with button tabs add a playful, ready-for-adventure look.',
    fabricDetails: '100% Cotton Twill, soft washed finish.',
    careInstructions: 'Machine wash cold. Hang dry. Iron warm. Do not dry clean.',
    images: [],
    isActive: true,
    isFeatured: false
  },
  {
    id: 'p4',
    name: 'Streetwear Baggy Cargo Trousers',
    category: 'Trousers',
    subtype: 'Cargo Trousers',
    price: 2800.00,
    sizes: ['7-8yr', '9-10yr', '11-12yr', '13-14yr'],
    colors: ['Olive Green', 'Charcoal Gray', 'Khaki'],
    waistInches: ['24', '26', '28', '30'],
    stockQuantity: 15,
    description: 'Super cool cargo trousers featuring spacious side pockets and comfortable baggy fit. Complete with elastic ankles and a functional sporty drawstring waist.',
    fabricDetails: '98% Cotton twill, 2% Elastane for slight comfortable stretch.',
    careInstructions: 'Wash inside out. Machine wash 30°C. Do not tumble dry. Iron medium.',
    images: [],
    isActive: true,
    isFeatured: true,
    discountPercent: 10
  },
  {
    id: 'p5',
    name: 'Relaxed Fit Baggy Pants',
    category: 'Trousers',
    subtype: 'Baggy Pants',
    price: 2550.00,
    sizes: ['5-6yr', '7-8yr', '9-10yr', '11-12yr'],
    colors: ['Charcoal Gray', 'Navy Blue', 'Khaki'],
    waistInches: ['22', '24', '26', '28'],
    stockQuantity: 8, // Low stock alert test
    description: 'Ultra-comfortable baggy trousers that provide plenty of room to jump, run, and relax. Elasticated waistband and relaxed cuffs make dressing up extremely easy.',
    fabricDetails: '85% Cotton, 15% Linen for a light, summery feel.',
    careInstructions: 'Gentle cycle wash. Do not wring. Hang dry. Mild steam iron.',
    images: [],
    isActive: true,
    isFeatured: false
  },
  {
    id: 'p6',
    name: 'Smart Classic Formal Trousers',
    category: 'Trousers',
    subtype: 'Formal Trousers',
    price: 2700.00,
    sizes: ['7-8yr', '9-10yr', '11-12yr', '13-14yr'],
    colors: ['Navy Blue', 'Charcoal Gray'],
    waistInches: ['24', '26', '28', '30'],
    stockQuantity: 20,
    description: 'Tailored trousers for formal gatherings and family celebrations. Includes adjustable inner elastic button system to custom-fit growing boys.',
    fabricDetails: '70% Polyester, 30% Viscose, premium smooth suit-pant fabric.',
    careInstructions: 'Dry clean recommended or gentle hand wash. Iron on low heat with press cloth.',
    images: [],
    isActive: true,
    isFeatured: false
  },
  {
    id: 'p7',
    name: 'Jawan Indigo Stretch Jeans',
    category: 'Pants',
    subtype: 'Jeans',
    price: 2950.00,
    sizes: ['5-6yr', '7-8yr', '9-10yr', '11-12yr', '13-14yr'],
    colors: ['Navy Blue', 'Charcoal Gray'],
    waistInches: ['24', '26', '28', '30'],
    stockQuantity: 25,
    description: 'Durable stretch denim jeans styled with hand-sanded highlights. Engineered to survive playground tumbles with reinforced stitching and double-knee flexibility.',
    fabricDetails: '95% Denim Cotton, 4% Polyester, 1% Spandex.',
    careInstructions: 'Wash before wear. Color may bleed initially. Machine wash warm inside out.',
    images: [],
    isActive: true,
    isFeatured: true
  },
  {
    id: 'p8',
    name: 'Active Tech Joggers',
    category: 'Pants',
    subtype: 'Joggers',
    price: 2300.00,
    sizes: ['5-6yr', '7-8yr', '9-10yr', '11-12yr'],
    colors: ['Navy Blue', 'Charcoal Gray', 'Mustard Yellow'],
    waistInches: ['22', '24', '26', '28'],
    stockQuantity: 30,
    description: 'High-performance joggers built for sports and play. Features zippered pockets to keep pocket money and small toys safe during sprint sessions.',
    fabricDetails: '100% Interlock Cotton-Polyester blend, premium heavy-weight structure.',
    careInstructions: 'Machine wash 40°C. Cool iron. Avoid fabric softeners to maintain performance.',
    images: [],
    isActive: true,
    isFeatured: false
  },
  {
    id: 'p9',
    name: 'Everyday Prep Chinos',
    category: 'Pants',
    subtype: 'Chinos',
    price: 2600.00,
    sizes: ['5-6yr', '7-8yr', '9-10yr', '11-12yr', '13-14yr'],
    colors: ['Khaki', 'Navy Blue', 'White'],
    stockQuantity: 14,
    description: 'Sleek, polished chinos that effortlessly bridge the gap between casual and dressy. Looks great with a tucked-in polo or an unbuttoned casual shirt.',
    fabricDetails: '100% Cotton Sateen with soft peach-fuzz finish.',
    careInstructions: 'Machine wash warm. Tumble dry medium. Iron hot.',
    images: [],
    isActive: true,
    isFeatured: false
  }
];

// Populate the initial products with actual SVG data-URLs for all their colors
export const seedProducts = initialProducts.map(p => {
  // Generate an SVG for each color option available
  const images = p.colors.map(color => generateClothingSvg(p.subtype || p.name, color));
  return {
    ...p,
    images: images.length > 0 ? images : [generateClothingSvg(p.subtype || p.name, p.colors[0] || 'Navy Blue')]
  };
});

// Seed default Admin Settings
export const defaultSettings: AdminSettings = {
  storeContact: '+92 300 1234567',
  storeWhatsapp: '+92 300 1234567',
  storeEmail: 'orders@jawanclothing.com',
  deliveryChargeFlat: 250.00,
  areas: ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'],
  emailjsServiceId: 'service_jawan',
  emailjsTemplateId: 'template_jawan',
  emailjsPublicKey: 'user_jawan_public_key',
  enableWhatsappApi: true,
  whatsappApiGateway: 'ultramsg',
  whatsappApiInstanceId: 'instance184982',
  whatsappApiToken: '',
  brandName: 'JAWAN',
  tagline: 'Premium Clothes for Boys'
};
