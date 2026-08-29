import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  ShieldCheck, 
  Package, 
  Clock, 
  Smartphone,
  ArrowLeft,
  Lock,
  Camera
} from 'lucide-react';
import { Product, LeadOrder, StoreSettings } from './types';
import { 
  getStoredProducts, 
  saveStoredProducts, 
  getStoredLeads, 
  saveStoredLeads, 
  addLead, 
  getStoredSettings, 
  saveStoredSettings,
  resetToDefaults
} from './services/storage';
import { sendLeadToGoogleSheet, fetchProductsFromGoogleSheet } from './services/googleSheet';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { StoreGallerySection } from './components/StoreGallerySection';
import { WarrantySection } from './components/WarrantySection';
import { CustomerDeliveryMarquee } from './components/CustomerDeliveryMarquee';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { QuickOrderModal } from './components/QuickOrderModal';
import { StoreInfoSection } from './components/StoreInfoSection';
import { AdminPanel } from './components/AdminPanel';
import { FloatingContactBar } from './components/FloatingContactBar';
import { Logo } from './components/Logo';

export default function App() {
  // Main view state: 'home' (Trang chủ thông tin) or 'products' (Cửa sổ kho máy)
  const [currentView, setCurrentView] = useState<'home' | 'products'>('home');

  // State management
  const [products, setProducts] = useState<Product[]>(() => getStoredProducts());
  const [leads, setLeads] = useState<LeadOrder[]>(() => getStoredLeads());
  const [settings, setSettings] = useState<StoreSettings>(() => getStoredSettings());

  // Filter & Search states
  const [activeSeries, setActiveSeries] = useState<string>('all');
  const [activeAvailability, setActiveAvailability] = useState<
    'all' | 'in_stock' | 'order' | 'in_stock_99' | 'in_stock_clearance' | 'order_99' | 'order_new_seal'
  >('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc'>('featured');

  // Modals state
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [quickOrderProduct, setQuickOrderProduct] = useState<Product | null>(null);
  const [quickOrderStorage, setQuickOrderStorage] = useState<string>('128GB');
  const [quickOrderColor, setQuickOrderColor] = useState<string>('Mặc định');
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Initialize and auto-sync from Google Sheet if configured
  useEffect(() => {
    const syncUrl = settings.googleSheetProductUrl || settings.googleSheetWebhookUrl;
    if (syncUrl && settings.autoSyncGoogleSheet !== false) {
      fetchProductsFromGoogleSheet(syncUrl).then((res) => {
        if (res.success && res.products && res.products.length > 0) {
          setProducts(res.products);
          saveStoredProducts(res.products);
        }
      }).catch((err) => {
        console.warn('Auto-sync from Google Sheet failed, using local data:', err);
      });
    }
  }, [settings.googleSheetProductUrl, settings.googleSheetWebhookUrl, settings.autoSyncGoogleSheet]);

  // Filtered Products Memo
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Filter by Series
      if (activeSeries !== 'all' && item.series !== activeSeries) {
        return false;
      }
      // Filter by Availability (4-tier aware)
      if (activeAvailability !== 'all') {
        if (activeAvailability === 'in_stock') {
          const isInStock = item.availability === 'in_stock' || item.availability === 'in_stock_99' || item.availability === 'in_stock_clearance';
          if (!isInStock) return false;
        } else if (activeAvailability === 'order') {
          const isOrder = item.availability === 'order' || item.availability === 'order_99' || item.availability === 'order_new_seal';
          if (!isOrder) return false;
        } else if (activeAvailability === 'in_stock_99') {
          const is99 = item.availability === 'in_stock_99' || item.availability === 'in_stock';
          if (!is99) return false;
        } else if (activeAvailability === 'in_stock_clearance') {
          if (item.availability !== 'in_stock_clearance') return false;
        } else if (activeAvailability === 'order_99') {
          if (item.availability !== 'order_99') return false;
        } else if (activeAvailability === 'order_new_seal') {
          const isSeal = item.availability === 'order_new_seal' || item.availability === 'order';
          if (!isSeal) return false;
        } else if (item.availability !== activeAvailability) {
          return false;
        }
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchSeries = item.series.toLowerCase().includes(q);
        const matchTag = item.tag?.toLowerCase().includes(q);
        if (!matchName && !matchSeries && !matchTag) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, activeSeries, activeAvailability, searchQuery, sortBy]);

  // In-stock & Order counts for 4 categories
  const inStock99Count = useMemo(() => products.filter(p => p.availability === 'in_stock_99' || p.availability === 'in_stock').length, [products]);
  const inStockClearanceCount = useMemo(() => products.filter(p => p.availability === 'in_stock_clearance').length, [products]);
  const order99Count = useMemo(() => products.filter(p => p.availability === 'order_99').length, [products]);
  const orderNewSealCount = useMemo(() => products.filter(p => p.availability === 'order_new_seal' || p.availability === 'order').length, [products]);

  // Scroll helpers
  const scrollToWarranty = () => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById('warranty-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('warranty-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToStoreInfo = () => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById('store-info-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('store-info-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigateToProducts = (series = 'all', availability: 'all' | 'in_stock' | 'order' = 'all') => {
    setActiveSeries(series);
    setActiveAvailability(availability);
    setCurrentView('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Lead / Order submission
  const handleSubmitOrder = async (data: {
    customerName: string;
    phoneNumber: string;
    interestedProduct: string;
    imei?: string;
    storageSelected?: string;
    colorSelected?: string;
    orderType: 'in_stock' | 'order' | 'consultation';
    note?: string;
  }) => {
    const newLead = addLead(data);
    setLeads(getStoredLeads());

    if (settings.googleSheetWebhookUrl) {
      sendLeadToGoogleSheet(settings.googleSheetWebhookUrl, newLead).then((res) => {
        if (res.success) {
          const updated = getStoredLeads().map(l => l.id === newLead.id ? { ...l, syncedToSheet: true } : l);
          saveStoredLeads(updated);
          setLeads(updated);
        }
      });
    }
  };

  // Quick Order Trigger from Card
  const handleQuickOrderFromCard = (product: Product, selectedStorage: string, selectedColor: string) => {
    setQuickOrderProduct(product);
    setQuickOrderStorage(selectedStorage);
    setQuickOrderColor(selectedColor);
    setIsQuickOrderOpen(true);
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    const { products: defaultProducts, settings: defaultSettings } = resetToDefaults();
    setProducts(defaultProducts);
    setSettings(defaultSettings);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col justify-between selection:bg-white selection:text-black">
      
      <div>
        {/* Top Navbar */}
        <Navbar
          settings={settings}
          currentView={currentView}
          onNavigateHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateProducts={() => handleNavigateToProducts('all', 'all')}
          onScrollToWarranty={scrollToWarranty}
          onScrollToStoreInfo={scrollToStoreInfo}
          onOpenConsultation={() => {
            setQuickOrderProduct(null);
            setIsQuickOrderOpen(true);
          }}
        />

        {/* ================= VIEW 1: TRANG CHỦ & THÔNG TIN CỬA HÀNG ================= */}
        {currentView === 'home' && (
          <main className="animate-fadeIn">
            {/* Hero Section với Thông tin cửa hàng & 2 Lựa chọn chính */}
            <HeroBanner
              settings={settings}
              onViewInventory={() => handleNavigateToProducts('all', 'all')}
              onScrollToWarranty={scrollToWarranty}
              onQuickConsultation={() => {
                setQuickOrderProduct(null);
                setIsQuickOrderOpen(true);
              }}
            />

            {/* Không gian thực tế cửa hàng Showroom */}
            <StoreGallerySection settings={settings} />

            {/* Tri Ân Khách Hàng - Ảnh Bàn Giao Máy Thực Tế */}
            <CustomerDeliveryMarquee reviews={settings.customerReviews} />

            {/* Chính Sách Bảo Hành Section */}
            <WarrantySection settings={settings} />

            {/* Store Location & Google Maps Section */}
            <StoreInfoSection settings={settings} />
          </main>
        )}

        {/* ================= VIEW 2: CỬA SỔ KHO MÁY (HIỂN THỊ TẤT CẢ DÒNG MÁY) ================= */}
        {currentView === 'products' && (
          <main className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
            
            {/* Top Navigation Bar inside Inventory Window */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentView('home')}
                  className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-bold transition-colors flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Về Trang Chủ
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    <Smartphone className="w-6 h-6 text-neutral-200" />
                    Kho Máy Táo New
                  </h1>
                  <p className="text-xs text-neutral-400">
                    Toàn bộ danh mục iPhone 11 - 17 Series & Phụ kiện Apple chính hãng
                  </p>
                </div>
              </div>

              {/* Segmented Stock Mode Toggle - 4 Availability Categories */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-900/90 rounded-2xl border border-neutral-800 text-xs">
                <button
                  onClick={() => setActiveAvailability('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    activeAvailability === 'all'
                      ? 'bg-white text-black shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Tất Cả ({products.length})
                </button>
                <button
                  onClick={() => setActiveAvailability('in_stock_99')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeAvailability === 'in_stock_99'
                      ? 'bg-emerald-400 text-black shadow-lg shadow-emerald-500/20'
                      : 'text-emerald-400 hover:bg-neutral-800'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Sẵn 99% Đẹp ({inStock99Count})
                </button>
                <button
                  onClick={() => setActiveAvailability('in_stock_clearance')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeAvailability === 'in_stock_clearance'
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                      : 'text-rose-400 hover:bg-neutral-800'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  Sẵn Thanh Lý ({inStockClearanceCount})
                </button>
                <button
                  onClick={() => setActiveAvailability('order_99')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeAvailability === 'order_99'
                      ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/20'
                      : 'text-cyan-300 hover:bg-neutral-800'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  Order 99% Lướt ({order99Count})
                </button>
                <button
                  onClick={() => setActiveAvailability('order_new_seal')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeAvailability === 'order_new_seal'
                      ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                      : 'text-amber-300 hover:bg-neutral-800'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  Order New Seal ({orderNewSealCount})
                </button>
              </div>
            </div>

            {/* Horizontal Series Chips Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {[
                { label: '⚡ Tất Cả', value: 'all' },
                { label: 'iPhone 17 Series', value: '17 Series' },
                { label: 'iPhone 16 Series', value: '16 Series' },
                { label: 'iPhone 15 Series', value: '15 Series' },
                { label: 'iPhone 14 Series', value: '14 Series' },
                { label: 'iPhone 13 Series', value: '13 Series' },
                { label: 'iPhone 12 Series', value: '12 Series' },
                { label: 'iPhone 11 Series', value: '11 Series' },
                { label: 'Phụ Kiện Apple', value: 'Phụ kiện' },
              ].map((tab) => {
                const isSelected = activeSeries === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveSeries(tab.value)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-black shadow-md'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Filter & Search Toolbar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Search Box */}
              <div className="md:col-span-8 relative">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm máy (16 Pro Max, 15 Plus, 14 Pro, 13, 11, sạc 20w...)"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#121216] border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-neutral-500 hover:text-white absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    Xóa
                  </button>
                )}
              </div>

              {/* Sort Selection */}
              <div className="md:col-span-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full py-2.5 px-3 bg-[#121216] border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-neutral-600"
                >
                  <option value="featured">Sắp xếp: Dòng Máy Nổi Bật</option>
                  <option value="price_asc">Giá: Thấp đến Cao</option>
                  <option value="price_desc">Giá: Cao đến Thấp</option>
                </select>
              </div>
            </div>

            {/* Product Cards Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 px-4 rounded-3xl bg-neutral-900/40 border border-neutral-800/80 space-y-4">
                <Package className="w-14 h-14 text-neutral-600 mx-auto" />
                <h3 className="text-lg font-bold text-white">Không tìm thấy sản phẩm phù hợp</h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  Không có máy nào khớp với từ khóa hoặc bộ lọc đã chọn. Hãy thử tìm kiếm dòng máy khác hoặc gọi hotline để được tư vấn báo giá ngay.
                </p>
                <button
                  onClick={() => { setActiveSeries('all'); setActiveAvailability('all'); setSearchQuery(''); }}
                  className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  Xem Lại Tất Cả Máy
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickOrder={handleQuickOrderFromCard}
                    onViewDetails={(p) => setSelectedProductForDetail(p)}
                  />
                ))}
              </div>
            )}

            {/* Bottom Quick Return to Homepage Bar */}
            <div className="pt-6 border-t border-neutral-800 flex items-center justify-between">
              <button
                onClick={() => {
                  setCurrentView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Quay Lại Trang Chủ
              </button>

              <button
                onClick={scrollToWarranty}
                className="text-xs text-emerald-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Xem Chính Sách Bảo Hành
              </button>
            </div>

          </main>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-neutral-950 border-t border-neutral-800/80 text-neutral-400 text-xs py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Store Bio with Official Logo */}
            <div className="md:col-span-5 space-y-3">
              <Logo variant="horizontal" logoUrl={settings.logoUrl} size="md" />
              <p className="text-neutral-400 text-xs leading-relaxed max-w-sm pt-2">
                Hệ thống chuyên kinh doanh các dòng điện thoại iPhone và phụ kiện Apple chính hãng. Cam kết chất lượng chuẩn zin nguyên bản 100%, bảo hành 1 đổi 1 60 ngày, tặng Full combo phụ kiện và thay pin miễn phí trọn đời.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-emerald-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>{settings.slogan}</span>
              </div>
            </div>

            {/* Quick Policy links */}
            <div className="md:col-span-3 space-y-2">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Chính Sách Bảo Hành</h4>
              <ul className="space-y-1.5 text-neutral-400 text-xs">
                <li>• 1 Đổi 1 trong 60 ngày đầu</li>
                <li>• Thay Pin miễn phí khi &lt; 80% trọn đời</li>
                <li>• Ốp lưng & dán cường lực trọn đời</li>
                <li>• Tặng Full sạc cáp 20W + tai nghe</li>
                <li>• Bảo hành phần cứng 1 năm</li>
                <li>• Giảm 30% sửa chữa nếu phát sinh lỗi người dùng</li>
              </ul>
            </div>

            {/* Contact Details */}
            <div className="md:col-span-4 space-y-2">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Liên Hệ & Địa Chỉ</h4>
              <p className="text-xs text-neutral-300">
                📍 <strong>Địa chỉ:</strong> {settings.address}
              </p>
              <p className="text-xs text-neutral-300">
                📞 <strong>Hotline 1:</strong> <a href={`tel:${settings.hotlines[0]}`} className="text-emerald-400 hover:underline">{settings.hotlines[0]}</a>
              </p>
              <p className="text-xs text-neutral-300">
                📞 <strong>Hotline 2:</strong> <a href={`tel:${settings.hotlines[1]}`} className="text-emerald-400 hover:underline">{settings.hotlines[1]}</a>
              </p>
              <div className="pt-2 flex items-center gap-3">
                <a 
                  href={settings.zaloLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-[#4094ff] border border-neutral-800 font-semibold"
                >
                  Zalo Tư Vấn
                </a>
                <a 
                  href={settings.facebookLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-[#1877F2] border border-neutral-800 font-semibold"
                >
                  Fanpage Facebook
                </a>
                {/* Dedicated Admin button */}
                <button
                  onClick={() => setIsAdminOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 font-semibold ml-2 transition-colors cursor-pointer"
                >
                  <Lock className="w-3 h-3 text-emerald-400" />
                  Quản Trị Admin
                </button>
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-500">
            <p>© {new Date().getFullYear()} Táo New Store. Bản quyền thuộc về Táo New.</p>
            <p>iPhone • iPad • MacBook • Phụ Kiện Apple Chính Hãng</p>
          </div>
        </div>
      </footer>

      {/* Floating Quick Contact Buttons */}
      <FloatingContactBar
        settings={settings}
        onOpenConsultation={() => {
          setQuickOrderProduct(null);
          setIsQuickOrderOpen(true);
        }}
      />

      {/* Product Detail Modal */}
      {selectedProductForDetail && (
        <ProductDetailModal
          product={selectedProductForDetail}
          settings={settings}
          isAdmin={isAdminOpen}
          onClose={() => setSelectedProductForDetail(null)}
          onSubmitOrder={handleSubmitOrder}
        />
      )}

      {/* Quick Order / Lead Capture Modal */}
      {isQuickOrderOpen && (
        <QuickOrderModal
          isOpen={isQuickOrderOpen}
          onClose={() => {
            setIsQuickOrderOpen(false);
            setQuickOrderProduct(null);
          }}
          products={products}
          initialProduct={quickOrderProduct}
          initialStorage={quickOrderStorage}
          initialColor={quickOrderColor}
          settings={settings}
          onSubmitOrder={handleSubmitOrder}
        />
      )}

      {/* Admin Management Panel */}
      {isAdminOpen && (
        <AdminPanel
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          products={products}
          leads={leads}
          settings={settings}
          onSaveProducts={(updated) => {
            setProducts(updated);
            saveStoredProducts(updated);
          }}
          onSaveLeads={(updated) => {
            setLeads(updated);
            saveStoredLeads(updated);
          }}
          onSaveSettings={(updated) => {
            setSettings(updated);
            saveStoredSettings(updated);
          }}
          onResetDefaults={handleResetDefaults}
        />
      )}

    </div>
  );
}
