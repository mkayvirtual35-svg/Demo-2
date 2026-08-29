import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Send, 
  Phone, 
  User, 
  ShieldCheck, 
  Gift, 
  Smartphone,
  Hash,
  CreditCard,
  Handshake,
  Building2
} from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { maskIMEI, getMaskedIMEIEndOnly } from '../services/storage';

interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  initialProduct?: Product | null;
  initialStorage?: string;
  initialColor?: string;
  settings: StoreSettings;
  onSubmitOrder: (data: {
    customerName: string;
    phoneNumber: string;
    interestedProduct: string;
    imei?: string;
    storageSelected?: string;
    colorSelected?: string;
    orderType: 'in_stock' | 'order' | 'consultation' | string;
    note?: string;
  }) => Promise<void>;
}

export const QuickOrderModal: React.FC<QuickOrderModalProps> = ({
  isOpen,
  onClose,
  products,
  initialProduct,
  initialStorage,
  initialColor,
  settings,
  onSubmitOrder,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedProductName, setSelectedProductName] = useState<string>(
    initialProduct?.name || (products[0]?.name ?? 'Tư Vấn Chọn iPhone')
  );
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const currentProduct = products.find(p => p.name === selectedProductName) || initialProduct;
  const isInStock = currentProduct?.availability === 'in_stock' || currentProduct?.availability === 'in_stock_99' || currentProduct?.availability === 'in_stock_clearance';

  const exactStorage = initialStorage || currentProduct?.exactStorage || currentProduct?.storageOptions[0] || '128GB';
  const exactColor = initialColor || currentProduct?.exactColor?.name || currentProduct?.colors[0]?.name || 'Mặc định';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phoneNumber.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmitOrder({
        customerName: customerName.trim(),
        phoneNumber: phoneNumber.trim(),
        interestedProduct: selectedProductName,
        imei: isInStock ? currentProduct?.imei : undefined,
        storageSelected: exactStorage,
        colorSelected: exactColor,
        orderType: currentProduct ? currentProduct.availability : 'consultation',
        note: note.trim()
      });
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setCustomerName('');
    setPhoneNumber('');
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#121216] border border-neutral-800 text-white shadow-2xl overflow-hidden p-6 sm:p-7">
        
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <h3 className="text-2xl font-black text-white">Đã Nhận Thông Tin Thành Công!</h3>
            
            <p className="text-xs sm:text-sm text-neutral-300">
              Cảm ơn <strong className="text-white">{customerName}</strong>! Táo New đã lưu lại thông tin giữ máy của bạn và sẽ gọi số <strong className="text-emerald-400 font-bold">{phoneNumber}</strong> trong ít phút.
            </p>

            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-left text-xs space-y-2 text-neutral-300">
              <p>📱 <strong>Máy quan tâm:</strong> {selectedProductName} ({exactStorage} - {exactColor})</p>
              {isInStock && currentProduct?.imei && (
                <p>🔖 <strong>Mã cây máy:</strong> <span className="font-mono text-emerald-400">{maskIMEI(currentProduct.imei)}</span></p>
              )}
              <p className="font-semibold text-white pt-1">🎁 Quà tặng & Quyền lợi VIP đi kèm:</p>
              <ul className="space-y-1 list-disc pl-4 text-neutral-300 text-[11px]">
                <li><strong>Củ Sạc 20w Bảo Hành 1 Năm</strong>.</li>
                <li><strong>Tai Nghe Bluetooth Bảo Hành 6 Tháng</strong>.</li>
                <li>Bảo hành 1 đổi 1 trong 60 ngày.</li>
                <li>Thay pin mới miễn phí khi tuột dưới 80% trọn đời.</li>
                <li>Dán cường lực & tặng ốp lưng miễn phí trọn đời máy.</li>
              </ul>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <a
                href={`tel:${settings.hotlines[0]}`}
                className="px-4 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors flex items-center gap-2"
              >
                <Phone className="w-3.5 h-3.5" />
                Hotline: {settings.hotlines[0]}
              </a>
              <button
                onClick={handleResetAndClose}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-900 text-emerald-400 text-xs font-semibold border border-neutral-800 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isInStock ? 'Giữ Cây Máy Có Sẵn Tại Quầy' : 'Đặt Giữ Hàng & Nhận Báo Giá Nhanh'}
              </div>
              <h3 className="text-lg font-bold text-white">
                {isInStock ? 'Đăng Ký Giữ Cây Máy Này' : 'Đăng Ký Nhận Máy / Tư Vấn Báo Giá'}
              </h3>
              <p className="text-xs text-neutral-400">
                Chỉ cần để lại Tên và SĐT, nhân viên Táo New sẽ gọi điện tư vấn chi tiết và giữ máy kèm full quà tặng cho bạn.
              </p>
            </div>

            {/* Product Select */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Dòng máy bạn quan tâm:
              </label>
              <select
                value={selectedProductName}
                onChange={(e) => setSelectedProductName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white transition-colors"
              >
                {products.map((p) => {
                  const itemInStock = p.availability === 'in_stock' || p.availability === 'in_stock_99' || p.availability === 'in_stock_clearance';
                  const tagText = itemInStock
                    ? (p.imei ? `(Sẵn có - ${getMaskedIMEIEndOnly(p.imei)})` : '(Sẵn có tại shop)')
                    : (p.availability === 'order_99' ? '(Order 99%)' : '(Order New Seal)');
                  return (
                    <option key={p.id} value={p.name}>
                      {p.name} {tagText}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* In-Stock Device Details Summary */}
            {currentProduct && (
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-neutral-400 text-[11px] block">Cấu hình cây máy:</span>
                  <span className="font-bold text-white">
                    {exactStorage} • {exactColor} {isInStock && currentProduct.batteryHealth ? `• ${currentProduct.batteryHealth}` : ''}
                  </span>
                </div>
                {isInStock && currentProduct.imei && (
                  <div className="text-right">
                    <span className="text-neutral-500 text-[10px] block">Mã máy:</span>
                    <span className="font-mono text-emerald-400 font-bold text-xs">{maskIMEI(currentProduct.imei)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Họ và Tên của bạn *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ví dụ: Anh Tuấn / Chị Lan"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Số Điện Thoại Nhận Tư Vấn (Zalo) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Ví dụ: 0987 654 321"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white font-mono transition-colors"
                />
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Ghi chú thêm (Tùy chọn)
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Mình muốn xem thêm ảnh 3uTools hoặc hẹn qua shop lúc 18h..."
                className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors"
              />
            </div>

            {/* Installment policy info */}
            <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-2 text-xs text-neutral-300">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Chính Sách Hỗ Trợ Trả Góp:
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Duyệt 15 Phút
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 space-y-0.5">
                  <span className="font-bold text-white flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-sky-400 shrink-0" />
                    Góp Ngân Hàng:
                  </span>
                  <p className="text-neutral-300">Trả trước từ <strong className="text-emerald-400">0Đ</strong> (CCCD)</p>
                </div>
                <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 space-y-0.5">
                  <span className="font-bold text-white flex items-center gap-1">
                    <Handshake className="w-3 h-3 text-amber-400 shrink-0" />
                    Góp Tay Đôi:
                  </span>
                  <p className="text-neutral-300"><strong className="text-amber-400">Trả trước 50%</strong> nhận máy</p>
                </div>
              </div>
            </div>

            {/* Gift perks badge */}
            <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-start gap-2.5 text-xs text-neutral-300">
              <Gift className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Tặng <strong>Củ Sạc 20w (BH 1 Năm)</strong> + <strong>Tai Nghe Bluetooth (BH 6 Tháng)</strong> + Dây Sạc + ốp & cường lực trọn đời.</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-xl font-black text-xs transition-colors shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer ${
                isInStock
                  ? 'bg-white hover:bg-neutral-200 text-black'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black'
              }`}
            >
              {isSubmitting ? (
                <span>Đang gửi thông tin...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  {isInStock ? 'Xác Nhận Giữ Cây Máy Này' : 'Gửi Yêu Cầu Order & Nhận Báo Giá'}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
