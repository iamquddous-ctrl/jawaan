/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Confirmation from './components/Confirmation';
import Account from './components/Account';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import { seedProducts, defaultSettings } from './data';
import { Product, CartItem, Order, AdminSettings, Category, User, OrderItem } from './types';
import { Filter, Sparkles, SlidersHorizontal, Grid } from 'lucide-react';
import { sendAutomatedWhatsAppMessage } from './whatsappService';


export default function App() {
  // --- IN-MEMORY & LOCAL STORAGE SYNCHRONIZATION ---
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // --- ROUTING / VIEW STATE ---
  const [currentView, setCurrentView] = useState<'home' | 'category' | 'detail' | 'cart' | 'checkout' | 'confirmation' | 'account' | 'admin'>('home');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedSubtype, setSelectedSubtype] = useState<string | 'All'>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminModeEnabled, setAdminModeEnabled] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    // Products
    const storedProducts = localStorage.getItem('jawan_products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      setProducts(seedProducts);
      localStorage.setItem('jawan_products', JSON.stringify(seedProducts));
    }

    // Settings
    const storedSettings = localStorage.getItem('jawan_settings');
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        const updated = {
          ...defaultSettings,
          ...parsed
        };
        // Auto-enable and auto-configure active Instance ID if not set
        updated.enableWhatsappApi = true;
        if (!updated.whatsappApiInstanceId || updated.whatsappApiInstanceId === '') {
          updated.whatsappApiInstanceId = 'instance184982';
        }
        setSettings(updated);
        localStorage.setItem('jawan_settings', JSON.stringify(updated));
      } catch (e) {
        const initial = { ...defaultSettings, enableWhatsappApi: true, whatsappApiInstanceId: 'instance184982' };
        setSettings(initial);
        localStorage.setItem('jawan_settings', JSON.stringify(initial));
      }
    } else {
      const initial = { ...defaultSettings, enableWhatsappApi: true, whatsappApiInstanceId: 'instance184982' };
      setSettings(initial);
      localStorage.setItem('jawan_settings', JSON.stringify(initial));
    }

    // Orders
    const storedOrders = localStorage.getItem('jawan_orders');
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    } else {
      // Seed default mock orders for admin demonstration
      const initialMockOrders: Order[] = [
        {
          id: 'JW_921',
          customerName: 'Sarah Khan',
          phone: '+92 321 4455667',
          whatsapp: '+92 321 4455667',
          email: 'sarah.k@gmail.com',
          deliveryAddress: 'House 23, Block 4, DHA Phase 6',
          city: 'Karachi',
          area: 'DHA Phase 6',
          items: [
            {
              productId: 'p1',
              productName: 'Jawan Signature Polo',
              price: 1850.00,
              quantity: 2,
              size: '7-8yr',
              color: 'Navy Blue',
              image: seedProducts[0].images[0]
            }
          ],
          subtotal: 3700.00,
          deliveryCharge: 250.00,
          total: 3950.00,
          paymentMethod: 'Cash on Delivery (COD)',
          status: 'Delivered',
          date: '2026-07-10T10:30:00Z'
        },
        {
          id: 'JW_922',
          customerName: 'Zain Ahmed',
          phone: '+92 300 9876543',
          whatsapp: '+92 300 9876543',
          email: 'zain_ahmed@yahoo.com',
          deliveryAddress: 'Apartment B-12, Gulberg Green Towers',
          city: 'Lahore',
          area: 'Gulberg',
          items: [
            {
              productId: 'p4',
              productName: 'Streetwear Baggy Cargo Trousers',
              price: 2800.00,
              quantity: 1,
              size: '9-10yr',
              color: 'Olive Green',
              image: seedProducts[3].images[0]
            }
          ],
          subtotal: 2800.00,
          deliveryCharge: 250.00,
          total: 3050.00,
          paymentMethod: 'Cash on Delivery (COD)',
          status: 'Pending',
          date: '2026-07-13T16:45:00Z'
        }
      ];
      setOrders(initialMockOrders);
      localStorage.setItem('jawan_orders', JSON.stringify(initialMockOrders));
    }

    // Active User session
    const storedUser = localStorage.getItem('jawan_currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    // Active Cart
    const storedCart = localStorage.getItem('jawan_cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Listen for hash routing (e.g. #JawanAdmin or #admin)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#jawanadmin' || hash === '#admin') {
        setAdminModeEnabled(true);
        setCurrentView('admin');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Run on load

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync state to local storage helper functions
  const updateLocalProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('jawan_products', JSON.stringify(newProducts));
  };

  const updateLocalOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem('jawan_orders', JSON.stringify(newOrders));
  };

  const updateLocalSettings = (newSettings: AdminSettings) => {
    setSettings(newSettings);
    localStorage.setItem('jawan_settings', JSON.stringify(newSettings));
  };

  // --- CART MANAGEMENT OPERATIONS ---
  const handleAddToCart = (product: Product, size: string, color: string, quantity: number = 1, waist?: string) => {
    const itemId = waist ? `${product.id}-${size}-${color}-${waist}` : `${product.id}-${size}-${color}`;
    let updatedCart = [...cart];
    const existingIndex = cart.findIndex(item => item.id === itemId);

    if (existingIndex > -1) {
      // Add quantity to existing cart record
      const newQuantity = updatedCart[existingIndex].quantity + quantity;
      // Guard stock limits
      if (newQuantity <= product.stockQuantity) {
        updatedCart[existingIndex].quantity = newQuantity;
      } else {
        updatedCart[existingIndex].quantity = product.stockQuantity;
      }
    } else {
      // Fresh add
      updatedCart.push({
        id: itemId,
        product,
        selectedSize: size,
        selectedColor: color,
        selectedWaist: waist,
        quantity: Math.min(quantity, product.stockQuantity)
      });
    }

    setCart(updatedCart);
    localStorage.setItem('jawan_cart', JSON.stringify(updatedCart));
  };

  const handleUpdateCartQuantity = (itemId: string, newQuantity: number) => {
    const updatedCart = cart.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: Math.min(newQuantity, item.product.stockQuantity)
        };
      }
      return item;
    });
    setCart(updatedCart);
    localStorage.setItem('jawan_cart', JSON.stringify(updatedCart));
  };

  const handleRemoveCartItem = (itemId: string) => {
    const updatedCart = cart.filter(item => item.id !== itemId);
    setCart(updatedCart);
    localStorage.setItem('jawan_cart', JSON.stringify(updatedCart));
  };

  // --- ORDER PLACEMENT AND NOTIFICATION TRIGGER ---
  const handlePlaceOrder = async (orderData: Omit<Order, 'id' | 'date' | 'status'>) => {
    // Generate order receipt ID
    const orderId = 'JW_' + Math.floor(100 + Math.random() * 900) + Date.now().toString().slice(-4);
    
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      status: 'Pending',
      date: new Date().toISOString()
    };

    // Deduct stock quantities for purchased items
    const updatedProducts = products.map(prod => {
      const orderItem = orderData.items.find(it => it.productId === prod.id);
      if (orderItem) {
        const remainingStock = Math.max(0, prod.stockQuantity - orderItem.quantity);
        return {
          ...prod,
          stockQuantity: remainingStock
        };
      }
      return prod;
    });

    // Update global databases
    updateLocalProducts(updatedProducts);
    updateLocalOrders([newOrder, ...orders]);

    // Clear cart
    setCart([]);
    localStorage.removeItem('jawan_cart');

    // Save context for confirmation receipt
    setLastPlacedOrder(newOrder);
    setCurrentView('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // AUTOMATED BACKGROUND WHATSAPP DISPATCH
    if (settings.enableWhatsappApi) {
      console.log(`[WhatsApp API Trigger] Attempting automated background dispatch for Order #${orderId}`);
      const itemsListText = newOrder.items.map(it => `- ${it.productName} (Size: ${it.size.toUpperCase()}, Color: ${it.color}, Qty: ${it.quantity})`).join('\n');
      
      // 1. Message to Customer
      const customerMsg = `Hello *${newOrder.customerName}*! 👋\n\nThank you for shopping with *${settings.brandName || 'Jawan'}*! We have successfully received your order *#${newOrder.id}*.\n\n*Order Details:*\n${itemsListText}\n\n*Cart Subtotal:* Rs. ${newOrder.subtotal.toLocaleString()}\n*Delivery Charge:* Rs. ${newOrder.deliveryCharge.toLocaleString()}\n*Total Payable:* Rs. ${newOrder.total.toLocaleString()} (Cash on Delivery)\n*Shipping Address:* ${newOrder.deliveryAddress}, ${newOrder.city}\n\nWe will review and dispatch your order shortly! Thank you! 😊`;
      
      // 2. Message to Admin
      const adminMsg = `🔔 *New Order Alert #${newOrder.id}* 🔔\n\n*Customer:* ${newOrder.customerName}\n*Phone:* ${newOrder.phone}\n*WhatsApp:* ${newOrder.whatsapp}\n*City:* ${newOrder.city}\n*Address:* ${newOrder.deliveryAddress}\n\n*Ordered Items:*\n${itemsListText}\n\n*Total Payable:* Rs. ${newOrder.total.toLocaleString()} (COD)`;

      // Run dispatches in background without blocking UI
      Promise.all([
        // Send to Customer
        sendAutomatedWhatsAppMessage({
          to: newOrder.whatsapp,
          message: customerMsg,
          settings
        }),
        // Send to Admin
        sendAutomatedWhatsAppMessage({
          to: settings.storeWhatsapp,
          message: adminMsg,
          settings
        })
      ]).then(([customerRes, adminRes]) => {
        console.log('[WhatsApp API Result] Customer dispatch:', customerRes, 'Admin dispatch:', adminRes);
      }).catch(err => {
        console.error('[WhatsApp API Error] Async execution failed:', err);
      });
    }

    // EMAILJS NOTIFICATION PIPELINE (PRESET)
    const serviceId = settings.emailjsServiceId || 'service_jawan';
    const templateId = settings.emailjsTemplateId || 'template_jawan';
    const publicKey = settings.emailjsPublicKey || 'user_jawan_public_key';

    console.log(`[EmailJS Trigger] Attempting delivery confirmation dispatch for Order #${orderId} to ${newOrder.email}`);
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: {
            to_name: newOrder.customerName,
            order_id: newOrder.id,
            to_email: newOrder.email,
            total_price: `Rs. ${newOrder.total.toLocaleString()}`,
            shipping_address: `${newOrder.deliveryAddress}, ${newOrder.city}`,
            items_list: newOrder.items.map(it => `${it.productName} (${it.quantity}x) — Size: ${it.size}, Color: ${it.color}`).join(', ')
          }
        })
      });
      if (response.ok) {
        console.log('[EmailJS Trigger] Confirmation email dispatched successfully!');
      } else {
        const errorText = await response.text();
        console.warn(`[EmailJS Notification] Mail server replied with status ${response.status}: ${errorText}`);
      }
    } catch (e) {
      console.error('[EmailJS Failure] Request failed:', e);
    }
  };

  // Quick CTA navigation for detail buy now
  const handleBuyNowTrigger = (product: Product, size: string, color: string, quantity: number, waist?: string) => {
    // Add to cart directly
    handleAddToCart(product, size, color, quantity, waist);
    // Navigate straight to checkout
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigation Orchestrator
  const handleNavigate = (view: typeof currentView, category?: Category) => {
    if (category) {
      setSelectedCategory(category);
      setSelectedSubtype('All');
    }
    setCurrentView(view);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Logout clean
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('jawan_currentUser');
    handleNavigate('home');
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('jawan_currentUser', JSON.stringify(user));
    handleNavigate('home');
  };

  // --- DYNAMIC CATALOG FILTER LOGIC ---
  // Customers only browse active products, Admin views everything
  const activeProductsPool = products.filter(p => p.isActive);

  // Search logic filter
  const filteredProductsBySearch = activeProductsPool.filter(p => {
    const query = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.subtype.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  });

  // Category and subtype logic filter
  const finalFilteredProducts = filteredProductsBySearch.filter(p => {
    if (selectedCategory === 'All') return true;
    if (p.category !== selectedCategory) return false;
    if (selectedSubtype === 'All') return true;
    return p.subtype === selectedSubtype;
  });

  // Featured list for Homepage
  const featuredProducts = activeProductsPool.filter(p => p.isFeatured);

  // Get current subtypes of selected category for sub-navigation tabs
  const getSubtypesForCategory = (cat: Category): string[] => {
    switch (cat) {
      case 'Shirts': return ['Polo Shirts', 'Dress Shirts', 'Casual Shirts'];
      case 'Trousers': return ['Baggy Pants', 'Cargo Trousers', 'Formal Trousers'];
      case 'Pants': return ['Jeans', 'Joggers', 'Chinos'];
      default: return [];
    }
  };

  const currentCategorySubtypes = selectedCategory !== 'All' ? getSubtypesForCategory(selectedCategory) : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 antialiased">
      
      {/* Top Header */}
      <Header
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          if (currentView !== 'category' && currentView !== 'home') {
            setCurrentView('home');
          }
        }}
        onNavigate={handleNavigate}
        currentView={currentView}
        selectedCategory={selectedCategory}
        currentUser={currentUser}
        onLogout={handleLogout}
        isAdminMode={adminModeEnabled}
        brandName={settings.brandName}
        tagline={settings.tagline}
      />

      {/* Main Container Wrapper */}
      <main className="flex-1">
        
        {/* HOMEPAGE VIEW */}
        {currentView === 'home' && !searchQuery && (
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 py-6">
            
            {/* Hero collection */}
            <Hero onNavigateToCategory={(cat) => handleNavigate('category', cat)} />

            {/* Featured Section */}
            {featuredProducts.length > 0 && (
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-bold text-[#E6A11E] tracking-widest uppercase block mb-1">
                      Chosen Styles // Summer &apos;26
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
                      <Sparkles className="h-5.5 w-5.5 text-[#E6A11E]" />
                      <span>Best Selling Outfits</span>
                    </h2>
                  </div>
                  <button 
                    onClick={() => handleNavigate('category', 'Shirts')}
                    className="text-xs font-bold text-[#1B2A4A] hover:text-[#E6A11E] underline transition-colors"
                  >
                    View All Products
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {featuredProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onSelectProduct={(prod) => {
                        setSelectedProduct(prod);
                        setCurrentView('detail');
                        window.scrollTo({ top: 0 });
                      }}
                      onAddToCart={(prod, sz, col) => handleAddToCart(prod, sz, col, 1)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Aesthetic boys fashion guarantee */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden border border-white/5">
              <div className="absolute -right-12 -bottom-12 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
              <div className="absolute -left-12 -top-12 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
              
              <div className="relative z-10 max-w-3xl space-y-5">
                <span className="text-[9px] font-black tracking-widest text-amber-400 uppercase bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-full inline-block">
                  Durable playground-ready standards
                </span>
                <h3 className="text-3xl sm:text-4xl font-black font-display uppercase tracking-tight">
                  Hypoallergenic wash-tested fabrics.
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-2xl">
                  We understand boys love running, sliding, and getting into adventures. Every single Jawan seam is reinforced with double locking-thread, colored with eco-safe hypoallergenic dye, and tested for extreme friction to guarantee zero shrinking.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* SEARCHING OR CATEGORY VIEW */}
        {(currentView === 'category' || (currentView === 'home' && searchQuery)) && (
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
            
            {/* Filter title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-4">
              <div>
                <span className="text-[10px] font-extrabold text-[#E6A11E] tracking-widest uppercase">
                  {selectedCategory === 'All' ? 'Complete Collection' : `Category: ${selectedCategory}`}
                </span>
                <h1 className="text-2xl font-black text-slate-900 mt-1">
                  {searchQuery 
                    ? `Search results for &apos;${searchQuery}&apos;` 
                    : selectedCategory === 'All' 
                      ? 'Browse All Clothes' 
                      : `${selectedCategory} Collection`
                  }
                </h1>
              </div>

              {/* Counts */}
              <span className="text-xs font-bold text-slate-500">
                Showing {finalFilteredProducts.length} premium designs
              </span>
            </div>

            {/* Sub-navigation categories chips */}
            {selectedCategory !== 'All' && !searchQuery && currentCategorySubtypes.length > 0 && (
              <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
                <span className="text-[10px] text-slate-400 font-extrabold flex items-center space-x-1 uppercase mr-2 select-none shrink-0 tracking-wider">
                  <Filter className="h-3.5 w-3.5" />
                  <span>Subtype:</span>
                </span>
                <button
                  onClick={() => setSelectedSubtype('All')}
                  className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-all duration-300 border cursor-pointer ${
                    selectedSubtype === 'All'
                      ? 'bg-amber-400 text-slate-950 border-transparent shadow-[0_4px_15px_rgba(230,161,30,0.25)]'
                      : 'bg-white text-slate-700 border-slate-100 hover:border-slate-300'
                  }`}
                >
                  All {selectedCategory}
                </button>
                {currentCategorySubtypes.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubtype(sub)}
                    className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-all duration-300 border cursor-pointer ${
                      selectedSubtype === sub
                        ? 'bg-amber-400 text-slate-950 border-transparent shadow-[0_4px_15px_rgba(230,161,30,0.25)]'
                        : 'bg-white text-slate-700 border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}

            {/* Empty filter results */}
            {finalFilteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-100">
                <p className="text-sm font-semibold text-slate-500 mb-4">No clothes found matching your current filter.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedSubtype('All');
                    setSearchQuery('');
                  }}
                  className="rounded-lg bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-[#1B2A4A]"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              /* Products Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {finalFilteredProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onSelectProduct={(prod) => {
                      setSelectedProduct(prod);
                      setCurrentView('detail');
                      window.scrollTo({ top: 0 });
                    }}
                    onAddToCart={(prod, sz, col) => handleAddToCart(prod, sz, col, 1)}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* DETAIL PAGE VIEW */}
        {currentView === 'detail' && selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            allProducts={products}
            onBack={() => handleNavigate('category', selectedProduct.category)}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNowTrigger}
            onSelectProduct={(p) => {
              setSelectedProduct(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* CART VIEW */}
        {currentView === 'cart' && (
          <Cart
            cart={cart}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onCheckout={() => handleNavigate('checkout')}
            onContinueShopping={() => handleNavigate('home')}
          />
        )}

        {/* SECURE CHECKOUT VIEW */}
        {currentView === 'checkout' && (
          <Checkout
            cart={cart}
            settings={settings}
            currentUser={currentUser}
            onPlaceOrder={handlePlaceOrder}
            onBackToCart={() => handleNavigate('cart')}
          />
        )}

        {/* RECEIPT / SUCCESS VIEW */}
        {currentView === 'confirmation' && lastPlacedOrder && (
          <Confirmation
            order={lastPlacedOrder}
            settings={settings}
            onReturnHome={() => handleNavigate('home')}
          />
        )}

        {/* CUSTOMER PORTAL / ORDERS PAGE */}
        {currentView === 'account' && (
          <Account
            currentUser={currentUser}
            orders={orders}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onRegister={(u) => {
              setCurrentUser(u);
              localStorage.setItem('jawan_currentUser', JSON.stringify(u));
              handleNavigate('account');
            }}
          />
        )}

        {/* SECURE ADMIN PANEL */}
        {currentView === 'admin' && (
          <AdminPanel
            products={products}
            orders={orders}
            settings={settings}
            onUpdateProducts={updateLocalProducts}
            onUpdateOrders={updateLocalOrders}
            onUpdateSettings={updateLocalSettings}
          />
        )}

      </main>

      {/* Discrete Footer access portal */}
      <Footer 
        brandName={settings.brandName}
        tagline={settings.tagline}
        onSecretAdminClick={() => {
          setAdminModeEnabled(true);
          setCurrentView('admin');
          window.location.hash = '#JawanAdmin';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} 
      />

    </div>
  );
}
