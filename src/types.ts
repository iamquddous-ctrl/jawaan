/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Category = 'Shirts' | 'Trousers' | 'Pants';

export interface Product {
  id: string;
  name: string;
  category: Category;
  subtype: string; // e.g., 'Polo', 'Dress', 'Casual', 'Baggy', 'Cargo', etc.
  price: number;
  sizes: string[]; // e.g., ['5-6yr', '7-8yr', '9-10yr', '11-12yr']
  colors: string[]; // e.g., ['Navy Blue', 'Mustard Yellow', 'White', 'Olive Green', 'Crimson']
  waistInches?: string[]; // e.g., ['28', '30', '32', '34'] - only for Trousers or Pants
  stockQuantity: number;
  description: string;
  fabricDetails: string;
  careInstructions: string;
  images: string[]; // Base64 strings or SVG data URLs
  isActive: boolean;
  isFeatured: boolean;
  discountPercent?: number; // Optional discount percentage (e.g. 10 or 15)
}

export interface CartItem {
  id: string; // Unique ID combining product.id + size + color + waist
  product: Product;
  selectedSize: string;
  selectedColor: string;
  selectedWaist?: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  waist?: string;
  image: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  deliveryAddress: string;
  city: string;
  area: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: string; // 'COD' as default
  status: OrderStatus;
  date: string; // ISO string
}

export interface Customer {
  email: string;
  name: string;
  phone: string;
  whatsapp: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string;
}

export interface AdminSettings {
  storeContact: string;
  storeWhatsapp: string;
  storeEmail: string;
  deliveryChargeFlat: number;
  areas: string[];
  emailjsServiceId?: string;
  emailjsTemplateId?: string;
  emailjsPublicKey?: string;
  // Automated WhatsApp Gateway configurations
  enableWhatsappApi?: boolean;
  whatsappApiGateway?: 'ultramsg' | 'greenapi' | 'custom';
  whatsappApiInstanceId?: string;
  whatsappApiToken?: string;
  // Branding Configurations
  brandName?: string;
  tagline?: string;
}

export interface User {
  email: string;
  name: string;
  phone: string;
  whatsapp: string;
  password?: string;
}
