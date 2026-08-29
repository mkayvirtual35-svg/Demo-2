import React, { useState } from 'react';
import { 
  Phone, 
  ShieldCheck, 
  MessageCircle, 
  ShoppingBag, 
  Smartphone, 
  Home, 
  Menu, 
  X,
  Camera
} from 'lucide-react';
import { StoreSettings } from '../types';
import { Logo } from './Logo';

interface NavbarProps {
  settings: StoreSettings;
  currentView: 'home' | 'products';
  onNavigateHome: () => void;
  onNavigateProducts: () => void;
  onScrollToWarranty: () => void;
  onScrollToStoreInfo: () => void;
  onOpenConsultation: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  currentView,
  onNavigateHome,
  onNavigateProducts,
  onScrollToWarranty,
  onOpenConsultation,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#09090b]/90 border-b border-neutral-800 transition-all duration-300">
      {/* Top Banner Ticker */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-neutral-300 border-b border-neutral-800/80 py-1.5 px-4 text-xs font-medium tracking-wide">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-white text-black uppercase tracking-wider">
              TÁO NEW
            </span>
            <span className="text-white font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {settings.slogan}
            </span>
            <span className="hidden md:inline text-neutral-500">•</span>
            <span className="hidden md:inline text-neutral-300">
              1 Đổi 1 trong 60 Ngày • Thay Pin Miễn Phí Trọn Đời • Tặng Full Phụ Kiện
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs">
            <a 
              href={`tel:${settings.hotlines[0]}`}
              className="flex items-center gap-1 text-neutral-200 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold">{settings.hotlines[0]}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo with Image Support */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onNavigateHome}
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            <Logo variant="horizontal" logoUrl={settings.logoUrl} size="md" />
          </button>
        </div>

        {/* Center Desktop Navigation: Tinh gọn và không bị lặp lại */}
        <nav className="hidden md:flex items-center gap-1.5 bg-neutral-900/80 p-1 rounded-xl border border-neutral-800 text-xs font-semibold">
          <button
            onClick={onNavigateHome}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'home'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            Trang Chủ
          </button>

          <button
            onClick={onNavigateProducts}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'products'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Kho Máy (iPhone 11 - 17)
          </button>

          <button
            onClick={onScrollToWarranty}
            className="px-3.5 py-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Chính Sách Bảo Hành
          </button>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onOpenConsultation}
            className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Báo Giá & Giữ Máy
          </button>
        </div>

        {/* Mobile menu hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#101014] border-b border-neutral-800 px-4 py-4 space-y-3">
          <button
            onClick={() => {
              onNavigateHome();
              setIsMobileMenuOpen(false);
            }}
            className={`w-full py-2.5 px-4 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 ${
              currentView === 'home' ? 'bg-white text-black' : 'text-neutral-300 bg-neutral-900'
            }`}
          >
            <Home className="w-4 h-4" />
            Trang Chủ
          </button>

          <button
            onClick={() => {
              onNavigateProducts();
              setIsMobileMenuOpen(false);
            }}
            className={`w-full py-2.5 px-4 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 ${
              currentView === 'products' ? 'bg-white text-black' : 'text-neutral-300 bg-neutral-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Xem Kho Máy (iPhone 11 - 17)
          </button>

          <button
            onClick={() => {
              onScrollToWarranty();
              setIsMobileMenuOpen(false);
            }}
            className="w-full py-2.5 px-4 rounded-xl text-left text-xs font-bold text-emerald-400 bg-neutral-900 flex items-center gap-2.5"
          >
            <ShieldCheck className="w-4 h-4" />
            Chính Sách Bảo Hành
          </button>

          <button
            onClick={() => {
              onOpenConsultation();
              setIsMobileMenuOpen(false);
            }}
            className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-black bg-white text-black mt-2"
          >
            Báo Giá & Giữ Máy Nhanh
          </button>
        </div>
      )}
    </header>
  );
};
