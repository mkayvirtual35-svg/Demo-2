import React from 'react';
import { 
  RotateCcw, 
  BatteryMedium, 
  ShieldAlert, 
  Layers, 
  Cpu, 
  Percent, 
  CheckCheck,
  ShieldCheck
} from 'lucide-react';
import { StoreSettings } from '../types';

interface WarrantySectionProps {
  settings: StoreSettings;
}

export const WarrantySection: React.FC<WarrantySectionProps> = ({ settings }) => {
  const policies = [
    {
      icon: RotateCcw,
      title: '1 Đổi 1 Trong 60 Ngày Đầu',
      tag: 'ĐỔI MÁY NGAY TẠI QUẦY',
      description: 'Nếu phát sinh lỗi phần cứng từ nhà sản xuất, khách hàng được đổi ngay một máy khác tương đương tại quầy trong 60 ngày đầu, không giữ máy kiểm tra lâu.',
      badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    },
    {
      icon: BatteryMedium,
      title: 'Thay Pin Miễn Phí Trọn Đời',
      tag: 'PIN DƯỚI 80% LÀ ĐƯỢC THAY',
      description: 'Trong suốt quá trình sử dụng máy mua tại Táo New, khi dung lượng pin tụt xuống dưới 80%, cửa hàng hỗ trợ thay pin mới chuẩn chất lượng miễn phí 100%.',
      badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10'
    },
    {
      icon: Layers,
      title: 'Tặng Ốp & Cường Lực Trọn Đời',
      tag: 'DÁN MỚI MIỄN PHÍ',
      description: 'Khách hàng ghé shop bất cứ lúc nào đều được dán mới kính cường lực cao cấp và tặng ốp lưng bảo vệ máy hoàn toàn miễn phí trọn đời.',
      badgeColor: 'text-blue-400 border-blue-500/30 bg-blue-500/10'
    },
    {
      icon: CheckCheck,
      title: 'Tặng Trọn Bộ Combo Phụ Kiện VIP',
      tag: 'BẢO HÀNH PHỤ KIỆN',
      description: 'Tặng kèm Củ Sạc 20w Bảo Hành 1 Năm, Tai Nghe Bluetooth Bảo Hành 6 Tháng, Dây Sạc, cùng ốp lưng và dán cường lực miễn phí trọn đời khi mua máy.',
      badgeColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10'
    },
    {
      icon: Cpu,
      title: 'Bảo Hành Phần Cứng 12 Tháng',
      tag: 'HỖ TRỢ PHẦN MỀM TRỌN ĐỜI',
      description: 'Bảo hành phần cứng 12 tháng an tâm tuyệt đối. Hỗ trợ phần mềm trọn đời: Cài đặt lại iOS, chuyển dữ liệu từ máy cũ, kích hoạt và chuyển eSIM miễn phí.',
      badgeColor: 'text-sky-400 border-sky-500/30 bg-sky-500/10'
    },
    {
      icon: Percent,
      title: 'Giảm 30% Chi Phí Sửa Chữa',
      tag: 'HỖ TRỢ TẬN TÂM',
      description: 'Trong thời gian bảo hành phần cứng, nếu máy không may bị rơi vỡ, cấn móp hoặc vô nước do người dùng, Táo New hỗ trợ giảm ngay 30% tổng chi phí sửa chữa.',
      badgeColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10'
    }
  ];

  return (
    <section id="warranty-section" className="py-14 bg-[#09090b] border-b border-neutral-800 text-white relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-xs font-semibold text-neutral-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            CHÍNH SÁCH BẢO HÀNH TOÀN DIỆN
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Chính Sách Bảo Hành Tại Táo New
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            Cam kết chất lượng chuẩn zin nguyên bản với phương châm <strong className="text-white font-semibold">"{settings.slogan}"</strong>. 
            Mọi quyền lợi của quý khách được bảo đảm rõ ràng qua 6 cam kết bảo hành bên dưới.
          </p>
        </div>

        {/* 6 Policies Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {policies.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="group relative rounded-2xl bg-neutral-900/70 hover:bg-neutral-900 p-5 sm:p-6 border border-neutral-800/90 hover:border-neutral-700 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5 text-neutral-200" />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${item.badgeColor}`}>
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                    <span className="text-emerald-400 font-mono">0{idx + 1}.</span>
                    <span>{item.title}</span>
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500">
                  <span>Cam kết theo Serial / IMEI</span>
                  <span className="text-emerald-400 font-semibold">Táo New Care</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner Guarantee */}
        <div className="mt-8 rounded-2xl bg-gradient-to-r from-neutral-900 via-[#141418] to-neutral-900 p-5 sm:p-6 border border-neutral-700/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xl">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
                <span>Táo New - Không Zin Tặng Máy Hoàn Tiền 100%</span>
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Quý khách được quyền kiểm tra 3uTools, test máy trực tiếp cùng kỹ thuật viên trước khi thanh toán.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <a
              href={`tel:${settings.hotlines[0]}`}
              className="px-4 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-colors shadow-md whitespace-nowrap"
            >
              Gọi Hotline {settings.hotlines[0]}
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
