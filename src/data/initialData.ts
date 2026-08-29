import { Product, StoreSettings } from '../types';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  name: 'Táo New',
  logoUrl: '', // Người dùng có thể tải lên từ máy tính hoặc dán link trong Admin
  slogan: 'Không Zin Tặng Máy Hoàn Tiền 100%',
  address: 'DB4 Suncasa Vĩnh Tân, TP Hồ Chí Minh',
  hotlines: ['0388859959', '0777789221'],
  zaloLink: 'https://zalo.me/0388859959',
  facebookLink: 'https://facebook.com/taonew.official',
  googleMapsLink: 'https://maps.google.com/?q=DB4+Suncasa+Vinh+Tan+TP+Ho+Chi+Minh',
  googleSheetWebhookUrl: '',
  googleSheetProductUrl: '',
  autoSyncGoogleSheet: true,
  adminPin: '8888',
  storeImages: [
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
      caption: 'Củ sạc 20W bảo hành 1 năm, tai nghe Bluetooth bảo hành 6 tháng, dây sạc và ốp lưng cao cấp.'
    }
  ],
  customerReviews: [
    {
      id: 'rev-1',
      customerName: 'Khách Hàng Táo New',
      deviceBought: 'iPhone 16 Pro Max 256GB',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      date: 'Hôm qua',
      feedback: 'Máy chuẩn đẹp keng, kỹ thuật test 3uTools zin xanh 100%, tặng full sạc cáp 20W và tai nghe rất xịn!'
    },
    {
      id: 'rev-2',
      customerName: 'Khách Hàng Táo New',
      deviceBought: 'iPhone 15 Pro Max 256GB',
      imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
      date: '3 ngày trước',
      feedback: 'Được dán cường lực và ốp lưng miễn phí trọn đời, nhân viên hỗ trợ chuyển toàn bộ dữ liệu máy cũ rất nhanh.'
    },
    {
      id: 'rev-3',
      customerName: 'Khách Hàng Táo New',
      deviceBought: 'iPhone 14 Pro Max 128GB',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
      date: '5 ngày trước',
      feedback: 'Mua hàng thanh lý giá siêu tốt mà máy dùng cực ngon, bảo hành 1 đổi 1 60 ngày an tâm tuyệt đối!'
    },
    {
      id: 'rev-4',
      customerName: 'Khách Hàng Táo New',
      deviceBought: 'iPhone 16 128GB',
      imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
      date: '1 tuần trước',
      feedback: 'Order đúng 20 phút là có máy New Seal kích hoạt bảo hành Apple, giá mềm hơn các chuỗi lớn nhiều.'
    },
    {
      id: 'rev-5',
      customerName: 'Khách Hàng Táo New',
      deviceBought: 'iPhone 13 Pro Max 128GB',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
      date: '2 tuần trước',
      feedback: 'Màn hình zin keng không ám ố, pin trâu, bảo hành tận tâm 12 tháng rất uy tín!'
    }
  ],
  warrantyPolicy: {
    exchangeDays: 60,
    freeBatteryThreshold: 80,
    freeAccessoriesLifeTime: 'Tặng ốp lưng & dán cường lực miễn phí trọn đời máy',
    freeGiftCombo: 'Củ Sạc 20w Bảo Hành 1 Năm + Tai Nghe Bluetooth Bảo Hành 6 Tháng + Dây Sạc',
    hardwareWarranty: 'Bảo hành phần cứng toàn diện 01 năm',
    softwareWarranty: 'Bảo hành phần mềm trọn đời (Cài lại iOS, Chuyển dữ liệu, Kích hoạt eSIM)',
    repairDiscount: 'Giảm 30% chi phí sửa chữa trên hóa đơn nếu phát sinh lỗi người dùng trong thời gian bảo hành phần cứng'
  }
};

export const INITIAL_PRODUCTS: Product[] = [
  // --- 16 SERIES (CÂY MÁY CỤ THỂ CÓ SẴN TẠI QUẦY) ---
  {
    id: 'ip-16-promax-256',
    name: 'iPhone 16 Pro Max 256GB',
    series: '16 Series',
    availability: 'in_stock',
    imei: '358921098498923',
    exactStorage: '256GB',
    exactColor: { name: 'Titan Sa Mạc', hex: '#D4AF37' },
    price: 30490000,
    originalPrice: 34990000,
    storageOptions: ['256GB'],
    colors: [{ name: 'Titan Sa Mạc', hex: '#D4AF37' }],
    condition: 'Like New 99%',
    batteryHealth: 'Pin 100% (Sạc 12 lần)',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80'
    ],
    detailedImages: {
      overview: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80'
      ],
      screenBezel: [
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80'
      ],
      camera: [
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80'
      ],
      details: [
        'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&auto=format&fit=crop&q=80'
      ]
    },
    tag: 'BÁN CHẠY NHẤT',
    featured: true,
    orderEstimateDays: '15 - 30 Phút',
    shortDesc: 'Cây máy chuẩn zin nguyên bản 100%, ngoại hình đẹp như mới, pin 100%, tặng full sạc 20W + cáp + tai nghe.',
    specs: {
      screen: '6.9 inch Super Retina XDR OLED 120Hz ProMotion',
      chip: 'Apple A18 Pro 3nm',
      camera: 'Chính 48MP + Góc Rộng 48MP + Tele 5x',
      battery: 'Pin trâu tới 33h xem video, sạc nhanh',
      sim: '2 eSIM hoặc 1 Nano SIM + 1 eSIM'
    }
  },
  {
    id: 'ip-16-pro-128',
    name: 'iPhone 16 Pro 128GB',
    series: '16 Series',
    availability: 'in_stock',
    imei: '358921098494419',
    exactStorage: '128GB',
    exactColor: { name: 'Titan Tự Nhiên', hex: '#9E988E' },
    price: 24890000,
    originalPrice: 28990000,
    storageOptions: ['128GB'],
    colors: [{ name: 'Titan Tự Nhiên', hex: '#9E988E' }],
    condition: 'Like New 99%',
    batteryHealth: 'Pin 100%',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
    tag: 'SẴN HÀNG TẠI SHOP',
    featured: true,
    orderEstimateDays: '15 - 30 Phút',
    shortDesc: 'Kích thước nhỏ gọn 6.3 inch vừa tay, Chip A18 Pro siêu mượt, Camera Nút chụp chuyên nghiệp.',
    specs: {
      screen: '6.3 inch Super Retina XDR OLED 120Hz',
      chip: 'Apple A18 Pro',
      camera: 'Hệ thống 3 Camera 48MP',
      battery: 'Thời lượng pin ấn tượng cả ngày',
      sim: 'eSIM + Nano SIM'
    }
  },
  {
    id: 'ip-16-plus-128',
    name: 'iPhone 16 Plus 128GB',
    series: '16 Series',
    availability: 'in_stock',
    imei: '358921098497182',
    exactStorage: '128GB',
    exactColor: { name: 'Hồng Pastel', hex: '#FFB6C1' },
    price: 20990000,
    originalPrice: 24490000,
    storageOptions: ['128GB'],
    colors: [{ name: 'Hồng Pastel', hex: '#FFB6C1' }],
    condition: 'Like New 99%',
    batteryHealth: 'Pin 100%',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
    tag: 'PIN SIÊU KHỦNG',
    orderEstimateDays: '15 - 30 Phút',
    shortDesc: 'Màn hình lớn 6.7 inch, pin trâu số 1 dòng iPhone 16, màu sắc trẻ trung bắt mắt.',
    specs: {
      screen: '6.7 inch Super Retina XDR OLED',
      chip: 'Apple A18 3nm',
      camera: 'Fusion 48MP + Góc Siêu Rộng 12MP',
      battery: 'Pin cực trâu lên đến 27h'
    }
  },

  // --- 15 SERIES ---
  {
    id: 'ip-15-promax-256',
    name: 'iPhone 15 Pro Max 256GB',
    series: '15 Series',
    availability: 'in_stock',
    imei: '358921098495502',
    exactStorage: '256GB',
    exactColor: { name: 'Titan Tự Nhiên', hex: '#9E988E' },
    price: 24590000,
    originalPrice: 28990000,
    storageOptions: ['256GB'],
    colors: [{ name: 'Titan Tự Nhiên', hex: '#9E988E' }],
    condition: 'Like New 99%',
    batteryHealth: 'Pin 98% Zin Gốc',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
    tag: 'GIÁ CỰC TỐT',
    featured: true,
    orderEstimateDays: '15 - 30 Phút',
    shortDesc: 'Dòng máy quốc dân cao cấp, khung viền Titan siêu nhẹ, cổng sạc Type-C tiện lợi.',
    specs: {
      screen: '6.7 inch OLED Super Retina XDR 120Hz ProMotion',
      chip: 'Apple A17 Pro 3nm',
      camera: '48MP + Zoom quang học 5x',
      battery: 'Thời lượng xem video 29h, sạc Type-C'
    }
  },
  {
    id: 'ip-15-pro-128',
    name: 'iPhone 15 Pro 128GB',
    series: '15 Series',
    availability: 'in_stock',
    imei: '358921098499014',
    exactStorage: '128GB',
    exactColor: { name: 'Titan Xanh', hex: '#2A3441' },
    price: 19890000,
    originalPrice: 23990000,
    storageOptions: ['128GB'],
    colors: [{ name: 'Titan Xanh', hex: '#2A3441' }],
    condition: 'Like New 99%',
    batteryHealth: 'Pin 99%',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
    tag: 'HOT ITEM',
    orderEstimateDays: '15 - 30 Phút',
    shortDesc: 'Cấu hình A17 Pro chơi game mượt mà, màn hình 120Hz siêu êm.',
    specs: {
      screen: '6.1 inch OLED Super Retina XDR 120Hz',
      chip: 'Apple A17 Pro',
      camera: '48MP chuyên nghiệp'
    }
  },
  {
    id: 'ip-15-128',
    name: 'iPhone 15 128GB',
    series: '15 Series',
    availability: 'in_stock',
    imei: '358921098493391',
    exactStorage: '128GB',
    exactColor: { name: 'Hồng Nhạt', hex: '#FAD2E1' },
    price: 14890000,
    originalPrice: 17490000,
    storageOptions: ['128GB'],
    colors: [{ name: 'Hồng Nhạt', hex: '#FAD2E1' }],
    condition: 'Like New 99%',
    batteryHealth: 'Pin 100%',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
    tag: 'GIÁ MỀM',
    orderEstimateDays: '15 - 30 Phút',
    shortDesc: 'Mặt lưng kính nhám sang trọng, cổng Type-C, Dynamic Island.',
    specs: {
      screen: '6.1 inch Super Retina XDR OLED',
      chip: 'Apple A16 Bionic',
      camera: 'Camera chính 48MP sắc nét'
    }
  },

  // --- 14 SERIES ---
  {
    id: 'ip-14-promax-128',
    name: 'iPhone 14 Pro Max 128GB',
    series: '14 Series',
    availability: 'in_stock',
    imei: '358921098496621',
    exactStorage: '128GB',
    exactColor: { name: 'Tím Đậm (Deep Purple)', hex: '#4B3F72' },
    price: 18990000,
    originalPrice: 22490000,
    storageOptions: ['128GB'],
    colors: [{ name: 'Tím Đậm (Deep Purple)', hex: '#4B3F72' }],
    condition: 'Like New 99%',
    batteryHealth: 'Pin 93% (Hỗ trợ thay mới free)',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
    tag: 'SIÊU PHẨM TÍM',
    featured: true,
    orderEstimateDays: '15 - 30 Phút',
    shortDesc: 'Màu tím Deep Purple huyền thoại, màn hình Dynamic Island 120Hz ProMotion đỉnh cao.',
    specs: {
      screen: '6.7 inch OLED 120Hz Always-On Display',
      chip: 'Apple A16 Bionic',
      camera: 'Camera 48MP Pro'
    }
  },
  {
    id: 'ip-14-128',
    name: 'iPhone 14 128GB',
    series: '14 Series',
    availability: 'in_stock',
    imei: '358921098491145',
    exactStorage: '128GB',
    exactColor: { name: 'Xanh Dương', hex: '#9BB8CD' },
    price: 11990000,
    originalPrice: 13990000,
    storageOptions: ['128GB'],
    colors: [{ name: 'Xanh Dương', hex: '#9BB8CD' }],
    condition: 'Like New 99%',
    batteryHealth: 'Pin 96%',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
    tag: 'GIÁ TỐT',
    orderEstimateDays: '15 - 30 Phút',
    shortDesc: 'Thiết kế đẹp, camera chụp đêm xuất sắc, cấu hình ổn định dùng 4-5 năm tới.',
    specs: {
      screen: '6.1 inch Super Retina XDR OLED',
      chip: 'Apple A15 Bionic'
    }
  },

  // --- 13 SERIES ---
  {
    id: 'ip-13-promax-128',
    name: 'iPhone 13 Pro Max 128GB',
    series: '13 Series',
    availability: 'in_stock',
    imei: '358921098498872',
    exactStorage: '128GB',
    exactColor: { name: 'Xanh Sierra Blue', hex: '#9BB8CD' },
    price: 14890000,
    originalPrice: 17490000,
    storageOptions: ['128GB'],
    colors: [{ name: 'Xanh Sierra Blue', hex: '#9BB8CD' }],
    condition: 'Like New 99%',
    batteryHealth: 'Pin 90% (Thay pin new trọn đời)',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
    tag: 'QUỐC DÂN SIERRA BLUE',
    featured: true,
    orderEstimateDays: '15 - 30 Phút',
    shortDesc: 'Màn hình 120Hz ProMotion siêu mượt, camera 3 mắt chụp ảnh xóa phông đỉnh cao, pin trâu vô địch.',
    specs: {
      screen: '6.7 inch OLED 120Hz ProMotion',
      chip: 'Apple A15 Bionic',
      camera: 'Bộ 3 Camera 12MP Zoom quang 3x'
    }
  },
  {
    id: 'ip-13-128',
    name: 'iPhone 13 128GB',
    series: '13 Series',
    availability: 'in_stock',
    imei: '358921098492298',
    exactStorage: '128GB',
    exactColor: { name: 'Hồng Pink', hex: '#FFCAD4' },
    price: 9990000,
    originalPrice: 12490000,
    storageOptions: ['128GB'],
    colors: [{ name: 'Hồng Pink', hex: '#FFCAD4' }],
    condition: 'Like New 99%',
    batteryHealth: 'Pin New 100%',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
    tag: 'BEST SELLER DƯỚI 10TR',
    featured: true,
    orderEstimateDays: '15 - 30 Phút',
    shortDesc: 'Camera chéo đặc trưng, pin trâu hơn iPhone 12 đến 2.5 tiếng, giá cực tốt cho học sinh sinh viên.',
    specs: {
      screen: '6.1 inch Super Retina XDR OLED',
      chip: 'Apple A15 Bionic'
    }
  },

  // --- 12 SERIES ---
  {
    id: 'ip-12-promax-128',
    name: 'iPhone 12 Pro Max 128GB',
    series: '12 Series',
    availability: 'in_stock',
    imei: '358921098497734',
    exactStorage: '128GB',
    exactColor: { name: 'Xanh Pacific Blue', hex: '#2A475E' },
    price: 11590000,
    originalPrice: 13990000,
    storageOptions: ['128GB'],
    colors: [{ name: 'Xanh Pacific Blue', hex: '#2A475E' }],
    condition: 'Like New 99%',
    batteryHealth: 'Pin 89% (Tặng thay pin new)',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
    tag: 'MÁY TO GIÁ RẺ',
    orderEstimateDays: '15 - 30 Phút',
    shortDesc: 'Màn hình lớn 6.7 inch, viền thép vuông vức nam tính, 3 camera chụp đêm cực nét.',
    specs: {
      screen: '6.7 inch OLED Super Retina XDR',
      chip: 'Apple A14 Bionic 5G'
    }
  },
  {
    id: 'ip-12-64',
    name: 'iPhone 12 64GB',
    series: '12 Series',
    availability: 'in_stock',
    imei: '358921098495519',
    exactStorage: '64GB',
    exactColor: { name: 'Tím Purple', hex: '#C8B6FF' },
    price: 6890000,
    originalPrice: 8490000,
    storageOptions: ['64GB'],
    colors: [{ name: 'Tím Purple', hex: '#C8B6FF' }],
    condition: 'Like New 99%',
    batteryHealth: 'Pin New 100%',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
    tag: 'GIÁ CHỈ TỪ 6.8TR',
    featured: true,
    orderEstimateDays: '15 - 30 Phút',
    shortDesc: 'Thiết kế vuông vắn chuẩn 5G, màn hình OLED siêu sắc nét, giá rẻ dễ tiếp cận.',
    specs: {
      screen: '6.1 inch Super Retina XDR OLED',
      chip: 'Apple A14 Bionic 5G'
    }
  },

  // --- 11 SERIES ---
  {
    id: 'ip-11-64',
    name: 'iPhone 11 64GB',
    series: '11 Series',
    availability: 'in_stock',
    imei: '358921098494408',
    exactStorage: '64GB',
    exactColor: { name: 'Trắng White', hex: '#F0EFEA' },
    price: 5490000,
    originalPrice: 6990000,
    storageOptions: ['64GB'],
    colors: [{ name: 'Trắng White', hex: '#F0EFEA' }],
    condition: 'Like New 99%',
    batteryHealth: 'Pin New 100%',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
    tag: 'MÁY PHỤ QUỐC DÂN',
    orderEstimateDays: '15 - 30 Phút',
    shortDesc: 'Dòng máy giá cực rẻ dưới 6 triệu, camera góc rộng chụp ảnh đẹp, tặng pin new 100%.',
    specs: {
      screen: '6.1 inch Liquid Retina HD',
      chip: 'Apple A13 Bionic'
    }
  },

  // --- 17 SERIES (HÀNG ORDER SIÊU TỐC 15 - 30 PHÚT - CÓ ĐẦY ĐỦ TÙY CHỌN DUNG LƯỢNG & MÀU SẮC) ---
  {
    id: 'ip-17-promax-order',
    name: 'iPhone 17 Pro Max (Hàng Order)',
    series: '17 Series',
    availability: 'order',
    price: 36990000,
    originalPrice: 39990000,
    storageOptions: ['256GB', '512GB', '1TB', '2TB'],
    condition: 'New Seal 100%',
    batteryHealth: 'Pin 100%',
    colors: [
      { name: 'Titanium Blue Khói', hex: '#435058' },
      { name: 'Titanium Tự Nhiên', hex: '#9E988E' },
      { name: 'Titanium Đen', hex: '#1E1E24' }
    ],
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
    tag: 'ORDER 15-30P',
    featured: true,
    orderEstimateDays: '15 - 30 Phút',
    shortDesc: 'Hàng New Seal chưa kích hoạt, điều phối siêu tốc từ kho tổng về quầy chỉ 15-30 phút. Khách hàng được tự chọn màu và dung lượng.',
    specs: {
      screen: '6.9 inch LTPO 120Hz ProMotion',
      chip: 'Apple A19 Pro 2nm',
      camera: 'Bộ 3 Camera 48MP Periscope Zoom 10x'
    }
  },
  {
    id: 'ip-17-pro-order',
    name: 'iPhone 17 Pro (Hàng Order)',
    series: '17 Series',
    availability: 'order',
    price: 31490000,
    originalPrice: 33990000,
    storageOptions: ['256GB', '512GB', '1TB'],
    condition: 'New Seal 100%',
    batteryHealth: 'Pin 100%',
    colors: [
      { name: 'Titanium Tự Nhiên', hex: '#9E988E' },
      { name: 'Titanium Đen', hex: '#1E1E24' },
      { name: 'Titanium Trắng', hex: '#F0EFEA' }
    ],
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
    tag: 'ORDER 15-30P',
    orderEstimateDays: '15 - 30 Phút',
    shortDesc: 'Hàng New Seal nguyên hộp, bảo hành chính hãng Apple 12 tháng.',
    specs: {
      screen: '6.3 inch 120Hz',
      chip: 'Apple A19 Pro'
    }
  },

  // --- PHỤ KIỆN APPLE CHÍNH HÃNG ---
  {
    id: 'acc-sac-20w-apple',
    name: 'Củ Sạc Nhanh Apple 20W Type-C Chính Hãng',
    series: 'Phụ kiện',
    availability: 'in_stock',
    imei: 'Mã: ACC-20W-01',
    exactStorage: '20W Type-C',
    exactColor: { name: 'Trắng', hex: '#FFFFFF' },
    price: 350000,
    originalPrice: 590000,
    storageOptions: ['Chuẩn Type-C'],
    condition: 'New 100%',
    colors: [
      { name: 'Trắng', hex: '#FFFFFF' }
    ],
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
    tag: 'CHÍNH HÃNG',
    shortDesc: 'Củ sạc nhanh Apple 20W chính hãng chống cháy nổ, bảo vệ pin iPhone tối đa.',
    specs: {
      battery: 'Hỗ trợ sạc nhanh PD 20W cho iPhone 8 - 16 Series'
    }
  },
  {
    id: 'acc-cap-du-typec',
    name: 'Cáp Sạc Nhanh C to C / C to Lightning Dù Cao Cấp',
    series: 'Phụ kiện',
    availability: 'in_stock',
    imei: 'Mã: ACC-CABLE-02',
    exactStorage: 'Dài 1m',
    exactColor: { name: 'Dây Dù Trắng', hex: '#F0EFEA' },
    price: 150000,
    originalPrice: 290000,
    storageOptions: ['Type-C to C', 'Type-C to Lightning'],
    condition: 'New 100%',
    colors: [
      { name: 'Dây Dù Trắng', hex: '#F0EFEA' }
    ],
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    tag: 'BỀN BỈ',
    shortDesc: 'Cáp bện dù chống rối, chống đứt gãy, truyền dữ liệu và sạc nhanh 60W.',
    specs: {
      screen: 'Chiều dài 1 mét'
    }
  },
  {
    id: 'acc-airpods-pro-2',
    name: 'Tai Nghe Apple AirPods Pro 2 Type-C',
    series: 'Phụ kiện',
    availability: 'in_stock',
    imei: 'Serial: AP2-8812',
    exactStorage: 'Bản Type-C',
    exactColor: { name: 'Trắng', hex: '#FFFFFF' },
    price: 4990000,
    originalPrice: 5990000,
    storageOptions: ['Chân Type-C'],
    condition: 'New Seal 100%',
    colors: [
      { name: 'Trắng', hex: '#FFFFFF' }
    ],
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80',
    tag: 'CHỐNG ỒN ĐỈNH',
    shortDesc: 'Chống ồn chủ động ANC gấp 2 lần, âm thanh không gian Spatial Audio.',
    specs: {
      battery: 'Pin nghe liên tục tới 6h (30h cùng hộp sạc)'
    }
  }
];
