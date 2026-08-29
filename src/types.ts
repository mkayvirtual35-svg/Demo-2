export type SeriesCategory = 
  | '17 Series'
  | '16 Series'
  | '15 Series'
  | '14 Series'
  | '13 Series'
  | '12 Series'
  | '11 Series'
  | 'Phụ kiện';

export type ProductAvailability = 
  | 'in_stock'
  | 'order'
  | 'in_stock_99'
  | 'in_stock_clearance'
  | 'order_99'
  | 'order_new_seal';

export interface ProductColor {
  name: string;
  hex: string;
  image?: string;
}

export interface ProductDetailedImages {
  overview?: string[];     // Ngoại hình tổng thể (Mặt trước, mặt sau)
  screenBezel?: string[];  // Viền màn hình & Khung viền các góc
  camera?: string[];       // Cụm Camera (Mắt cam, viền cam)
  details?: string[];      // Chi tiết khác (Cổng sạc, khay SIM, loa, test 3uTools zin xanh)
}

export interface Product {
  id: string;
  name: string;
  series: SeriesCategory;
  availability: ProductAvailability; // 'in_stock_99' | 'in_stock_clearance' | 'order_99' | 'order_new_seal' | 'in_stock' | 'order'
  price: number; // e.g. 29500000
  originalPrice?: number; // e.g. 33990000
  
  // Đối với Hàng Sẵn (in_stock): Là 1 cây máy cụ thể duy nhất
  imei?: string; // Mã IMEI / Serial của cây máy (e.g. '358921098498923')
  exactStorage?: string; // Dung lượng cụ thể của cây máy (e.g. '256GB')
  exactColor?: ProductColor; // Màu sắc cụ thể của cây máy (e.g. { name: 'Titan Sa Mạc', hex: '#D4AF37' })
  
  // Đối với Hàng Order (order): Có nhiều tùy chọn cho khách chọn
  storageOptions: string[]; // ['128GB', '256GB', '512GB', '1TB']
  colors: ProductColor[];
  
  condition: string; // 'New Seal 100%' | 'Like New 99%' | 'Máy Thanh Lý' | 'New 100%'
  batteryHealth?: string; // 'Pin 100%', 'Pin 9x%', 'Thay pin new miễn phí'
  image: string;
  gallery?: string[];
  detailedImages?: ProductDetailedImages; // Các mục ảnh chi tiết: ngoại hình, viền màn hình, cam, chi tiết
  tag?: string; // 'HOT SALE', 'SẴN HÀNG', 'ORDER 15-30P', 'MÁY THANH LÝ'
  featured?: boolean;
  orderEstimateDays?: string; // '15 - 30 Phút'
  shortDesc?: string;
  specs?: {
    screen?: string;
    chip?: string;
    camera?: string;
    battery?: string;
    sim?: string;
  };
}

export interface StoreGalleryImage {
  id: string;
  url: string;
  title: string;
  caption?: string;
}

export interface CustomerReviewItem {
  id: string;
  customerName: string;
  deviceBought: string;
  imageUrl: string;
  date?: string;
  feedback?: string;
}

export interface LeadOrder {
  id: string;
  customerName: string;
  phoneNumber: string;
  interestedProduct: string;
  imei?: string; // IMEI cây máy cụ thể nếu khách đặt máy có sẵn
  storageSelected?: string;
  colorSelected?: string;
  orderType: 'in_stock' | 'order' | 'consultation' | string;
  note?: string;
  createdAt: string; // ISO string
  status: 'new' | 'contacted' | 'completed' | 'closed' | 'cancelled';
  syncedToSheet?: boolean;
}

export interface StoreSettings {
  name: string;
  logoUrl?: string; // URL hoặc Data URL của logo cửa hàng
  slogan: string;
  address: string;
  hotlines: string[];
  zaloLink: string;
  facebookLink: string;
  googleMapsLink: string;
  googleSheetWebhookUrl: string;
  googleSheetProductUrl?: string; // URL Google Sheet danh mục máy để tự động tải khi F5
  autoSyncGoogleSheet?: boolean; // Tự động đồng bộ 2 chiều khi F5 hoặc khi thêm/sửa/xóa máy
  adminPin: string;
  storeImages?: StoreGalleryImage[]; // Danh sách ảnh showroom
  customerReviews?: CustomerReviewItem[]; // Danh sách ảnh bàn giao & tri ân khách hàng
  warrantyPolicy: {
    exchangeDays: number; // 60 ngày 1 đổi 1
    freeBatteryThreshold: number; // dưới 80% thay free
    freeAccessoriesLifeTime: string; // Ốp lưng & cường lực miễn phí trọn đời
    freeGiftCombo: string; // Củ Sạc 20w Bảo Hành 1 Năm + Tai Nghe Bluetooth Bảo Hành 6 Tháng
    hardwareWarranty: string; // 1 năm
    softwareWarranty: string; // Trọn đời (Cài lại iOS, chuyển data, cài eSIM)
    repairDiscount: string; // Giảm 30% chi phí sửa chữa trong thời gian bảo hành phần cứng
  };
}
