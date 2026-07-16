/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, Order, AdminSettings, Customer, OrderStatus } from '../types';
import { 
  Lock, LayoutDashboard, Plus, Edit, Trash2, ClipboardList, 
  Users, Settings, DollarSign, ShoppingCart, AlertTriangle, 
  Check, Eye, EyeOff, X, FileEdit, Upload, Sparkles, Send, BellDot
} from 'lucide-react';
import { generateClothingSvg } from '../data';
import { sendAutomatedWhatsAppMessage } from '../whatsappService';

// Helper to cleanly format WhatsApp numbers internationally (specifically handling local Pakistani phone formats starting with 0 or missing country code)
const formatWhatsAppNumber = (num: string): string => {
  if (!num) return '';
  let cleaned = num.replace(/[^0-9]/g, ''); // strip all non-digits
  
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }
  
  if (cleaned.startsWith('0')) {
    cleaned = '92' + cleaned.substring(1);
  }
  
  if (cleaned.length === 10 && cleaned.startsWith('3')) {
    cleaned = '92' + cleaned;
  }
  
  return cleaned;
};

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  settings: AdminSettings;
  onUpdateProducts: (newProducts: Product[]) => void;
  onUpdateOrders: (newOrders: Order[]) => void;
  onUpdateSettings: (newSettings: AdminSettings) => void;
}

export default function AdminPanel({
  products,
  orders,
  settings,
  onUpdateProducts,
  onUpdateOrders,
  onUpdateSettings
}: AdminPanelProps) {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Admin Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'customers' | 'branding' | 'settings'>('dashboard');

  // Product CRUD states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newProductData, setNewProductData] = useState<Omit<Product, 'id'>>({
    name: '',
    category: 'Shirts',
    subtype: 'Polo Shirts',
    price: 25.00,
    sizes: ['5-6yr', '7-8yr', '9-10yr', '11-12yr'],
    colors: ['Navy Blue', 'Mustard Yellow', 'White'],
    waistInches: [],
    stockQuantity: 15,
    description: '',
    fabricDetails: '100% Premium Cotton',
    careInstructions: 'Machine wash cold.',
    images: [],
    isActive: true,
    isFeatured: false,
    discountPercent: 0
  });

  // Image Upload helper
  const [imageUploadPreview, setImageUploadPreview] = useState<string>('');

  // Selected Order Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Automated WhatsApp Dispatcher Modal state
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchOrder, setDispatchOrder] = useState<Order | null>(null);
  const [dispatchStatus, setDispatchStatus] = useState<'sending' | 'success' | 'failed'>('sending');
  const [dispatchErrorMessage, setDispatchErrorMessage] = useState('');
  const [dispatchMessageText, setDispatchMessageText] = useState('');
  const [dispatchModalTitle, setDispatchModalTitle] = useState('');
  const [copiedText, setCopiedText] = useState(false);

  // Temporary configuration states for instant setup in the dispatch assistant modal
  const [tempInstanceId, setTempInstanceId] = useState(settings.whatsappApiInstanceId || 'instance184982');
  const [tempToken, setTempToken] = useState(settings.whatsappApiToken || '');

  // Settings editing states
  const [storeContact, setStoreContact] = useState(settings.storeContact);
  const [storeWhatsapp, setStoreWhatsapp] = useState(settings.storeWhatsapp);
  const [storeEmail, setStoreEmail] = useState(settings.storeEmail);
  const [deliveryChargeFlat, setDeliveryChargeFlat] = useState(settings.deliveryChargeFlat);
  const [emailjsServiceId, setEmailjsServiceId] = useState(settings.emailjsServiceId || 'service_jawan');
  const [emailjsTemplateId, setEmailjsTemplateId] = useState(settings.emailjsTemplateId || 'template_jawan');
  const [emailjsPublicKey, setEmailjsPublicKey] = useState(settings.emailjsPublicKey || 'user_jawan_public_key');
  const [enableWhatsappApi, setEnableWhatsappApi] = useState(settings.enableWhatsappApi || false);
  const [whatsappApiGateway, setWhatsappApiGateway] = useState<Required<AdminSettings>['whatsappApiGateway']>(settings.whatsappApiGateway || 'ultramsg');
  const [whatsappApiInstanceId, setWhatsappApiInstanceId] = useState(settings.whatsappApiInstanceId || '');
  const [whatsappApiToken, setWhatsappApiToken] = useState(settings.whatsappApiToken || '');
  const [newArea, setNewArea] = useState('');
  const [areasList, setAreasList] = useState<string[]>(settings.areas);
  const [brandName, setBrandName] = useState(settings.brandName || 'JAWAN');
  const [tagline, setTagline] = useState(settings.tagline || 'Premium Clothes for Boys');

  // Synchronize local state with settings prop changes
  useEffect(() => {
    setStoreContact(settings.storeContact);
    setStoreWhatsapp(settings.storeWhatsapp);
    setStoreEmail(settings.storeEmail);
    setDeliveryChargeFlat(settings.deliveryChargeFlat);
    setEmailjsServiceId(settings.emailjsServiceId || 'service_jawan');
    setEmailjsTemplateId(settings.emailjsTemplateId || 'template_jawan');
    setEmailjsPublicKey(settings.emailjsPublicKey || 'user_jawan_public_key');
    setEnableWhatsappApi(settings.enableWhatsappApi || false);
    setWhatsappApiGateway(settings.whatsappApiGateway || 'ultramsg');
    setWhatsappApiInstanceId(settings.whatsappApiInstanceId || '');
    setWhatsappApiToken(settings.whatsappApiToken || '');
    setAreasList(settings.areas || []);
    setTempInstanceId(settings.whatsappApiInstanceId || 'instance184982');
    setTempToken(settings.whatsappApiToken || '');
    setBrandName(settings.brandName || 'JAWAN');
    setTagline(settings.tagline || 'Premium Clothes for Boys');
  }, [settings]);

  // AUTH HANDLE
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'Jawani/2026.07/15') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Incorrect passcode. Please check with the owner.');
    }
  };

  // KPI calculations
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const lowStockProducts = products.filter(p => p.stockQuantity <= 10 && p.isActive);

  // CUSTOMERS LOG GENERATOR (Derived from orders)
  const customersMap = new Map<string, Customer>();
  orders.forEach(order => {
    const key = order.email.toLowerCase();
    const existing = customersMap.get(key);
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += order.total;
      if (new Date(order.date) > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = order.date;
      }
    } else {
      customersMap.set(key, {
        email: order.email,
        name: order.customerName,
        phone: order.phone,
        whatsapp: order.whatsapp,
        orderCount: 1,
        totalSpent: order.total,
        lastOrderDate: order.date
      });
    }
  });
  const customersList = Array.from(customersMap.values());

  // ORDER STATUS CHANGE
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        const upOrder = { ...o, status: newStatus };
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(upOrder);
        }

        // AUTOMATED DISPATCH: Send WhatsApp background API if enabled, otherwise fallback to wa.me window.open
        const itemsList = o.items.map(it => `- ${it.productName} (Qty: ${it.quantity}, Size: ${it.size.toUpperCase()}${it.waist ? `, Waist: ${it.waist}"` : ''}, Color: ${it.color})`).join('\n');
        let textMessage = '';

        const currentBrand = settings.brandName || 'Jawan';

        if (newStatus === 'Confirmed') {
          textMessage = `Hello *${o.customerName}*! 👋\n\nThis is the administrator desk at *${currentBrand}*.\n\nYour order *#${o.id}* has been *CONFIRMED*! 🎉\n\n*Order Details:*\n${itemsList}\n\n*Total Bill (COD):* Rs. ${o.total.toLocaleString()}\n*Shipping Address:* ${o.deliveryAddress}, ${o.city}\n\nWe are preparing your items for swift dispatch. Thank you for shopping with ${currentBrand}! 😊`;
        } else if (newStatus === 'Shipped') {
          textMessage = `Hello *${o.customerName}*! 👋\n\nThis is the administrator desk at *${currentBrand}*.\n\nGreat news! Your order *#${o.id}* has been *SHIPPED*! 🚚✨\n\n*Order Details:*\n${itemsList}\n\n*Total Bill (COD):* Rs. ${o.total.toLocaleString()}\n*Shipping Address:* ${o.deliveryAddress}, ${o.city}\n\nOur delivery agent will contact you shortly upon arrival. Thank you for shopping with ${currentBrand}! 💥`;
        } else if (newStatus === 'Delivered') {
          textMessage = `Hello *${o.customerName}*! 👋\n\nThis is the administrator desk at *${currentBrand}*.\n\nYour order *#${o.id}* has been successfully *DELIVERED*! 🎉📦\n\nWe hope your boy loves his new outfit! We would highly appreciate your feedback. Thank you for choosing ${currentBrand}! ❤️`;
        } else if (newStatus === 'Cancelled') {
          textMessage = `Hello *${o.customerName}*! 👋\n\nThis is the administrator desk at *${currentBrand}*.\n\nYour order *#${o.id}* has been *CANCELLED*. ❌\n\nIf this was a mistake or you wish to re-order, feel free to contact us right here. Thank you!`;
        }

        if (textMessage) {
          if (settings.enableWhatsappApi) {
            sendAutomatedWhatsAppMessage({
              to: o.whatsapp,
              message: textMessage,
              settings
            }).then(res => {
              if (res.success) {
                console.log(`[Automated WhatsApp API] Successfully sent status update: ${newStatus}`);
              } else {
                alert(`Automated WhatsApp API failed: ${res.error || 'unknown error'}.\nMessage can still be sent manually using the Send buttons.`);
              }
            });
          } else {
            const cleanedNumber = formatWhatsAppNumber(o.whatsapp);
            const waUrl = `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(textMessage)}`;
            window.open(waUrl, '_blank');
          }
        }

        return upOrder;
      }
      return o;
    });
    onUpdateOrders(updated);
  };

  // PRODUCT CRUD IMPLEMENTATIONS
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setNewProductData({
      name: '',
      category: 'Shirts',
      subtype: 'Polo Shirts',
      price: 25.00,
      sizes: ['5-6yr', '7-8yr', '9-10yr', '11-12yr'],
      colors: ['Navy Blue', 'Mustard Yellow', 'White'],
      waistInches: [],
      stockQuantity: 15,
      description: '',
      fabricDetails: '100% Cotton',
      careInstructions: 'Machine wash cold.',
      images: [],
      isActive: true,
      isFeatured: false,
      discountPercent: 0
    });
    setImageUploadPreview('');
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setNewProductData({
      name: product.name,
      category: product.category,
      subtype: product.subtype,
      price: product.price,
      sizes: product.sizes,
      colors: product.colors,
      waistInches: product.waistInches || [],
      stockQuantity: product.stockQuantity,
      description: product.description,
      fabricDetails: product.fabricDetails,
      careInstructions: product.careInstructions,
      images: product.images,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      discountPercent: product.discountPercent || 0
    });
    setImageUploadPreview(product.images[0] || '');
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const filtered = products.filter(p => p.id !== productId);
      onUpdateProducts(filtered);
    }
  };

  const handleImageFileChangeAtIndex = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setNewProductData(prev => {
          const updatedImages = [...(prev.images || [])];
          updatedImages[index] = base64String;
          return {
            ...prev,
            images: updatedImages
          };
        });
        if (index === 0 || !imageUploadPreview) {
          setImageUploadPreview(base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImageAtIndex = (index: number) => {
    setNewProductData(prev => {
      const updatedImages = [...(prev.images || [])];
      updatedImages.splice(index, 1);
      if (index === 0) {
        setImageUploadPreview(updatedImages[0] || '');
      }
      return {
        ...prev,
        images: updatedImages
      };
    });
  };

  const handleGenerateMockSvg = () => {
    const mockImage = generateClothingSvg(newProductData.subtype || newProductData.name, newProductData.colors[0] || 'Navy Blue');
    setImageUploadPreview(mockImage);
    
    // Generate SVG for each selected color to populate images array
    const colorImages = newProductData.colors.map(col => generateClothingSvg(newProductData.subtype || newProductData.name, col));
    setNewProductData(prev => ({
      ...prev,
      images: colorImages.slice(0, 3)
    }));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fallback: If no image uploaded, generate standard mock illustration automatically
    let productImages = newProductData.images;
    if (productImages.length === 0) {
      productImages = newProductData.colors.map(col => generateClothingSvg(newProductData.subtype || newProductData.name, col));
    }

    const productToSave = {
      ...newProductData,
      discountPercent: newProductData.discountPercent && Number(newProductData.discountPercent) > 0 
        ? Number(newProductData.discountPercent) 
        : undefined
    };

    if (editingProduct) {
      // Edit
      const updated = products.map(p => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            ...productToSave,
            images: productImages
          };
        }
        return p;
      });
      onUpdateProducts(updated);
    } else {
      // Add
      const newProd: Product = {
        ...productToSave,
        id: 'p_' + Date.now(),
        images: productImages
      };
      onUpdateProducts([newProd, ...products]);
    }

    setIsProductModalOpen(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      storeContact,
      storeWhatsapp,
      storeEmail,
      deliveryChargeFlat,
      areas: areasList,
      emailjsServiceId,
      emailjsTemplateId,
      emailjsPublicKey,
      enableWhatsappApi,
      whatsappApiGateway,
      whatsappApiInstanceId,
      whatsappApiToken,
      brandName,
      tagline
    });
    alert('Admin Settings successfully updated!');
  };

  const handleAddArea = () => {
    if (newArea && !areasList.includes(newArea)) {
      const list = [...areasList, newArea];
      setAreasList(list);
      setNewArea('');
    }
  };

  const handleRemoveArea = (area: string) => {
    const list = areasList.filter(a => a !== area);
    setAreasList(list);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // WHATSAPP TRIGGER BUILDERS FOR ADMIN (AUTOMATED SENDS WITH SECURE DISPATCH ASSIST)
  const handleSendWhatsAppConfirmation = (order: Order) => {
    const currentBrand = settings.brandName || 'Jawan';
    const itemsList = order.items.map(it => `- ${it.productName} (Qty: ${it.quantity}, Size: ${it.size.toUpperCase()}${it.waist ? `, Waist: ${it.waist}"` : ''}, Color: ${it.color})`).join('\n');
    const textMessage = `Hello *${order.customerName}*! 👋\n\nThis is the administrator desk at *${currentBrand}*.\n\nWe have received your order *#${order.id}* and are preparing it for shipment.\n\n*Order Details:*\n${itemsList}\n\n*Total Payable:* Rs. ${order.total.toLocaleString()} (Cash on Delivery)\n*Delivery Address:* ${order.deliveryAddress}, ${order.city}\n\nCould you please reply with *CONFIRM* to verify your shipping details so we can dispatch your parcel? Thank you! 😊`;
    
    setDispatchOrder(order);
    setDispatchMessageText(textMessage);
    setDispatchModalTitle(`Order Confirmation Message (#${order.id})`);
    setCopiedText(false);
    setIsDispatchModalOpen(true);

    if (settings.enableWhatsappApi) {
      setDispatchStatus('sending');
      setDispatchErrorMessage('');
      sendAutomatedWhatsAppMessage({
        to: order.whatsapp,
        message: textMessage,
        settings
      }).then(res => {
        if (res.success) {
          setDispatchStatus('success');
        } else {
          setDispatchStatus('failed');
          setDispatchErrorMessage(res.error || 'Server proxy failed to deliver message');
        }
      }).catch(err => {
        setDispatchStatus('failed');
        setDispatchErrorMessage(err.message || 'Network connection failed');
      });
    } else {
      setDispatchStatus('failed');
      setDispatchErrorMessage('Automated background dispatch is currently disabled in your Settings.');
    }
  };

  const handleSendWhatsAppUpdate = (order: Order) => {
    const currentBrand = settings.brandName || 'Jawan';
    const textMessage = `Hello *${order.customerName}*! 👋\n\nThis is the administrator desk at *${currentBrand}*.\n\nYour order *#${order.id}* status has been updated to *${order.status}*.\n\n*Summary:*\nTotal Amount: Rs. ${order.total.toLocaleString()} (COD)\nDestination: ${order.deliveryAddress}, ${order.city}\n\nThank you for shopping with us! 💥`;
    
    setDispatchOrder(order);
    setDispatchMessageText(textMessage);
    setDispatchModalTitle(`Order Status Update Message (#${order.id})`);
    setCopiedText(false);
    setIsDispatchModalOpen(true);

    if (settings.enableWhatsappApi) {
      setDispatchStatus('sending');
      setDispatchErrorMessage('');
      sendAutomatedWhatsAppMessage({
        to: order.whatsapp,
        message: textMessage,
        settings
      }).then(res => {
        if (res.success) {
          setDispatchStatus('success');
        } else {
          setDispatchStatus('failed');
          setDispatchErrorMessage(res.error || 'Server proxy failed to deliver message');
        }
      }).catch(err => {
        setDispatchStatus('failed');
        setDispatchErrorMessage(err.message || 'Network connection failed');
      });
    } else {
      setDispatchStatus('failed');
      setDispatchErrorMessage('Automated background dispatch is currently disabled in your Settings.');
    }
  };

  const handleCopyMessageText = () => {
    navigator.clipboard.writeText(dispatchMessageText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleSaveAndRetryDispatch = () => {
    if (!tempToken) {
      alert("Please paste your active Ultramsg API Token first.");
      return;
    }

    const updatedSettings: AdminSettings = {
      ...settings,
      enableWhatsappApi: true,
      whatsappApiGateway: 'ultramsg',
      whatsappApiInstanceId: tempInstanceId || 'instance184982',
      whatsappApiToken: tempToken
    };

    onUpdateSettings(updatedSettings);

    setWhatsappApiInstanceId(tempInstanceId || 'instance184982');
    setWhatsappApiToken(tempToken);
    setEnableWhatsappApi(true);

    setDispatchStatus('sending');
    setDispatchErrorMessage('');

    sendAutomatedWhatsAppMessage({
      to: dispatchOrder!.whatsapp,
      message: dispatchMessageText,
      settings: updatedSettings
    }).then(res => {
      if (res.success) {
        setDispatchStatus('success');
      } else {
        setDispatchStatus('failed');
        setDispatchErrorMessage(res.error || 'Server proxy failed to deliver message');
      }
    }).catch(err => {
      setDispatchStatus('failed');
      setDispatchErrorMessage(err.message || 'Network connection failed');
    });
  };

  // LOCK SCREEN UI
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-24">
        <div className="rounded-2xl border border-slate-100 bg-[#1B2A4A] p-8 text-white shadow-xl space-y-6">
          <div className="text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#E6A11E]/10 text-[#E6A11E] mb-3">
              <Lock className="h-6 w-6" />
            </span>
            <h2 className="text-2xl font-black tracking-tight">Admin Gateway</h2>
            <p className="text-xs text-gray-300 mt-1">
              Authorized access only. Enter passcode to access business dashboard.
            </p>
          </div>

          {loginError && (
            <div className="rounded-lg bg-rose-500/15 border border-rose-500/20 p-3 text-xs text-rose-300 font-semibold text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-slate-900">
            <div>
              <input
                type="password"
                required
                placeholder="Enter admin passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full rounded-lg border border-transparent bg-white/10 px-4 py-3 text-sm text-white placeholder-gray-400 focus:bg-white focus:text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E6A11E] transition-all text-center font-bold tracking-widest"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-[#E6A11E] py-2.5 text-sm font-bold text-slate-950 shadow hover:bg-[#d49015] transition-all transform active:scale-95"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Admin Title Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#1B2A4A] text-white p-6 rounded-2xl gap-4 shadow-md">
        <div className="flex items-center space-x-3.5">
          <div className="h-12 w-12 rounded-full bg-[#E6A11E]/10 text-[#E6A11E] flex items-center justify-center border border-[#E6A11E]/20">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase">{brandName || 'JAWAN'} Control Center</h1>
            <p className="text-xs text-gray-300 font-medium">Manage catalogue, sales logistics, customer details &amp; settings</p>
          </div>
        </div>

        {/* Tab navigation pill */}
        <div className="flex flex-wrap gap-1 bg-slate-900/40 p-1 rounded-lg border border-white/5">
          {(['dashboard', 'products', 'orders', 'customers', 'branding', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'bg-[#E6A11E] text-slate-950'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          
          {/* KPI GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Total Revenue */}
            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sales</span>
                <p className="text-2xl font-black text-slate-900 mt-1">Rs. {totalRevenue.toLocaleString()}</p>
              </div>
              <span className="h-11 w-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="h-5.5 w-5.5" />
              </span>
            </div>

            {/* Total Orders */}
            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Orders</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{totalOrdersCount}</p>
              </div>
              <span className="h-11 w-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingCart className="h-5.5 w-5.5" />
              </span>
            </div>

            {/* Pending Orders */}
            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Orders</span>
                <p className="text-2xl font-black text-amber-600 mt-1">{pendingOrdersCount}</p>
              </div>
              <span className="h-11 w-11 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                <ClipboardList className="h-5.5 w-5.5" />
              </span>
            </div>

            {/* Low Stock Alert count */}
            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Products</span>
                <p className={`text-2xl font-black mt-1 ${lowStockProducts.length > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-900'}`}>
                  {lowStockProducts.length}
                </p>
              </div>
              <span className={`h-11 w-11 rounded-lg flex items-center justify-center ${lowStockProducts.length > 0 ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-500'}`}>
                <AlertTriangle className="h-5.5 w-5.5" />
              </span>
            </div>

          </div>

          {/* TWO COLUMN ANALYTICS CHART SECTION (Inline CSS vector graphics) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Sales Trends visual SVG */}
            <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">Weekly Order Volume Trends</h3>
              <div className="h-52 w-full flex items-end justify-between border-b border-slate-200 pb-2 relative">
                {/* Visual gridlines */}
                <div className="absolute left-0 right-0 top-1/4 h-px bg-slate-100" />
                <div className="absolute left-0 right-0 top-2/4 h-px bg-slate-100" />
                <div className="absolute left-0 right-0 top-3/4 h-px bg-slate-100" />

                {/* Day columns */}
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                  const values = [40, 65, 35, 90, 75, 120, 110];
                  const percentage = `${(values[idx] / 120) * 100}%`;
                  return (
                    <div key={day} className="flex flex-col items-center flex-1 h-full justify-end group z-10">
                      {/* Tooltip bar hover */}
                      <span className="text-[10px] font-bold text-slate-950 bg-slate-100 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity mb-1 shrink-0">
                        {values[idx]} ord
                      </span>
                      <div 
                        className="w-8 bg-[#1B2A4A] group-hover:bg-[#E6A11E] rounded-t-md transition-all shrink-0" 
                        style={{ height: percentage }}
                      />
                      <span className="text-[10px] text-gray-400 font-bold mt-2 shrink-0">{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Performance Share */}
            <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">Product Category Distribution</h3>
              <div className="flex flex-col sm:flex-row items-center justify-around h-52">
                {/* SVG Donut representation */}
                <svg viewBox="0 0 100 100" className="h-32 w-32">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E2E8F0" strokeWidth="15" />
                  {/* Shirts slice 45% */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1B2A4A" strokeWidth="15" 
                    strokeDasharray="113 251.2" strokeDashoffset="0" />
                  {/* Trousers slice 30% */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E6A11E" strokeWidth="15" 
                    strokeDasharray="75.4 251.2" strokeDashoffset="-113" />
                  {/* Pants slice 25% */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3D5236" strokeWidth="15" 
                    strokeDasharray="62.8 251.2" strokeDashoffset="-188.4" />
                </svg>
                
                {/* Legend details */}
                <div className="space-y-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full bg-[#1B2A4A]" />
                    <span className="text-xs font-bold text-slate-700">Shirts (45%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full bg-[#E6A11E]" />
                    <span className="text-xs font-bold text-slate-700">Trousers (30%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full bg-[#3D5236]" />
                    <span className="text-xs font-bold text-slate-700">Pants (25%)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* LOW STOCK ALERTS SECTION */}
          {lowStockProducts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-extrabold text-amber-800 flex items-center space-x-2">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-600 animate-ping" />
                <span>Urgent Inventory Low Stock Alerts</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {lowStockProducts.map(p => (
                  <div key={p.id} className="bg-white border border-amber-100 p-3.5 rounded-xl flex items-center justify-between shadow-sm">
                    <div className="min-w-0 flex-1 mr-2">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">{p.category}</span>
                      <strong className="text-xs text-slate-900 block truncate" title={p.name}>{p.name}</strong>
                    </div>
                    
                    {/* Interactive stock adjuster */}
                    <div className="flex items-center space-x-1 bg-amber-50 p-1 rounded-lg border border-amber-100 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = products.map(item => 
                            item.id === p.id 
                              ? { ...item, stockQuantity: Math.max(0, item.stockQuantity - 1) } 
                              : item
                          );
                          onUpdateProducts(updated);
                        }}
                        className="h-5 w-5 bg-white rounded shadow-sm flex items-center justify-center text-slate-600 hover:bg-amber-100 hover:text-slate-900 font-black text-xs active:scale-90 transition-all cursor-pointer"
                        title="Decrease Stock"
                      >
                        -
                      </button>
                      <span className="text-xs font-black text-amber-900 w-6 text-center select-none">
                        {p.stockQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = products.map(item => 
                            item.id === p.id 
                              ? { ...item, stockQuantity: item.stockQuantity + 1 } 
                              : item
                          );
                          onUpdateProducts(updated);
                        }}
                        className="h-5 w-5 bg-white rounded shadow-sm flex items-center justify-center text-slate-600 hover:bg-amber-100 hover:text-slate-900 font-black text-xs active:scale-90 transition-all cursor-pointer"
                        title="Increase Stock"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-900">Catalogue Management ({products.length})</h2>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 rounded-lg bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-4">Item details</th>
                  <th className="p-4">Category / Type</th>
                  <th className="p-4">Sizes available</th>
                  <th className="p-4">Colors</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock Qty</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* Item details */}
                    <td className="p-4 flex items-center space-x-3 min-w-56">
                      <img src={p.images[0]} alt={p.name} className="h-10 w-10 rounded border object-contain bg-slate-50 shrink-0" />
                      <div className="min-w-0">
                        <strong className="text-slate-900 block truncate text-xs">{p.name}</strong>
                        <span className="text-[10px] text-gray-400 block">ID: {p.id}</span>
                      </div>
                    </td>

                    {/* Cat */}
                    <td className="p-4 text-xs font-bold text-slate-500 uppercase">{p.category} // {p.subtype}</td>

                    {/* Sizes */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {p.sizes.map(s => (
                          <span key={s} className="bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase">{s}</span>
                        ))}
                      </div>
                    </td>

                    {/* Colors */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {p.colors.map(col => (
                          <span key={col} className="bg-blue-50/50 text-[#1B2A4A] rounded px-1.5 py-0.5 text-[9px] font-bold">{col}</span>
                        ))}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="p-4 font-black text-[#1B2A4A]">
                      <div>Rs. {p.price.toLocaleString()}</div>
                      {p.discountPercent && p.discountPercent > 0 ? (
                        <span className="block text-[10px] text-emerald-600 font-extrabold mt-0.5">
                          {p.discountPercent}% Off
                        </span>
                      ) : null}
                    </td>

                    {/* Stock */}
                    <td className="p-4 min-w-[150px]">
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = products.map(item => 
                              item.id === p.id 
                                ? { ...item, stockQuantity: Math.max(0, item.stockQuantity - 1) } 
                                : item
                            );
                            onUpdateProducts(updated);
                          }}
                          className="h-6 w-6 rounded border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors font-bold text-xs select-none cursor-pointer"
                          title="Decrease Stock"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={p.stockQuantity}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value) || 0);
                            const updated = products.map(item => 
                              item.id === p.id 
                                ? { ...item, stockQuantity: val } 
                                : item
                            );
                            onUpdateProducts(updated);
                          }}
                          className={`w-14 rounded-lg border px-1.5 py-1 text-center text-xs font-black focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                            p.stockQuantity === 0 
                              ? 'bg-rose-50 text-rose-700 border-rose-200' 
                              : p.stockQuantity <= 10 
                                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = products.map(item => 
                              item.id === p.id 
                                ? { ...item, stockQuantity: item.stockQuantity + 1 } 
                                : item
                            );
                            onUpdateProducts(updated);
                          }}
                          className="h-6 w-6 rounded border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors font-bold text-xs select-none cursor-pointer"
                          title="Increase Stock"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => {
                          const updated = products.map(item => item.id === p.id ? { ...item, isActive: !item.isActive } : item);
                          onUpdateProducts(updated);
                        }}
                        className={`inline-flex items-center space-x-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition-colors ${
                          p.isActive 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/50' 
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200/50'
                        }`}
                      >
                        {p.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        <span>{p.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button 
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Details"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 rounded text-rose-500 hover:bg-rose-50 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-lg font-black text-slate-900">Business Logistic Orders ({orders.length})</h2>

          <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-4">Order Details</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Phone &amp; WhatsApp</th>
                  <th className="p-4">Items / Counts</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Dispatch Alerts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setSelectedOrder(o)}>
                    
                    {/* Order ID */}
                    <td className="p-4">
                      <strong className="text-slate-900 text-xs block font-bold">#{o.id}</strong>
                      <span className="text-[10px] text-gray-400 block">{new Date(o.date).toLocaleDateString()}</span>
                    </td>

                    {/* Customer */}
                    <td className="p-4 min-w-44">
                      <strong className="text-slate-900 block text-xs">{o.customerName}</strong>
                      <span className="text-[10px] text-slate-400 block truncate max-w-40">{o.email}</span>
                    </td>

                    {/* Phone */}
                    <td className="p-4">
                      <p className="text-xs text-slate-800 font-bold">{o.phone}</p>
                      <p className="text-[10px] text-slate-400">WA: {o.whatsapp}</p>
                    </td>

                    {/* Items */}
                    <td className="p-4">
                      <p className="text-xs font-semibold text-slate-800">{o.items.length} unique clothing</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-44">
                        {o.items.map(it => it.productName).join(', ')}
                      </p>
                    </td>

                    {/* Price */}
                    <td className="p-4 font-black text-[#1B2A4A]">Rs. {o.total.toLocaleString()}</td>

                    {/* Status dropdown click-stoppable */}
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                        className={`rounded-full border px-2.5 py-1 text-xs font-bold leading-none ${getStatusBadge(o.status)} focus:outline-none focus:ring-2 focus:ring-blue-100`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Whatsapp Alerts */}
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendWhatsAppConfirmation(o);
                          }}
                          className="w-full sm:w-auto inline-flex items-center justify-center space-x-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1 text-[11px] font-extrabold border border-emerald-200 transition-colors"
                          title="Send Order Invoice Confirmation via WhatsApp"
                        >
                          <Send className="h-3 w-3 shrink-0" />
                          <span>Confirm Order</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendWhatsAppUpdate(o);
                          }}
                          className="w-full sm:w-auto inline-flex items-center justify-center space-x-1 rounded-lg bg-[#E6A11E]/10 hover:bg-[#E6A11E]/20 text-[#E6A11E] px-2.5 py-1 text-[11px] font-extrabold border border-[#E6A11E]/20 transition-colors"
                          title="Send Logistical Status Update via WhatsApp"
                        >
                          <Send className="h-3 w-3 shrink-0" />
                          <span>Status Ping</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CUSTOMERS TAB */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <h2 className="text-lg font-black text-slate-900">Registered Client Logs ({customersList.length})</h2>

          <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">WhatsApp Contact</th>
                  <th className="p-4 text-center">Orders Placed</th>
                  <th className="p-4">Total Purchases</th>
                  <th className="p-4">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {customersList.map((c) => (
                  <tr key={c.email} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-extrabold text-slate-900 text-xs">{c.name}</td>
                    <td className="p-4 text-xs text-slate-500">{c.email}</td>
                    <td className="p-4 text-xs font-bold">{c.phone}</td>
                    <td className="p-4 text-xs">{c.whatsapp}</td>
                    <td className="p-4 text-center font-bold text-blue-800">{c.orderCount} purchases</td>
                    <td className="p-4 font-black text-[#1B2A4A]">Rs. {c.totalSpent.toLocaleString()}</td>
                    <td className="p-4 text-[10px] text-gray-400">{new Date(c.lastOrderDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BRANDING TAB */}
      {activeTab === 'branding' && (
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-[#E6A11E]" />
            <span>Store Branding Settings</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Form Section */}
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Brand Name
                </label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all font-bold uppercase"
                  placeholder="e.g. JAWAN"
                />
                <p className="text-[10px] text-gray-400 mt-1">This will update the top header, footer, automated messages, and receipt invoice branding.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Brand Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all"
                  placeholder="e.g. Premium Clothes for Boys"
                />
                <p className="text-[10px] text-gray-400 mt-1">Slogan or subtitle displayed underneath the main logo and in the footer.</p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto rounded-xl bg-slate-950 hover:bg-[#1B2A4A] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
                >
                  Save Branding Configuration
                </button>
              </div>
            </form>

            {/* Live Logo Preview Box */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest block">
                  Interactive Brand Header Preview
                </span>
                
                {/* Simulated Header Bar */}
                <div className="bg-[#1B2A4A] text-white p-6 rounded-xl flex items-center space-x-3 shadow-inner">
                  <div className="flex flex-col justify-center">
                    <span className="text-2xl font-black tracking-wider leading-none uppercase">
                      {brandName || 'JAWAN'}
                    </span>
                    {tagline && (
                      <span className="text-[9px] font-bold tracking-widest text-[#E6A11E] uppercase mt-1">
                        {tagline}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info block */}
                <div className="text-xs text-slate-500 space-y-2 leading-relaxed">
                  <p>✨ <strong>Real-time Synchronized Branding</strong>:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Dynamic top navigation bar header</li>
                    <li>Digital invoice receipt footer copyright and credit</li>
                    <li>Automatic WhatsApp updates sent to purchasing clients</li>
                    <li>Customer support link message generators</li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-slate-200/60 pt-4 mt-6 text-center">
                <p className="text-[10px] font-medium text-slate-400">
                  Changes persist locally via synchronized state storage.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
            <Settings className="h-5 w-5 text-[#E6A11E]" />
            <span>Store Operations Settings</span>
          </h2>

          <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Store Contact */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Admin Contact Number (Phone)
              </label>
              <input
                type="text"
                required
                value={storeContact}
                onChange={(e) => setStoreContact(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Store WhatsApp Notification contact */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Admin WhatsApp Notifications Contact
              </label>
              <input
                type="text"
                required
                value={storeWhatsapp}
                onChange={(e) => setStoreWhatsapp(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">Receives notification alerts when customers buy clothes</span>
            </div>

            {/* Store Email notifications */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Admin Business Email Address
              </label>
              <input
                type="email"
                required
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Delivery Charge */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Flat Delivery Charge Amount (Rs.)
              </label>
              <input
                type="number"
                required
                step="0.01"
                value={deliveryChargeFlat}
                onChange={(e) => setDeliveryChargeFlat(parseFloat(e.target.value))}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Automated Email Integration (EmailJS) */}
            <div className="md:col-span-2 border-t border-slate-100 pt-6 mt-4">
              <h3 className="text-sm font-black text-[#1B2A4A] uppercase tracking-wider mb-1">
                Automated Customer Email Integration (EmailJS)
              </h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Configure your free EmailJS account credentials to automatically dispatch elegant order invoices to customers immediately when they place an order.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    EmailJS Service ID
                  </label>
                  <input
                    type="text"
                    value={emailjsServiceId}
                    onChange={(e) => setEmailjsServiceId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    EmailJS Template ID
                  </label>
                  <input
                    type="text"
                    value={emailjsTemplateId}
                    onChange={(e) => setEmailjsTemplateId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    EmailJS Public Key
                  </label>
                  <input
                    type="text"
                    value={emailjsPublicKey}
                    onChange={(e) => setEmailjsPublicKey(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Automated WhatsApp Gateway Integration */}
            <div className="md:col-span-2 border-t border-slate-100 pt-6 mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-black text-[#1B2A4A] uppercase tracking-wider">
                  Automated WhatsApp API Gateway Integration
                </h3>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enableWhatsappApi}
                    onChange={(e) => setEnableWhatsappApi(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  <span className="ml-2 text-xs font-bold text-slate-700">Enable Automated Dispatch</span>
                </label>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Connect an external WhatsApp Gateway to automatically dispatch purchase confirmations and logistics status updates to your customers in the background (headless/automated send), without needing to open WhatsApp or click links.
              </p>

              {enableWhatsappApi && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 animate-fadeIn">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Gateway Provider
                    </label>
                    <select
                      value={whatsappApiGateway}
                      onChange={(e) => setWhatsappApiGateway(e.target.value as any)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-[#1B2A4A] focus:outline-none"
                    >
                      <option value="ultramsg">Ultramsg (Recommended)</option>
                      <option value="greenapi">Green-API (waInstance)</option>
                      <option value="custom">Custom JSON POST Endpoint</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {whatsappApiGateway === 'custom' ? 'Custom HTTP Endpoint URL' : 'Instance ID (e.g., instance9827)'}
                    </label>
                    <input
                      type="text"
                      required={enableWhatsappApi}
                      placeholder={whatsappApiGateway === 'custom' ? 'https://your-api.com/send' : 'instanceXXXXX'}
                      value={whatsappApiInstanceId}
                      onChange={(e) => setWhatsappApiInstanceId(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-[#1B2A4A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {whatsappApiGateway === 'custom' ? 'Optional Secret Header/Token' : 'API Token / Key'}
                    </label>
                    <input
                      type="password"
                      required={enableWhatsappApi && whatsappApiGateway !== 'custom'}
                      placeholder="Token string..."
                      value={whatsappApiToken}
                      onChange={(e) => setWhatsappApiToken(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-[#1B2A4A] focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-3 text-[11px] text-slate-400 mt-2">
                    {whatsappApiGateway === 'ultramsg' && (
                      <p>
                        💡 <strong>Ultramsg configuration guide:</strong> Create an account at <a href="https://ultramsg.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-bold">ultramsg.com</a>. Link your WhatsApp number using their QR code, then copy the <strong>Instance ID</strong> and <strong>Token</strong> from your instance console and save them above.
                      </p>
                    )}
                    {whatsappApiGateway === 'greenapi' && (
                      <p>
                        💡 <strong>Green-API configuration guide:</strong> Create an account at <a href="https://green-api.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-bold">green-api.com</a>. Copy your <strong>idInstance</strong> (placed in the Instance ID field) and <strong>apiTokenInstance</strong> (placed in the API Token field) and save them above.
                      </p>
                    )}
                    {whatsappApiGateway === 'custom' && (
                      <p>
                        💡 <strong>Custom webhook configuration:</strong> Our system will trigger a <code>POST</code> request to your custom URL containing a JSON payload: <code>{`{ "to": "923001234567", "message": "...", "token": "..." }`}</code>.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cities / Areas Management (Chips input) */}
            <div className="md:col-span-2 space-y-3">
              <label className="block text-xs font-bold text-[#1B2A4A] uppercase tracking-wider">
                Served Cities / Dispatch Localities
              </label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., Sukkhar"
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-[#1B2A4A]"
                />
                <button
                  type="button"
                  onClick={handleAddArea}
                  className="bg-slate-900 text-white rounded-lg px-4 py-2 text-xs font-bold hover:bg-slate-800 transition-all"
                >
                  Add Area
                </button>
              </div>

              {/* Area chips collection */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {areasList.map(area => (
                  <span 
                    key={area}
                    className="inline-flex items-center space-x-1.5 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs text-slate-700 font-bold"
                  >
                    <span>{area}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveArea(area)}
                      className="text-rose-500 hover:text-rose-700 hover:scale-110"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Save CTA */}
            <div className="md:col-span-2 border-t border-slate-100 pt-6">
              <button
                type="submit"
                className="rounded-lg bg-[#1B2A4A] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all"
              >
                Save Operations Settings
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT PRODUCT ================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <FileEdit className="h-5 w-5 text-[#E6A11E]" />
                <span>{editingProduct ? 'Edit Catalogue Item' : 'Add New Catalogue Item'}</span>
              </h3>
              <button 
                onClick={() => setIsProductModalOpen(false)}
                className="rounded p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Product form */}
            <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Product Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Jawan Premium Denim Jeans"
                  value={newProductData.name}
                  onChange={(e) => setNewProductData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-[#1B2A4A]"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Price (Rs.)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  placeholder="25.00"
                  value={newProductData.price}
                  onChange={(e) => setNewProductData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-[#1B2A4A]"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Category</label>
                <select
                  value={newProductData.category}
                  onChange={(e) => setNewProductData(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-white focus:outline-none"
                >
                  <option value="Shirts">Shirts</option>
                  <option value="Trousers">Trousers</option>
                  <option value="Pants">Pants</option>
                </select>
              </div>

              {/* Subtype */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Subtype / Cut</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Polo Shirts, Cargo Trousers, Jeans"
                  value={newProductData.subtype}
                  onChange={(e) => setNewProductData(prev => ({ ...prev, subtype: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-[#1B2A4A]"
                />
              </div>

              {/* Sizes chip selection */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Available Sizes (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g., 5-6yr, 7-8yr, 9-10yr"
                  value={newProductData.sizes.join(', ')}
                  onChange={(e) => setNewProductData(prev => ({ ...prev, sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-[#1B2A4A]"
                />
              </div>

              {/* Waist (inches) - only for Trousers & Pants */}
              {(newProductData.category === 'Trousers' || newProductData.category === 'Pants') && (
                <div>
                  <label className="block text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Waist Sizes (Inches, comma separated)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 24, 26, 28, 30"
                    value={newProductData.waistInches ? newProductData.waistInches.join(', ') : ''}
                    onChange={(e) => setNewProductData(prev => ({ 
                      ...prev, 
                      waistInches: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                    }))}
                    className="w-full rounded-lg border border-amber-200 bg-amber-50/20 px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>
              )}

              {/* Colors chip selection */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Available Colors (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g., Navy Blue, Mustard Yellow, White"
                  value={newProductData.colors.join(', ')}
                  onChange={(e) => setNewProductData(prev => ({ ...prev, colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-[#1B2A4A]"
                />
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Stock Quantity</label>
                <input
                  type="number"
                  required
                  placeholder="20"
                  value={newProductData.stockQuantity}
                  onChange={(e) => setNewProductData(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }))}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>

              {/* Discount Percentage */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Discount Percentage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g., 10 or 15 (0 for no discount)"
                  value={newProductData.discountPercent || 0}
                  onChange={(e) => setNewProductData(prev => ({ ...prev, discountPercent: parseInt(e.target.value) || 0 }))}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-[#1B2A4A]"
                />
              </div>

              {/* Featured toggle */}
              <div className="flex items-center space-x-6 h-full pt-4">
                <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newProductData.isFeatured}
                    onChange={(e) => setNewProductData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="rounded border-slate-300 text-blue-900 focus:ring-blue-500 h-4 w-4"
                  />
                  <span>Feature on Homepage</span>
                </label>
                <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newProductData.isActive}
                    onChange={(e) => setNewProductData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-slate-300 text-blue-900 focus:ring-blue-500 h-4 w-4"
                  />
                  <span>Active (Visible to customers)</span>
                </label>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Product Description</label>
                <textarea
                  required
                  placeholder="Full detail description..."
                  value={newProductData.description}
                  onChange={(e) => setNewProductData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:outline-none resize-none"
                />
              </div>

              {/* Fabric details */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Fabric Specifications</label>
                <input
                  type="text"
                  placeholder="e.g., 100% Cotton Twill, soft washed"
                  value={newProductData.fabricDetails}
                  onChange={(e) => setNewProductData(prev => ({ ...prev, fabricDetails: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>

              {/* Care Instructions */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Care Instructions</label>
                <input
                  type="text"
                  placeholder="e.g., Machine wash cold."
                  value={newProductData.careInstructions}
                  onChange={(e) => setNewProductData(prev => ({ ...prev, careInstructions: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>

              {/* MULTI-IMAGE GALLERY UPLOADER (UP TO 3 IMAGES) */}
              <div className="md:col-span-2 border-t border-slate-100 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Product Gallery (Up to 3 images)</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Upload photos from different angles (Main image, front, back, etc.)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateMockSvg}
                    className="inline-flex items-center justify-center space-x-1 rounded-lg border border-[#E6A11E]/20 bg-[#E6A11E]/5 hover:bg-[#E6A11E]/10 px-2.5 py-1 text-[10px] font-bold text-[#E6A11E] transition-all"
                    title="Generate vector illustrations as mock images"
                  >
                    <Sparkles className="h-3 w-3 animate-pulse text-[#E6A11E]" />
                    <span>Generate Vectors</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((idx) => {
                    const imgUrl = newProductData.images?.[idx];
                    return (
                      <div key={idx} className="relative group border border-slate-200 rounded-xl bg-slate-50/50 aspect-video md:aspect-[4/3] flex flex-col items-center justify-center overflow-hidden transition-all hover:border-[#1B2A4A] h-28 md:h-32">
                        {imgUrl ? (
                          <>
                            <img src={imgUrl} alt={`Product Angle ${idx + 1}`} className="w-full h-full object-contain p-2" />
                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1.5">
                              {/* Re-upload */}
                              <label className="p-1.5 rounded-lg bg-white/90 text-slate-700 hover:bg-white hover:text-[#1B2A4A] cursor-pointer shadow transition-all">
                                <Upload className="h-3.5 w-3.5 text-slate-500" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleImageFileChangeAtIndex(e, idx)}
                                />
                              </label>
                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => handleRemoveImageAtIndex(idx)}
                                className="p-1.5 rounded-lg bg-red-600/95 text-white hover:bg-red-600 shadow transition-all cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            {/* Tag */}
                            <div className="absolute bottom-1 right-1 bg-slate-900/75 text-[8px] text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                              {idx === 0 ? 'Main' : `Angle ${idx + 1}`}
                            </div>
                          </>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-2 text-center select-none hover:bg-slate-100/50 transition-colors">
                            <Plus className="h-4 w-4 text-slate-400 group-hover:text-[#1B2A4A] mb-1" />
                            <span className="text-[10px] font-extrabold text-slate-500 block">Upload</span>
                            <span className="text-[8px] text-slate-400 mt-0.5 font-medium block">
                              {idx === 0 ? 'Main View' : `Angle Slot ${idx + 1}`}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageFileChangeAtIndex(e, idx)}
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Save triggers */}
              <div className="md:col-span-2 border-t border-slate-100 pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-950 px-5 py-2 text-xs font-bold text-white hover:bg-[#1B2A4A]"
                >
                  Save Product
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ORDER DETAILS DRAWER ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 h-full max-h-[95vh] overflow-y-auto flex flex-col justify-between">
            
            <div className="space-y-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Order Logs Detail</h3>
                  <span className="text-xs text-gray-400 font-medium">#{selectedOrder.id} // Placed on: {new Date(selectedOrder.date).toLocaleString()}</span>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="rounded p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Customer summary */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl text-xs text-slate-700">
                <p className="font-extrabold text-slate-900 uppercase tracking-wider text-[10px] text-gray-400 border-b border-slate-200 pb-1.5">Shipping Details</p>
                <p>Name: <strong className="text-slate-950 font-bold">{selectedOrder.customerName}</strong></p>
                <p>Phone: <strong className="text-slate-950 font-bold">{selectedOrder.phone}</strong></p>
                <p>WhatsApp: <strong className="text-slate-950 font-bold">{selectedOrder.whatsapp}</strong></p>
                <p>Email: <strong className="text-slate-950 font-bold">{selectedOrder.email}</strong></p>
                <p>Address: <strong className="text-slate-950 font-bold">{selectedOrder.deliveryAddress}</strong></p>
                <p>City / Area: <strong className="text-slate-950 font-bold">{selectedOrder.city} // {selectedOrder.area}</strong></p>
                {selectedOrder.notes && (
                  <p className="mt-2 text-[11px] bg-amber-50 p-2 rounded border border-amber-100 text-amber-900 font-medium">Notes: {selectedOrder.notes}</p>
                )}
              </div>

              {/* Item breakdown */}
              <div className="space-y-3">
                <p className="font-extrabold text-slate-900 uppercase tracking-wider text-[10px] text-gray-400">Items Ordered ({selectedOrder.items.length})</p>
                <div className="divide-y divide-slate-100">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex py-2 items-center justify-between text-xs text-slate-700">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-950 truncate max-w-56">{it.productName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 flex flex-wrap gap-x-1.5 items-center">
                          <span>Size: <strong className="uppercase">{it.size}</strong></span>
                          {it.waist && (
                            <>
                              <span>//</span>
                              <span className="text-amber-800 bg-amber-50 px-1 rounded font-extrabold">Waist: {it.waist}"</span>
                            </>
                          )}
                          <span>//</span>
                          <span>Color: {it.color}</span>
                          <span>//</span>
                          <span>Qty: {it.quantity}</span>
                        </p>
                      </div>
                      <span className="font-black text-[#1B2A4A]">Rs. {(it.price * it.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculations summary */}
              <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Cart Subtotal</span>
                  <span className="font-bold text-slate-900">Rs. {selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge</span>
                  <span className="font-bold text-slate-900">Rs. {selectedOrder.deliveryCharge.toLocaleString()}</span>
                </div>
                <hr className="border-slate-100" />
                <div className="flex justify-between items-baseline">
                  <span className="font-extrabold text-slate-900">Total Bill</span>
                  <span className="text-base font-black text-[#1B2A4A]">Rs. {selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>
                    {/* Quick logistical updates */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Update Logistic Status</span>
              <div className="flex gap-2">
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-bold ${getStatusBadge(selectedOrder.status)} focus:outline-none`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={() => handleSendWhatsAppConfirmation(selectedOrder)}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-xs font-extrabold flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-95"
                  title="Send WhatsApp Invoice Confirmation"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Confirm (WA)</span>
                </button>

                <button
                  onClick={() => handleSendWhatsAppUpdate(selectedOrder)}
                  className="rounded-lg bg-[#E6A11E] text-slate-950 hover:bg-[#d49015] px-3 py-2 text-xs font-extrabold flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-95"
                  title="Send WhatsApp Status Update"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Status Update (WA)</span>
                </button>
              </div>
            </div>      </div>

          </div>
        </div>
      )}

      {/* ================= MODAL: WHATSAPP DISPATCH ASSIST ================= */}
      {isDispatchModalOpen && dispatchOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={() => setIsDispatchModalOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col space-y-4 text-left" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Send className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{dispatchModalTitle}</h3>
                  <p className="text-[10px] text-slate-400 font-medium text-left">To: {dispatchOrder.customerName} ({dispatchOrder.whatsapp})</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDispatchModalOpen(false)}
                className="rounded p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Status Indicator */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col items-center justify-center text-center py-6 space-y-3">
              {dispatchStatus === 'sending' && (
                <>
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Sending Automated Message...</p>
                    <p className="text-[10px] text-slate-400 mt-1">Connecting to gateway via backend secure proxy</p>
                  </div>
                </>
              )}

              {dispatchStatus === 'success' && (
                <>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-bounce">
                    <Check className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-xs font-black text-emerald-800">✅ Message Dispatched Successfully!</p>
                    <p className="text-[10px] text-emerald-600 mt-1">Your automated gateway accepted and delivered the WhatsApp message.</p>
                  </div>
                </>
              )}

              {dispatchStatus === 'failed' && (
                <div className="w-full flex flex-col items-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-1">
                    <AlertTriangle className="h-6 w-6" />
                  </span>
                  <div className="w-full text-center">
                    <p className="text-xs font-extrabold text-amber-800">Automated Send Unavailable/Failed</p>
                    <p className="text-[10px] text-slate-500 mt-1 px-4 leading-relaxed break-words font-medium">
                      Reason: {dispatchErrorMessage}
                    </p>
                    
                    <div className="mt-4 border-t border-dashed border-slate-200 pt-3 text-left w-full">
                      <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                        <span>Instant Ultramsg Setup</span>
                      </p>
                      <p className="text-[9.5px] text-slate-400 mt-0.5 leading-normal">
                        We pre-filled your active instance ID <strong>instance184982</strong> from your dashboard! Just paste your Ultramsg <strong>Token</strong> below to connect and send.
                      </p>
                      
                      <div className="mt-3 space-y-2.5">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[8px] font-bold text-slate-500 uppercase">Instance ID</label>
                            <input
                              type="text"
                              placeholder="e.g. instance184982"
                              value={tempInstanceId}
                              onChange={(e) => setTempInstanceId(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-bold text-slate-500 uppercase">API Token / Key</label>
                            <input
                              type="password"
                              placeholder="Paste Ultramsg token..."
                              value={tempToken}
                              onChange={(e) => setTempToken(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={handleSaveAndRetryDispatch}
                          className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 text-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-[0.98] shadow-sm"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Save Credentials &amp; Retry Send</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Message Body Preview */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Message Draft Preview</span>
                <button
                  onClick={handleCopyMessageText}
                  className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 font-bold transition-colors cursor-pointer"
                >
                  <FileEdit className="h-3.5 w-3.5" />
                  <span>{copiedText ? "Copied!" : "Copy Text"}</span>
                </button>
              </div>
              <textarea
                readOnly
                value={dispatchMessageText}
                className="w-full h-32 rounded-lg border border-slate-200 p-3 text-[11px] font-mono bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300 select-all text-left"
              />
            </div>

            {/* Fallback Manual Link & Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 text-left">
              <p className="text-[10px] text-slate-400 leading-normal max-w-full sm:max-w-[60%] text-center sm:text-left">
                If automated dispatch is disabled or failed, click "Open WhatsApp Chat" to manually launch a chat with the customer.
              </p>
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="flex-1 sm:flex-none rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                <a
                  href={`https://wa.me/${formatWhatsAppNumber(dispatchOrder.whatsapp)}?text=${encodeURIComponent(dispatchMessageText)}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    // Also close modal after launch to keep UI clean
                    setTimeout(() => setIsDispatchModalOpen(false), 800);
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 text-xs transition-colors shadow-sm cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Open WhatsApp Chat</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
