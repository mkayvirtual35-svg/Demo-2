import React from 'react';
import { 
  ShieldCheck, 
  Gift, 
  Smartphone, 
  PhoneCall, 
  MapPin, 
  Clock, 
  ChevronRight,
  ArrowDownCircle,
  Sparkles,
  RotateCcw,
  BatteryCharging,
  CreditCard,
  Navigation
} from 'lucide-react';
import { StoreSettings } from '../types';
import { Logo } from './Logo';

interface HeroBannerProps {
  settings: StoreSettings;
  onViewInventory: () => void;
  onScrollToWarranty: () => void;
  onQuickConsultation: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  settings,
  onViewInventory,
  onScrollToWarranty,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#09090b] via-[#0e0f14] to-[#09090b] text-white pt-6 sm:pt-10 pb-12 sm:pb-14 border-b border-neutral-800/80">
      {/* Decorative ambient gradient glows */}
      <div className="absolute top-1/4 left-10 w-[450px] h-[350px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none -z-0" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[350px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none -z-0" />
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[800px] h-[250px] bg-neutral-700/15 blur-[120px] rounded-full pointer-events-none -z-0" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 sm:space-y-10">
        
        {/* ================= 2 KHỐI NẰM NGANG RIÊNG BIỆT (SLOGAN TRÁI & LOGO PHẢI) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* ================= KHỐI BÊN TRÁI: SLOGAN TO, CAM KẾT & NÚT HÀNH ĐỘNG ================= */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6 text-left">
            
            {/* Top Brand Micro Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-700/80 shadow-md backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-black tracking-wider text-emerald-400 uppercase">
                  TÁO NEW STORE
                </span>
                <span className="text-neutral-500 text-xs">•</span>
                <span className="text-[11px] font-bold text-neutral-200">
                  IPHONE CHUẨN ZIN 100%
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                BẢO HÀNH 1 ĐỔI 1 60 NGÀY
              </div>
            </div>

            {/* BIG IMPACTFUL SLOGAN - BỐ CỤC KHÓA NGẮT DÒNG CHUẨN NGỮ NGHĨA */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.2] uppercase">
                <span className="block text-white drop-shadow-sm">
                  KHÔNG ZIN TẶNG MÁY
                </span>
                <span className="block mt-1 bg-gradient-to-r from-amber-300 via-amber-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-md">
                  HOÀN TIỀN 100%
                </span>
              </h1>

              {/* DÒNG HỖ TRỢ TRẢ GÓP 0Đ DƯỚI SLOGAN */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold w-fit shadow-sm">
                <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Hỗ Trợ Bán Trả Góp 0Đ • Duyệt Nhanh 15 Phút</span>
              </div>
              
              <p className="text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed max-w-xl">
                Chuyên kinh doanh các dòng điện thoại <strong>iPhone 11 - 17 Series</strong> và phụ kiện Apple chính hãng. Máy được kỹ thuật viên mở kiểm tra main zin, màn zin, pin zin và test 3uTools công khai trước mặt quý khách.
              </p>
            </div>

            {/* 3 GOLDEN COMMITMENT HIGHLIGHTS (3 KHỐI CAM KẾT CHUẨN) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              
              {/* Feature 1: 1 Đổi 1 */}
              <div className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-emerald-500/40 transition-colors flex items-center gap-2.5 backdrop-blur-sm group">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 group-hover:scale-105 transition-transform">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-white leading-none">1 Đổi 1 60 Ngày</p>
                  <p className="text-[10px] text-neutral-400 pt-0.5 truncate">Lỗi phần cứng đổi ngay</p>
                </div>
              </div>

              {/* Feature 2: Thay Pin */}
              <div className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-sky-500/40 transition-colors flex items-center gap-2.5 backdrop-blur-sm group">
                <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30 group-hover:scale-105 transition-transform">
                  <BatteryCharging className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-white leading-none">Thay Pin Trọn Đời</p>
                  <p className="text-[10px] text-neutral-400 pt-0.5 truncate">Miễn phí khi pin &lt; 80%</p>
                </div>
              </div>

              {/* Feature 3: Full Phụ Kiện */}
              <div className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-amber-500/40 transition-colors flex items-center gap-2.5 backdrop-blur-sm group">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 group-hover:scale-105 transition-transform">
                  <Gift className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-white leading-none">Full Phụ Kiện</p>
                  <p className="text-[10px] text-neutral-400 pt-0.5 truncate">Sạc 20W + Dây sạc + Tai nghe</p>
                </div>
              </div>

            </div>

            {/* 2 MAIN ACTION BUTTONS (XEM KHO MÁY & CHÍNH SÁCH BẢO HÀNH) */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3.5">
              
              {/* NÚT 1: XEM KHO MÁY */}
              <button
                id="btn-view-inventory"
                onClick={onViewInventory}
                className="w-full sm:w-1/2 px-6 py-4 rounded-2xl bg-white hover:bg-neutral-100 text-black font-extrabold text-xs sm:text-sm transition-all shadow-xl hover:shadow-white/20 flex items-center justify-center gap-2.5 active:scale-95 group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-xl bg-black text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-4 h-4" />
                </div>
                <span className="font-black text-black flex items-center gap-1.5 whitespace-nowrap">
                  Xem Kho Máy
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              {/* NÚT 2: CHÍNH SÁCH BẢO HÀNH */}
              <button
                id="btn-view-warranty"
                onClick={onScrollToWarranty}
                className="w-full sm:w-1/2 px-6 py-4 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 text-white font-extrabold text-xs sm:text-sm border border-neutral-700 transition-all shadow-xl flex items-center justify-center gap-2.5 active:scale-95 group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-black text-emerald-400 flex items-center gap-1.5 whitespace-nowrap">
                  Chính Sách Bảo Hành
                  <ArrowDownCircle className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                </span>
              </button>

            </div>

          </div>

          {/* ================= KHỐI BÊN PHẢI: LOGO TÁO NEW & BRAND SHOWCASE CARD ================= */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            
            {/* Showroom Brand Showcase Card */}
            <div className="relative rounded-3xl bg-gradient-to-br from-[#16171d] via-[#101115] to-[#090a0d] border border-neutral-700/80 p-6 sm:p-7 text-center space-y-5 shadow-2xl overflow-hidden group">
              
              {/* Decorative background glow inside the card */}
              <div className="absolute -top-16 -right-16 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              
              {/* Centered Large Táo New Logo with Glow */}
              <div className="py-2 flex flex-col items-center justify-center space-y-2.5">
                <Logo variant="hero" logoUrl={settings.logoUrl} className="relative z-10 mx-auto" />
                
                <p className="text-xs text-neutral-400 font-medium max-w-xs mx-auto pt-0.5">
                  Trao Chất Lượng Chuẩn Zin • Nhận Trọn Vẹn Niềm Tin
                </p>

                <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold mx-auto">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Bán Trả Góp 0Đ • Duyệt Nhanh 15 Phút</span>
                </div>
              </div>

              {/* Bottom Quick Contact & Location Info inside Right Card */}
              <div className="pt-3 border-t border-neutral-800/90 space-y-2 text-left text-xs text-neutral-300">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-snug">{settings.address}</span>
                  </div>
                  {settings.googleMapsLink && (
                    <a
                      href={settings.googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-rose-400 hover:text-rose-300 font-bold shrink-0 flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20"
                    >
                      <Navigation className="w-2.5 h-2.5" /> Chỉ Đường
                    </a>
                  )}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <a 
                    href={`tel:${settings.hotlines[0]}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:underline"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    Hotline: {settings.hotlines[0]}
                  </a>
                  <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-neutral-500" />
                    08:30 - 21:30
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* ================= 3 BENTO HIGHLIGHT CARDS (ĐỊA CHỈ, HOTLINE, QUÀ TẶNG) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
          
          {/* Card 1: Store Location */}
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/90 flex items-start gap-3 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 text-left">
              <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Địa Chỉ Showroom</h4>
              <p className="text-xs sm:text-sm font-bold text-white leading-snug">{settings.address}</p>
              <p className="text-[11px] text-neutral-400 flex items-center gap-1 pt-0.5">
                <Clock className="w-3 h-3 text-neutral-500" /> 08:30 - 21:30 (Mở cửa tất cả các ngày)
              </p>
            </div>
          </div>

          {/* Card 2: Hotlines */}
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/90 flex items-start gap-3 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 text-left">
              <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Hotline Tư Vấn & Giữ Máy</h4>
              <div className="flex flex-col">
                <a href={`tel:${settings.hotlines[0]}`} className="text-xs sm:text-sm font-bold text-emerald-400 hover:underline">
                  {settings.hotlines[0]} (Báo giá & Giữ máy trực tiếp)
                </a>
                <a href={`tel:${settings.hotlines[1]}`} className="text-[11px] font-medium text-neutral-300 hover:underline">
                  {settings.hotlines[1]} (Hỗ trợ kỹ thuật & Test máy)
                </a>
              </div>
            </div>
          </div>

          {/* Card 3: Free Gift Package */}
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/90 flex items-start gap-3 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Gift className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 text-left">
              <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Bộ Quà Tặng Độc Quyền VIP</h4>
              <p className="text-xs sm:text-sm font-bold text-white leading-snug">Full Sạc 20W + Cáp Dù + Tai Nghe</p>
              <p className="text-[11px] text-amber-300/90 pt-0.5">
                Tặng ốp lưng & Dán cường lực miễn phí trọn đời
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
