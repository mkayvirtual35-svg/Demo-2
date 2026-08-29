import React, { useState, useRef } from 'react';
import { 
  Heart, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Maximize2
} from 'lucide-react';
import { CustomerReviewItem } from '../types';

interface CustomerDeliveryMarqueeProps {
  reviews?: CustomerReviewItem[];
}

export const CustomerDeliveryMarquee: React.FC<CustomerDeliveryMarqueeProps> = ({ reviews = [] }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!reviews || reviews.length === 0) return null;

  // Duplicate list to create a seamless infinite horizontal marquee effect
  const displayList = [...reviews, ...reviews, ...reviews];

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-12 bg-[#09090c] border-b border-neutral-800/90 text-white relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
              <Heart className="w-3.5 h-3.5 fill-emerald-400" />
              TRI ÂN KHÁCH HÀNG
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Hình Ảnh Bàn Giao Máy Thực Tế
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Những khoảnh khắc trao tay sản phẩm chuẩn zin đến từng khách hàng thân thiết tại Táo New Store.
            </p>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => handleScroll('left')}
              className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors cursor-pointer active:scale-95 shadow-sm"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors cursor-pointer active:scale-95 shadow-sm"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Scrolling Photo Gallery */}
        <div 
          ref={scrollContainerRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayList.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              onClick={() => setSelectedImage(item.imageUrl)}
              className="flex-shrink-0 w-64 sm:w-72 md:w-80 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-600 p-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/70 snap-start cursor-pointer group"
            >
              {/* Pure Photo container */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-950">
                <img
                  src={item.imageUrl}
                  alt={item.deviceBought || 'Ảnh bàn giao khách hàng Táo New'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                
                {/* Subtle dark overlay with badge & zoom icon */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                  <div className="flex justify-end">
                    <span className="p-1.5 rounded-lg bg-black/60 text-white/80 group-hover:text-white backdrop-blur-md border border-white/10 shadow-md">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="space-y-0.5 transform translate-y-0.5 group-hover:translate-y-0 transition-transform">
                    {item.deviceBought && (
                      <p className="text-xs font-black text-white drop-shadow-md truncate">
                        {item.deviceBought}
                      </p>
                    )}
                    <p className="text-[10px] text-neutral-300 drop-shadow flex items-center justify-between">
                      <span>{item.customerName || 'Khách hàng thân thiết'}</span>
                      {item.date && <span>{item.date}</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Modal View Full Zoom Image */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-3xl bg-[#111115] border border-neutral-800 text-white shadow-2xl overflow-hidden p-3 sm:p-4 space-y-3"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/70 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition-colors cursor-pointer backdrop-blur-md"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Photo */}
            <div className="rounded-2xl overflow-hidden bg-black aspect-[4/3] sm:aspect-[16/10] flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Ảnh bàn giao máy khách hàng"
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
