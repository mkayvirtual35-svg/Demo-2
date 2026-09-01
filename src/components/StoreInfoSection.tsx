import React from 'react';
import { 
  MapPin, 
  Phone, 
  Clock, 
  ExternalLink,
  Navigation,
  CheckCircle,
  ShieldCheck,
  Facebook
} from 'lucide-react';
import { StoreSettings } from '../types';
import { Logo } from './Logo';

interface StoreInfoSectionProps {
  settings: StoreSettings;
}

export const StoreInfoSection: React.FC<StoreInfoSectionProps> = ({ settings }) => {
  return (
    <section id="store-info-section" className="py-16 bg-[#0c0c0e] border-b border-neutral-800 text-white relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-xs font-semibold text-neutral-300">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            THÔNG TIN CỬA HÀNG & BẢN ĐỒ
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Ghé Thăm Cửa Hàng Táo New
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Trải nghiệm trực tiếp các dòng iPhone chuẩn zin nguyên bản, kiểm tra máy và nhận trọn bộ quà tặng độc quyền tại shop.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact Cards & Commitments */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Address Card */}
            <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-400" /> Địa Chỉ Cửa Hàng
                </span>
                <a
                  href={settings.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" /> Chỉ Đường Google Maps
                </a>
              </div>
              <p className="text-base font-bold text-white">
                {settings.address}
              </p>
              <p className="text-xs text-neutral-400">
                (Khu đô thị Sun Casa Vĩnh Tân – Vị trí trung tâm, thuận tiện ghé trải nghiệm)
              </p>
            </div>

            {/* Hotlines Card */}
            <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-400" /> Hotline Hỗ Trợ & Tư Vấn 24/7
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={`tel:${settings.hotlines[0]}`}
                  className="p-3.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 transition-all flex items-center justify-between group"
                >
                  <div>
                    <p className="text-[11px] text-neutral-500 font-medium">Hotline 1 (Tư Vấn & Báo Giá):</p>
                    <p className="text-sm font-bold text-emerald-400 group-hover:text-emerald-300">
                      {settings.hotlines[0]}
                    </p>
                  </div>
                  <Phone className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                </a>

                <a
                  href={`tel:${settings.hotlines[1]}`}
                  className="p-3.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 transition-all flex items-center justify-between group"
                >
                  <div>
                    <p className="text-[11px] text-neutral-500 font-medium">Hotline 2 (Kỹ Thuật & Bảo Hành):</p>
                    <p className="text-sm font-bold text-emerald-400 group-hover:text-emerald-300">
                      {settings.hotlines[1]}
                    </p>
                  </div>
                  <Phone className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>

            {/* Social & Chat Channels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={settings.zaloLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-[#0068FF]/10 hover:bg-[#0068FF]/20 border border-[#0068FF]/30 transition-all flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#0068FF] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  Zalo
                </div>
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1">
                    Chat Zalo Tư Vấn <ExternalLink className="w-3 h-3 text-neutral-400" />
                  </p>
                  <p className="text-[11px] text-neutral-400">Hỗ trợ gửi hình ảnh máy thực tế</p>
                </div>
              </a>

              <a
                href={settings.facebookLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 transition-all flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1877F2] text-white flex items-center justify-center font-bold shrink-0">
                  <Facebook className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1">
                    Fanpage Facebook <ExternalLink className="w-3 h-3 text-neutral-400" />
                  </p>
                  <p className="text-[11px] text-neutral-400">Cập nhật chương trình khuyến mãi</p>
                </div>
              </a>
            </div>

            {/* Working Hours */}
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                <span><strong>Giờ mở cửa:</strong> 08:30 – 21:30 (Mở cửa tất cả các ngày kể cả Thứ 7, CN)</span>
              </div>
            </div>

          </div>

          {/* Right Column: Sleek Store Location & Direct GPS Directions Card */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-3xl bg-neutral-900/90 border border-neutral-800 p-6 sm:p-7 space-y-6 shadow-2xl relative overflow-hidden">
              
              {/* Subtle ambient background light */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-sm font-bold text-white tracking-wide">
                    Định Vị Showroom Táo New
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                  Mở Cửa 08:30 – 21:30
                </span>
              </div>

              {/* Location Details */}
              <div className="space-y-4 relative z-10">
                <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                    <MapPin className="w-4 h-4" />
                    Vị Trí Cửa Hàng
                  </div>
                  <p className="text-base sm:text-lg font-extrabold text-white">
                    {settings.address}
                  </p>
                  <p className="text-xs text-neutral-400">
                    Khu đô thị Sun Casa Vĩnh Tân – Không gian mua sắm hiện đại, đường rộng rãi dễ tìm.
                  </p>
                </div>

                {/* Convenience Perks */}
                <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1 text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    🔬 Test Máy Tại Chỗ &amp; Cắm 3uTools Trực Tiếp
                  </span>
                  <p className="text-neutral-400 text-[11px]">
                    Hỗ trợ kết nối máy tính kiểm tra main, màn hình &amp; linh kiện zin công khai 100% trước khi nhận.
                  </p>
                </div>

                {/* Direct Google Maps Action Button */}
                <a
                  href={settings.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-sm flex items-center justify-center gap-2.5 transition-all duration-200 shadow-lg shadow-rose-500/25 active:scale-98 group cursor-pointer"
                >
                  <Navigation className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                  <span>Chỉ Đường Tới Shop Bằng Google Maps</span>
                  <ExternalLink className="w-4 h-4 opacity-75" />
                </a>
              </div>

              {/* Online Delivery Guarantee */}
              <div className="p-4 rounded-2xl bg-neutral-950/90 border border-neutral-800/80 text-xs text-neutral-400 space-y-1.5 relative z-10">
                <p className="font-bold text-neutral-200 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  Hỗ trợ ship COD toàn quốc – Kiểm tra máy đúng chuẩn zin mới thanh toán!
                </p>
                <p className="text-[11px] text-neutral-400 pl-5">
                  Đối với khách hàng mua Online, Táo New quay video chi tiết ngoại hình, số Serial / IMEI và test đầy đủ chức năng trước khi đóng gói.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
