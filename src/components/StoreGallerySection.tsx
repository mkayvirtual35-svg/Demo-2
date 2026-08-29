import React, { useState } from 'react';
import { 
  Store, 
  Sparkles, 
  ZoomIn, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  MapPin, 
  Camera,
  CheckCircle2
} from 'lucide-react';
import { StoreSettings, StoreGalleryImage } from '../types';

interface StoreGallerySectionProps {
  settings: StoreSettings;
}

export const StoreGallerySection: React.FC<StoreGallerySectionProps> = ({ settings }) => {
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const images: StoreGalleryImage[] = settings.storeImages && settings.storeImages.length > 0 
    ? settings.storeImages 
    : [
      {
        id: 'st-1',
        url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&auto=format&fit=crop&q=80',
        title: 'Showroom Trưng Bày & Bàn Trải Nghiệm iPhone',
        caption: 'Không gian sang trọng, đầy đủ máy demo để quý khách test trực tiếp trước khi mua.'
      },
      {
        id: 'st-2',
        url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80',
        title: 'Khu Vực Kiểm Tra & Test Máy 3uTools Công Khai',
        caption: 'Kỹ thuật viên kiểm tra máy chi tiết, mở máy kiểm tra main zin và pin zin trực tiếp.'
      },
      {
        id: 'st-3',
        url: 'https://images.unsplash.com/photo-1556742049-0a67e557b447?w=1200&auto=format&fit=crop&q=80',
        title: 'Quầy Tư Vấn & Dịch Vụ Khách Hàng Táo New',
        caption: 'Tư vấn nhiệt tình, hỗ trợ chuyển dữ liệu, dán cường lực và tặng phụ kiện trọn đời.'
      },
      {
        id: 'st-4',
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
        title: 'Kệ Phụ Kiện Apple Chính Hãng & Quà Tặng VIP',
        caption: 'Củ sạc nhanh 20W, cáp sạc dù chống đứt, tai nghe và ốp lưng bảo vệ máy cao cấp.'
      }
    ];

  const handleNext = () => {
    if (activeImageIndex === null) return;
    setActiveImageIndex((activeImageIndex + 1) % images.length);
  };

  const handlePrev = () => {
    if (activeImageIndex === null) return;
    setActiveImageIndex((activeImageIndex - 1 + images.length) % images.length);
  };

  return (
    <section id="store-gallery-section" className="py-16 bg-[#0a0a0c] border-b border-neutral-800 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-900 border border-neutral-700/80 text-xs font-semibold text-neutral-300">
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            KHÔNG GIAN THỰC TẾ
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Hình Ảnh Cửa Hàng Táo New
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Mời bạn ghé thăm không gian mua sắm, trải nghiệm trực tiếp máy zin nguyên bản và dịch vụ chăm sóc tận tâm tại cửa hàng.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {images.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => setActiveImageIndex(idx)}
              className="group relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1"
            >
              {/* Image Container */}
              <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-950">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Hover Overlay with Zoom Icon */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                <div className="flex items-center justify-between mb-1">
                  <span className="px-2 py-0.5 rounded bg-neutral-800/80 text-[10px] font-bold text-emerald-400 border border-neutral-700">
                    Ảnh thực tế
                  </span>
                  <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </div>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                  {item.title}
                </h4>
                {item.caption && (
                  <p className="text-[11px] text-neutral-300 line-clamp-1 mt-0.5">
                    {item.caption}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges under gallery */}
        <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-wrap items-center justify-around gap-4 text-xs text-neutral-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Xem & test máy trực tiếp không mua không sao</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Có bàn kỹ thuật test 3uTools công khai trước mặt khách</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Miễn phí vệ sinh máy & dán cường lực trọn đời</span>
          </div>
        </div>

      </div>

      {/* Lightbox Modal */}
      {activeImageIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          {/* Close button */}
          <button
            onClick={() => setActiveImageIndex(null)}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev button */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white border border-neutral-700 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next button */}
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white border border-neutral-700 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Image & Title container */}
          <div className="max-w-4xl w-full max-h-[85vh] flex flex-col items-center justify-center space-y-3">
            <div className="relative max-h-[70vh] rounded-2xl overflow-hidden border border-neutral-700 bg-black flex items-center justify-center">
              <img
                src={images[activeImageIndex].url}
                alt={images[activeImageIndex].title}
                className="max-h-[70vh] w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-center px-4">
              <h3 className="text-base sm:text-lg font-bold text-white">
                {images[activeImageIndex].title}
              </h3>
              {images[activeImageIndex].caption && (
                <p className="text-xs text-neutral-400 mt-1 max-w-xl mx-auto">
                  {images[activeImageIndex].caption}
                </p>
              )}
              <span className="text-[11px] text-neutral-500 mt-1 inline-block">
                Ảnh {activeImageIndex + 1} / {images.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
