import React, { useState } from 'react';
import { 
  ShieldCheck, 
  BatteryCharging, 
  Sparkles, 
  Check, 
  Clock, 
  ShoppingBag, 
  Info,
  Gift,
  Smartphone,
  Tag,
  Hash,
  Eye,
  EyeOff
} from 'lucide-react';
import { Product } from '../types';
import { formatVND, maskIMEI } from '../services/storage';

interface ProductCardProps {
  product: Product;
  isAdmin?: boolean;
  onQuickOrder: (product: Product, selectedStorage: string, selectedColor: string) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isAdmin = false,
  onQuickOrder,
  onViewDetails,
}) => {
  const isInStock = product.availability === 'in_stock' || product.availability === 'in_stock_99' || product.availability === 'in_stock_clearance';

  // For in-stock items: storage and color are fixed to this specific machine
  const exactStorage = product.exactStorage || product.storageOptions[0] || '128GB';
  const exactColor = product.exactColor || product.colors[0] || { name: 'Mặc định', hex: '#888888' };

  // For order items: customer can choose storage and color
  const [selectedStorage, setSelectedStorage] = useState<string>(
    product.storageOptions[0] || '128GB'
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors[0]?.name || 'Mặc định'
  );

  const handleOrderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInStock) {
      // For in-stock: lock to this machine's exact storage & color
      onQuickOrder(product, exactStorage, exactColor.name);
    } else {
      // For order: pass customer's selected storage & color
      onQuickOrder(product, selectedStorage, selectedColor);
    }
  };

  const displayedImei = maskIMEI(product.imei, isAdmin);

  // Badge render based on 4-tier availability
  const renderAvailabilityBadge = () => {
    switch (product.availability) {
      case 'in_stock_clearance':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/95 text-rose-300 border border-rose-500/50 text-[10px] sm:text-[11px] font-black shadow-md backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            SẴN TẠI SHOP (THANH LÝ)
          </span>
        );
      case 'in_stock_99':
      case 'in_stock':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/95 text-emerald-300 border border-emerald-500/50 text-[10px] sm:text-[11px] font-black shadow-md backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SẴN TẠI SHOP (99% ĐẸP)
          </span>
        );
      case 'order_99':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-400 text-black text-[10px] sm:text-[11px] font-black shadow-md backdrop-blur-sm">
            <Clock className="w-3 h-3 text-black" />
            ORDER 15 - 30P (99% LƯỚT)
          </span>
        );
      case 'order_new_seal':
      case 'order':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400 text-black text-[10px] sm:text-[11px] font-black shadow-md backdrop-blur-sm">
            <Clock className="w-3 h-3 text-black" />
            ORDER 15 - 30P (NEW SEAL)
          </span>
        );
    }
  };

  return (
    <div className="group relative rounded-2xl bg-[#111114] border border-neutral-800/90 hover:border-neutral-700 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-black/60">
      
      {/* Top Badge Indicators */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2 pointer-events-none">
        {/* Availability Badge */}
        {renderAvailabilityBadge()}

        {/* Condition Tag */}
        <span className="px-2 py-0.5 rounded-md bg-neutral-900/90 text-neutral-300 border border-neutral-700 text-[10px] font-semibold backdrop-blur-sm">
          {product.condition}
        </span>
      </div>

      {/* Main Image Area */}
      <div 
        onClick={() => onViewDetails(product)}
        className="relative pt-12 pb-6 px-6 bg-gradient-to-b from-neutral-900/50 to-transparent flex items-center justify-center cursor-pointer overflow-hidden aspect-[4/3]"
      >
        <img 
          src={product.image} 
          alt={product.name} 
          className="max-h-48 w-auto object-contain transform group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        
        {/* Hover Quick View Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-3 py-1.5 rounded-xl bg-white/90 text-black text-xs font-bold flex items-center gap-1 shadow-lg">
            <Info className="w-3.5 h-3.5" /> Xem góc chụp thực tế
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Series & Tag */}
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-neutral-400 font-medium">{product.series}</span>
            {product.tag && (
              <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                {product.tag}
              </span>
            )}
          </div>

          {/* Product Name */}
          <h3 
            onClick={() => onViewDetails(product)}
            className="text-base font-bold text-white group-hover:text-neutral-200 transition-colors cursor-pointer line-clamp-1"
          >
            {product.name}
          </h3>

          {/* Price Section */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-white tracking-tight">
              {formatVND(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-neutral-500 line-through">
                {formatVND(product.originalPrice)}
              </span>
            )}
          </div>

          {/* ================= PHÂN BIỆT RÕ RÀNG HÀNG SẴN VS HÀNG ORDER ================= */}
          {isInStock ? (
            /* --- THÔNG TIN CỦA CÂY MÁY CÓ SẴN CỤ THỂ (KHÔNG PHẢI TÙY CHỌN) --- */
            <div className="mt-3 space-y-2">
              
              {/* IMEI / Mã Cây Máy Cụ Thể (Được ẩn bảo mật cho khách, hiển thị đủ cho Admin) */}
              {product.imei && (
                <div 
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-300 border border-neutral-800 text-[11px] font-mono"
                  title={isAdmin ? `IMEI Đầy Đủ (Quyền Admin): ${product.imei}` : 'Mã định danh bảo mật cây máy'}
                >
                  <Hash className="w-3 h-3 text-emerald-400" />
                  <span>{displayedImei}</span>
                  {isAdmin && (
                    <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-400 font-sans font-bold">
                      Admin
                    </span>
                  )}
                </div>
              )}

              {/* Exact Specs Pill for In-Stock Machine */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                {/* Fixed Storage */}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-black font-bold border border-white">
                  {exactStorage}
                </span>

                {/* Fixed Color with visual swatch */}
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-200 border border-neutral-800 font-medium">
                  <span 
                    className="w-2.5 h-2.5 rounded-full border border-neutral-600"
                    style={{ backgroundColor: exactColor.hex }}
                  />
                  {exactColor.name}
                </span>

                {/* Battery Status */}
                {product.batteryHealth && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-900 text-emerald-300 border border-neutral-800 font-medium">
                    <BatteryCharging className="w-3 h-3 text-emerald-400" />
                    {product.batteryHealth}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-neutral-400 italic">
                * Cây máy thực tế có sẵn tại showroom, test máy lấy ngay.
              </p>
            </div>
          ) : (
            /* --- HÀNG ORDER: CHO PHÉP KHÁCH CHỌN DUNG LƯỢNG & MÀU SẮC --- */
            <div className="mt-3 space-y-2.5">
              
              {/* Storage Selection for Order Items */}
              {product.storageOptions && product.storageOptions.length > 0 && (
                <div>
                  <p className="text-[11px] text-neutral-400 mb-1 font-medium">
                    Chọn dung lượng: <strong className="text-white">{selectedStorage}</strong>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.storageOptions.map((opt) => {
                      const isSelected = selectedStorage === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStorage(opt);
                          }}
                          className={`px-2 py-0.5 text-[11px] rounded-md border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-400 text-black font-black border-amber-400 shadow-sm'
                              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Color Selection for Order Items */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <p className="text-[11px] text-neutral-400 mb-1 font-medium">
                    Chọn màu order: <span className="text-white">{selectedColor}</span>
                  </p>
                  <div className="flex items-center gap-1.5">
                    {product.colors.map((color) => {
                      const isSelected = selectedColor === color.name;
                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedColor(color.name);
                          }}
                          title={color.name}
                          className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center cursor-pointer ${
                            isSelected
                              ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#111114] border-white scale-110'
                              : 'border-neutral-700 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.hex }}
                        >
                          {isSelected && (
                            <Check className={`w-2.5 h-2.5 ${color.hex === '#FFFFFF' || color.hex === '#F0EFEA' || color.hex === '#F2F2F7' ? 'text-black' : 'text-white'}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-amber-300/90 font-medium">
                ⏱️ Nhận máy sau 15 - 30 phút, đủ màu & dung lượng.
              </p>
            </div>
          )}

          {/* Gift combo summary */}
          <div className="mt-3 p-2 rounded-lg bg-neutral-900/80 border border-neutral-800/80 text-[11px] text-neutral-300 flex items-start gap-1.5">
            <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>Tặng củ sạc 20W (BH 1 năm) + tai nghe Bluetooth (BH 6T) + Dây Sạc + ốp & cường lực.</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleOrderClick}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md cursor-pointer ${
              isInStock
                ? 'bg-white hover:bg-neutral-100 text-black shadow-white/5'
                : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {isInStock ? '⚡ Giữ Cây Máy Này' : '🕒 Đặt Hàng Order (15-30P)'}
          </button>
        </div>
      </div>

    </div>
  );
};
