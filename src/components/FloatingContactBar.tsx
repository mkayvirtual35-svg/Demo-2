import React, { useState } from 'react';
import { 
  Phone, 
  MessageCircle, 
  Facebook, 
  ShoppingBag, 
  X, 
  ChevronUp,
  Headphones
} from 'lucide-react';
import { StoreSettings } from '../types';

interface FloatingContactBarProps {
  settings: StoreSettings;
  onOpenConsultation: () => void;
}

export const FloatingContactBar: React.FC<FloatingContactBarProps> = ({
  settings,
  onOpenConsultation,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <aside aria-label="Kênh liên hệ nhanh" className="fixed bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-2.5">
      {/* Expanded Contacts List */}
      {isExpanded && (
        <div className="flex flex-col items-end gap-2 transition-all duration-300">
          
          {/* Quick Lead Consultation Button */}
          <button
            onClick={onOpenConsultation}
            className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-white hover:bg-neutral-100 text-black text-xs font-extrabold shadow-xl shadow-white/10 transition-all hover:scale-105 active:scale-95 border border-neutral-200"
          >
            <ShoppingBag className="w-4 h-4 text-black" />
            <span className="hidden sm:inline">Đặt Giữ Máy Nhanh</span>
          </button>

          {/* Zalo Button */}
          <a
            href={settings.zaloLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#0068FF] hover:bg-[#0052cc] text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <span className="w-5 h-5 rounded-full bg-white text-[#0068FF] flex items-center justify-center font-black text-[10px]">
              Z
            </span>
            <span className="hidden sm:inline">Chat Zalo</span>
          </a>

          {/* Facebook Button */}
          <a
            href={settings.facebookLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#1877F2] hover:bg-[#145dbf] text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
          >
            <Facebook className="w-4 h-4" />
            <span className="hidden sm:inline">Facebook</span>
          </a>

          {/* Hotline 1 Button */}
          <a
            href={`tel:${settings.hotlines[0]}`}
            className="group flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Phone className="w-4 h-4 animate-bounce" />
            <span>{settings.hotlines[0]}</span>
          </a>

          {/* Hotline 2 Button */}
          <a
            href={`tel:${settings.hotlines[1]}`}
            className="group hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-bold shadow-lg transition-all hover:scale-105"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>{settings.hotlines[1]}</span>
          </a>

        </div>
      )}

      {/* Main Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-12 h-12 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 shadow-2xl flex items-center justify-center transition-all hover:scale-105"
        title="Bật/tắt menu liên hệ"
      >
        {isExpanded ? (
          <X className="w-5 h-5 text-neutral-300" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Headphones className="w-5 h-5 text-emerald-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
        )}
      </button>
    </aside>
  );
};
