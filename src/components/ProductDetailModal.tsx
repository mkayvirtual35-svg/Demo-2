import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  BatteryCharging, 
  Gift, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Smartphone, 
  Send,
  Phone,
  User,
  Sparkles,
  Camera,
  Layers,
  Search,
  Check,
  Hash,
  Award,
  CreditCard,
  Handshake,
  Building2
} from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { formatVND, maskIMEI } from '../services/storage';

interface ProductDetailModalProps {
  product: Product | null;
  settings: StoreSettings;
  isAdmin?: boolean;
  onClose: () => void;
  onSubmitOrder: (data: {
    customerName: string;
    phoneNumber: string;
    interestedProduct: string;
    imei?: string;
    storageSelected: string;
    colorSelected: string;
    orderType: 'in_stock' | 'order';
    note?: string;
  }) => Promise<void>;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  settings,
  isAdmin = false,
  onClose,
  onSubmitOrder,
}) => {
  const isInStock = product 
    ? (product.availability === 'in_stock' || product.availability === 'in_stock_99' || product.availability === 'in_stock_clearance')
    : false;
  
  // Exact values for in-stock single unit
  const exactStorage = product ? (product.exactStorage || product.storageOptions?.[0] || '128GB') : '128GB';
  const exactColor = product ? (product.exactColor || product.colors?.[0] || { name: 'Mặc định', hex: '#888888' }) : { name: 'Mặc định', hex: '#888888' };

  // Selectable values for order item
  const [selectedStorage, setSelectedStorage] = useState<string>(
    isInStock ? exactStorage : (product?.storageOptions?.[0] || '128GB')
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    isInStock ? exactColor.name : (product?.colors?.[0]?.name || 'Mặc định')
  );

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Active Image Category Tab: 'all' | 'overview' | 'screenBezel' | 'camera' | 'details'
  const [activeImageCategory, setActiveImageCategory] = useState<string>('all');
  const [selectedDisplayImage, setSelectedDisplayImage] = useState<string>(product?.image || '');

  const displayedImei = product ? maskIMEI(product.imei, isAdmin) : '';

  // Compute list of images based on category
  const imageList = React.useMemo(() => {
    if (!product) return [];
    const defaultList = [product.image, ...(product.gallery || [])];
    const detailed = product.detailedImages || {};

    if (activeImageCategory === 'overview') {
      return detailed.overview && detailed.overview.length > 0 ? detailed.overview : [product.image];
    }
    if (activeImageCategory === 'screenBezel') {
      return detailed.screenBezel && detailed.screenBezel.length > 0 ? detailed.screenBezel : defaultList;
    }
    if (activeImageCategory === 'camera') {
      return detailed.camera && detailed.camera.length > 0 ? detailed.camera : defaultList;
    }
    if (activeImageCategory === 'details') {
      return detailed.details && detailed.details.length > 0 ? detailed.details : defaultList;
    }
    // 'all'
    const combined = [
      product.image,
      ...(product.gallery || []),
      ...(detailed.overview || []),
      ...(detailed.screenBezel || []),
      ...(detailed.camera || []),
      ...(detailed.details || [])
    ];
    return Array.from(new Set(combined.filter(Boolean)));
  }, [product, activeImageCategory]);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phoneNumber.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmitOrder({
        customerName: customerName.trim(),
        phoneNumber: phoneNumber.trim(),
        interestedProduct: product.name,
        imei: isInStock ? product.imei : undefined,
        storageSelected: isInStock ? exactStorage : selectedStorage,
        colorSelected: isInStock ? exactColor.name : selectedColor,
        orderType: product.availability,
        note: note.trim()
      });
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#121216] border border-neutral-800 text-white shadow-2xl overflow-hidden my-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 transition-colors shadow-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="p-8 sm:p-12 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-black text-white">
              {isInStock ? 'Đã Ghi Nhận Giữ Cây Máy Thành Công!' : 'Đã Ghi Nhận Đặt Hàng Order!'}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto">
              Cảm ơn bạn <strong className="text-white">{customerName}</strong>! Táo New đã lưu thông tin và sẽ gọi số <strong className="text-emerald-400 font-bold">{phoneNumber}</strong> trong ít phút để chuẩn bị máy và quà tặng cho bạn.
            </p>
            
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 max-w-md mx-auto text-left text-xs space-y-2 text-neutral-300">
              <p>📱 <strong>Dòng máy:</strong> {product.name}</p>
              {isInStock && product.imei && <p>🔖 <strong>Mã / IMEI:</strong> <span className="font-mono text-emerald-400">{displayedImei}</span></p>}
              <p>💾 <strong>Dung lượng:</strong> {isInStock ? exactStorage : selectedStorage}</p>
              <p>🎨 <strong>Màu sắc:</strong> {isInStock ? exactColor.name : selectedColor}</p>
              <p>⏱️ <strong>Hình thức:</strong> {isInStock ? 'Có sẵn tại quầy test lấy ngay' : 'Hàng Order 15 - 30 phút'}</p>
              <p>🎁 <strong>Quà tặng:</strong> Full sạc 20W + cáp + tai nghe + ốp & cường lực trọn đời</p>
              <p>🛡️ <strong>Bảo hành:</strong> 1 đổi 1 trong 60 ngày, thay pin free khi &lt; 80% trọn đời</p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <a
                href={`tel:${settings.hotlines[0]}`}
                className="px-5 py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Hotline: {settings.hotlines[0]}
              </a>
              <button
                onClick={onClose}
                className="px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[88vh] overflow-y-auto">
            
            {/* Left Column: Image Viewer with Multiple Categories */}
            <div className="lg:col-span-6 p-5 sm:p-6 bg-[#09090c] border-b lg:border-b-0 lg:border-r border-neutral-800 space-y-4">
              
              {/* Product Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {isInStock ? (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    CÂY MÁY CÓ SẴN TẠI QUẦY
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-black text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                    <Clock className="w-3 h-3" />
                    HÀNG ORDER 15 - 30 PHÚT
                  </span>
                )}
                
                {product.imei && (
                  <span 
                    className="px-2 py-0.5 rounded-lg bg-neutral-900 text-emerald-400 font-mono text-[10px] font-bold border border-neutral-700 inline-flex items-center gap-1"
                    title={isAdmin ? `IMEI: ${product.imei}` : 'IMEI đã bảo mật'}
                  >
                    <Hash className="w-3 h-3 text-emerald-400" />
                    {displayedImei}
                    {isAdmin && (
                      <span className="text-[8px] px-1 rounded bg-emerald-500/20 text-emerald-400 font-sans font-bold">
                        Admin
                      </span>
                    )}
                  </span>
                )}

                <span className="px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-300 text-[10px] font-bold border border-neutral-700">
                  {product.condition}
                </span>

                {product.batteryHealth && (
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-800 text-emerald-300 text-[10px] font-bold border border-neutral-700 flex items-center gap-1">
                    <BatteryCharging className="w-3 h-3" />
                    {product.batteryHealth}
                  </span>
                )}
              </div>

              {/* Product Title & Price */}
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white">{product.name}</h3>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-2xl font-black text-emerald-400">
                    {formatVND(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs text-neutral-500 line-through font-medium">
                      {formatVND(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Main Image Display Box */}
              <div className="relative aspect-square max-h-[300px] w-full rounded-2xl bg-neutral-900/80 border border-neutral-800 p-4 flex items-center justify-center overflow-hidden group">
                <img 
                  src={selectedDisplayImage || product.image} 
                  alt={product.name} 
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* IMAGE CATEGORY TABS (Ngoại hình, Viền màn hình, Camera, Chi tiết) */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Góc chụp thực tế của máy:</span>
                  <span className="text-[10px] text-neutral-500 font-normal">Bấm xem chi tiết</span>
                </div>
                
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'overview', label: '📱 Ngoại hình' },
                    { id: 'screenBezel', label: '🔍 Viền màn hình' },
                    { id: 'camera', label: '📷 Cụm Camera' },
                    { id: 'details', label: '⚙️ Chi tiết / 3uTools' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveImageCategory(tab.id);
                        const detailed = product.detailedImages || {};
                        let firstImg = product.image;
                        if (tab.id === 'overview' && detailed.overview?.[0]) firstImg = detailed.overview[0];
                        if (tab.id === 'screenBezel' && detailed.screenBezel?.[0]) firstImg = detailed.screenBezel[0];
                        if (tab.id === 'camera' && detailed.camera?.[0]) firstImg = detailed.camera[0];
                        if (tab.id === 'details' && detailed.details?.[0]) firstImg = detailed.details[0];
                        setSelectedDisplayImage(firstImg);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        activeImageCategory === tab.id
                          ? 'bg-white text-black shadow-sm'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Thumbnails row */}
                <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                  {imageList.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedDisplayImage(imgUrl)}
                      className={`w-12 h-12 rounded-xl bg-neutral-900 border p-1 shrink-0 overflow-hidden transition-all cursor-pointer ${
                        selectedDisplayImage === imgUrl 
                          ? 'border-emerald-400 ring-2 ring-emerald-400/20 scale-105' 
                          : 'border-neutral-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={imgUrl} 
                        alt="thumbnail" 
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Specs & Hardware Overview */}
              {product.specs && (
                <div className="space-y-1 text-xs text-neutral-300 bg-neutral-900/70 p-3 rounded-2xl border border-neutral-800/80">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-neutral-400" /> Cấu hình & Thông số
                  </p>
                  {product.specs.screen && <p className="text-[11px]"><strong>Màn hình:</strong> {product.specs.screen}</p>}
                  {product.specs.chip && <p className="text-[11px]"><strong>Chip xử lý:</strong> {product.specs.chip}</p>}
                  {product.specs.camera && <p className="text-[11px]"><strong>Camera:</strong> {product.specs.camera}</p>}
                  {product.specs.battery && <p className="text-[11px]"><strong>Pin:</strong> {product.specs.battery}</p>}
                </div>
              )}

            </div>

            {/* Right Column: Exact Device Info or Order Options & Lead Form */}
            <div className="lg:col-span-6 p-5 sm:p-6 space-y-5">
              
              {/* ================= THÔNG SỐ ĐẶC THÙ ================= */}
              {isInStock ? (
                /* --- KHỐI THÔNG TIN CỦA CÂY MÁY SẴN CỤ THỂ --- */
                <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      Thông tin cây máy đang bán tại quầy:
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      Có sẵn test máy
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
                      <span className="text-[10px] text-neutral-400 block">Dung lượng máy:</span>
                      <span className="font-extrabold text-white text-sm">{exactStorage}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
                      <span className="text-[10px] text-neutral-400 block">Màu sắc thực tế:</span>
                      <span className="font-extrabold text-white text-sm flex items-center gap-1.5">
                        <span 
                          className="w-3 h-3 rounded-full border border-neutral-600 inline-block shrink-0" 
                          style={{ backgroundColor: exactColor.hex }}
                        />
                        {exactColor.name}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
                      <span className="text-[10px] text-neutral-400 block">Tình trạng pin:</span>
                      <span className="font-bold text-emerald-400">{product.batteryHealth || 'Pin 100%'}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
                      <span className="text-[10px] text-neutral-400 block">Ngoại hình:</span>
                      <span className="font-bold text-neutral-200">{product.condition}</span>
                    </div>
                  </div>

                  {product.imei && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
                      <span className="text-neutral-300 font-medium flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5 text-emerald-400" />
                        Mã IMEI / Định danh:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-400 text-sm">{displayedImei}</span>
                        {isAdmin && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-sans font-bold">
                            Quyền Admin
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* --- KHỐI CHỌN CHO HÀNG ORDER --- */
                <div className="space-y-4">
                  {/* Storage Selection */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-200 mb-2">
                      1. Chọn Dung Lượng Bộ Nhớ Cần Order:
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {product.storageOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSelectedStorage(opt)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                            selectedStorage === opt
                              ? 'bg-amber-400 text-black border-amber-400 shadow-md font-black'
                              : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Selection */}
                  {product.colors && product.colors.length > 0 && (
                    <div>
                      <label className="block text-xs font-bold text-neutral-200 mb-2">
                        2. Chọn Màu Sắc Order:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {product.colors.map((color) => (
                          <button
                            key={color.name}
                            type="button"
                            onClick={() => setSelectedColor(color.name)}
                            className={`p-2.5 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all cursor-pointer ${
                              selectedColor === color.name
                                ? 'bg-neutral-800 text-white border-amber-400 font-bold shadow-md'
                                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                            }`}
                          >
                            <span 
                              className="w-3.5 h-3.5 rounded-full border border-neutral-700 shrink-0" 
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="truncate">{color.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* VIP Gifts included */}
              <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2 text-xs text-neutral-300">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-amber-400 shrink-0" />
                  Quà tặng & Quyền lợi VIP đi kèm:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-neutral-300">
                  <p>• <strong>Củ Sạc 20w Bảo Hành 1 Năm</strong></p>
                  <p>• <strong>Tai Nghe Bluetooth Bảo Hành 6 Tháng</strong></p>
                  <p>• Dây Sạc</p>
                  <p>• Ốp lưng & Cường lực trọn đời</p>
                  <p>• Thay pin free &lt; 80% trọn đời</p>
                </div>
              </div>

              {/* CHÍNH SÁCH HỖ TRỢ TRẢ GÓP */}
              <div className="p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-2.5 text-xs text-neutral-300">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
                    Chính Sách Hỗ Trợ Trả Góp:
                  </p>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Duyệt Nhanh 15 Phút
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {/* Góp Ngân Hàng */}
                  <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>Góp Ngân Hàng / Thẻ Tín Dụng</span>
                    </div>
                    <p className="text-neutral-300">• Trả trước từ <strong className="text-emerald-400">0Đ</strong></p>
                    <p className="text-neutral-400 text-[10px]">• Thủ tục: CCCD, duyệt nhanh 15 phút</p>
                  </div>

                  {/* Góp Tay Đôi */}
                  <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <Handshake className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Góp Tay Đôi (Tại Cửa Hàng)</span>
                    </div>
                    <p className="text-neutral-300">• <strong className="text-amber-400">Trả trước từ 50% nhận máy ngay</strong></p>
                    <p className="text-neutral-400 text-[10px]">• Thủ tục đơn giản, linh hoạt tại shop</p>
                  </div>
                </div>
              </div>

              {/* Customer Registration Form */}
              <form onSubmit={handleSubmit} className="pt-2 border-t border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {isInStock ? 'Đăng Ký Giữ Cây Máy Này:' : 'Đăng Ký Đặt Hàng Order:'}
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                    Không cọc trước
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1 font-medium">
                      Họ và Tên của bạn *
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ví dụ: Anh Tuấn / Chị Lan"
                        className="w-full pl-8 pr-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1 font-medium">
                      Số Điện Thoại (Zalo) *
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Ví dụ: 0987 654 321"
                        className="w-full pl-8 pr-3 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white font-mono transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1 font-medium">
                    Ghi chú thêm (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ví dụ: Giữ máy đến tối mình qua xem..."
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
                  />
                </div>

                {/* Submit Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm tracking-wide transition-all shadow-xl active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer ${
                      isInStock
                        ? 'bg-white hover:bg-neutral-200 text-black'
                        : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black'
                    }`}
                  >
                    {isSubmitting ? (
                      <span>Đang gửi thông tin...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>
                          {isInStock 
                            ? `XÁC NHẬN GIỮ CÂY MÁY NÀY ${product.imei ? `(Đuôi ...${product.imei.replace(/[^a-zA-Z0-9]/g, '').slice(-4)})` : ''}`
                            : 'ĐẶT HÀNG ORDER 15 - 30 PHÚT GIÁ TỐT NHẤT'}
                        </span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-neutral-500 mt-2">
                    🔒 Thông tin được bảo mật và tự động gửi về hệ thống Táo New.
                  </p>
                </div>

              </form>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
