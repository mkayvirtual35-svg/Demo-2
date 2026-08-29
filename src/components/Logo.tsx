import React from 'react';

interface LogoProps {
  logoUrl?: string;
  variant?: 'full' | 'horizontal' | 'mark' | 'hero';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  lightMode?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  logoUrl,
  variant = 'horizontal', 
  className = '', 
  size = 'md',
}) => {
  // Biểu tượng Apple cách điệu 3D Metallic sang trọng độc bản
  const AppleBrandMark = ({ sizePx = 64 }: { sizePx?: number }) => (
    <div 
      className="relative flex items-center justify-center shrink-0 select-none"
      style={{ width: sizePx, height: sizePx }}
    >
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full drop-shadow-md"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="appleMetallicGlow" x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
          <linearGradient id="leafGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Chiếc lá xanh tinh tế điểm xuyết nét tươi mới (New) */}
        <path 
          d="M58 12 C58 12 68 15 64 27 C57 27 50 20 58 12 Z" 
          fill="url(#leafGlow)"
        />

        {/* Quả táo kim loại nguyên khối chuẩn form Apple */}
        <path 
          d="M50 30 C38 30 31 35 23 48 C12 64 14 90 27 106 C33 113 39 118 46 118 C52 118 54 113 61 113 C68 113 70 118 76 118 C83 118 89 111 95 102 C99 94 102 85 102 84 C101 83 85 77 85 58 C85 42 97 36 98 35 C89 24 76 24 72 24 C62 24 56 30 50 30 Z" 
          fill="url(#appleMetallicGlow)"
          transform="scale(0.72) translate(18, 12)"
        />
      </svg>
    </div>
  );

  // 1. Dạng Mark Icon tinh gọn
  if (variant === 'mark') {
    const dim = size === 'sm' ? 28 : size === 'lg' ? 48 : size === 'xl' ? 64 : 36;
    return (
      <div className={`inline-flex items-center justify-center shrink-0 bg-transparent ${className}`}>
        {logoUrl ? (
          <img 
            src={logoUrl} 
            alt="Táo New Logo" 
            style={{ width: dim, height: dim, mixBlendMode: 'screen' }}
            className="object-contain drop-shadow-sm select-none"
            referrerPolicy="no-referrer"
          />
        ) : (
          <AppleBrandMark sizePx={dim} />
        )}
      </div>
    );
  }

  // 2. Dạng Hero Biển Hiệu Ngang Sang Trọng Phóng To (Cho Banner & Showroom Card - Tự động loại bỏ nền đen)
  if (variant === 'hero') {
    return (
      <div className={`flex flex-col items-center justify-center text-center select-none w-full bg-transparent ${className}`}>
        {/* Khung hiển thị Logo hoàn toàn không viền, loại bỏ nền đen tự động */}
        <div className="relative mb-3 w-full max-w-[460px] sm:max-w-[520px] group flex items-center justify-center bg-transparent">
          {/* Vầng hào quang ánh sáng nhẹ phía sau logo */}
          <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/15 via-white/10 to-amber-500/15 rounded-full blur-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />
          
          <div className="relative w-full h-32 sm:h-44 flex items-center justify-center p-2 text-white shrink-0 transition-transform duration-300 group-hover:scale-[1.02] bg-transparent">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Táo New Store Logo" 
                style={{ mixBlendMode: 'screen' }}
                className="w-full h-full object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] select-none"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex items-center justify-center gap-4 px-6 py-3 rounded-2xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-sm shadow-xl">
                <AppleBrandMark sizePx={64} />
                <div className="flex flex-col text-left">
                  <div className="flex items-baseline gap-1.5 leading-none">
                    <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">Táo</span>
                    <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">New</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] tracking-[0.24em] uppercase text-neutral-400 font-extrabold mt-1.5">
                    STORE BÌNH DƯƠNG
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Nhãn nhận diện chuyên môn */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-800 shadow-inner backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] sm:text-xs font-bold tracking-widest text-neutral-200 uppercase">
            - IPHONE - IPAD - MACBOOK -
          </span>
        </div>
      </div>
    );
  }

  // 3. Dạng Full
  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center select-none bg-transparent ${className}`}>
        <div className="text-white mb-2 shrink-0 bg-transparent">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Logo" 
              style={{ mixBlendMode: 'screen' }}
              className={`${size === 'lg' ? 'w-32 h-16' : 'w-24 h-12'} object-contain drop-shadow-md select-none`}
              referrerPolicy="no-referrer"
            />
          ) : (
            <AppleBrandMark sizePx={size === 'lg' ? 56 : 42} />
          )}
        </div>
        {!logoUrl && (
          <>
            <div className="text-xl font-black tracking-tight text-white flex items-center gap-1">
              <span>Store</span>
              <span className="text-emerald-400">Bình Dương</span>
            </div>
            <div className="text-[10px] tracking-[0.16em] uppercase text-neutral-400 font-semibold mt-0.5">
              - IPHONE - IPAD - MACBOOK -
            </div>
          </>
        )}
      </div>
    );
  }

  // 4. Dạng Ngang Horizontal (Navbar & Footer)
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none shrink-0 bg-transparent ${className}`}>
      {logoUrl ? (
        /* Logo PNG trong suốt hiển thị trực tiếp hòa trộn vào thanh công cụ không nền */
        <div className={`${isSmall ? 'h-7 max-w-[120px]' : isLarge ? 'h-11 max-w-[220px]' : 'h-8 sm:h-10 max-w-[160px] sm:max-w-[220px]'} flex items-center justify-center shrink-0 bg-transparent`}>
          <img 
            src={logoUrl} 
            alt="Táo New" 
            style={{ mixBlendMode: 'screen' }}
            className="h-full w-auto max-w-full object-contain drop-shadow-sm select-none"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        /* Biểu tượng Apple cách điệu nếu chưa có ảnh tải lên */
        <div className={`${isSmall ? 'w-8 h-8' : isLarge ? 'w-11 h-11' : 'w-9 h-9'} rounded-xl bg-gradient-to-b from-[#1c1d24] to-[#0d0e12] border border-neutral-700/80 flex items-center justify-center text-white shrink-0 shadow-sm overflow-hidden p-0.5`}>
          <AppleBrandMark sizePx={isSmall ? 22 : isLarge ? 32 : 26} />
        </div>
      )}

      {/* Thông tin chữ bên cạnh Logo: Giữ nguyên Store Bình Dương & Chuyên môn */}
      <div className="flex flex-col text-left justify-center min-w-0">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`${isSmall ? 'text-xs' : isLarge ? 'text-xl' : 'text-sm sm:text-base md:text-lg'} font-black tracking-tight text-white whitespace-nowrap`}>
            Store <span className="text-emerald-400 font-extrabold">Bình Dương</span>
          </span>
        </div>
        <span className={`${isSmall ? 'text-[7px]' : 'text-[8px] sm:text-[9px] md:text-[10px]'} tracking-[0.14em] uppercase text-neutral-300 font-semibold mt-0.5 sm:mt-1 whitespace-nowrap`}>
          - IPHONE - IPAD - MACBOOK -
        </span>
      </div>
    </div>
  );
};

