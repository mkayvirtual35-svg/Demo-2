import { LeadOrder, Product, SeriesCategory } from '../types';

/**
 * Tiện ích chuyển đổi link chia sẻ Google Drive sang link hình ảnh hiển thị trực tiếp (Direct Embed CDN URL)
 * Hỗ trợ tất cả các định dạng link Google Drive phổ biến:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/file/d/FILE_ID/edit
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - https://drive.google.com/uc?export=view&id=FILE_ID
 * - https://drive.google.com/thumbnail?id=FILE_ID
 * - https://lh3.googleusercontent.com/d/FILE_ID
 */
export function convertGoogleDriveImageUrl(url: string): string {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();

  // Nếu là Google Drive link
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com/file') || trimmed.includes('googleusercontent.com/d/')) {
    // Trích xuất File ID
    const match = 
      trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
      trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
      trimmed.match(/id=([a-zA-Z0-9_-]+)/) ||
      trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);

    if (match && match[1]) {
      const fileId = match[1];
      // Sử dụng Google thumbnail CDN & lh3 CDN tốc độ cao, hỗ trợ ảnh lên tới 1200px
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
    }
  }

  return trimmed;
}

/**
 * Trình phân tích chuỗi CSV đơn giản, an toàn và xử lý dấu nháy kép
 */
export function parseCSVText(text: string): string[][] {
  const lines = text.split(/\r\n|\n/);
  const result: string[][] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    
    const row: string[] = [];
    let insideQuote = false;
    let entry = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuote && line[i + 1] === '"') {
          entry += '"';
          i++; // Bỏ qua dấu nháy kép escape
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        row.push(entry);
        entry = '';
      } else {
        entry += char;
      }
    }
    row.push(entry);
    result.push(row);
  }

  return result;
}

/**
 * Phân tích danh sách sản phẩm từ nội dung CSV với cơ chế khớp cột tự động thông minh (Smart Dynamic Header Mapping)
 */
export function parseProductsFromCSVText(csvText: string): {
  success: boolean;
  products?: Product[];
  message: string;
} {
  try {
    const rows = parseCSVText(csvText);
    if (rows.length < 2) {
      return {
        success: false,
        message: 'Tệp dữ liệu CSV hoặc Google Sheet không có đủ dữ liệu (Ít nhất 1 dòng tiêu đề và 1 dòng sản phẩm).'
      };
    }

    // Phân tích header để tìm vị trí cột tự động
    const headers = rows[0].map(h => (h || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));

    const findColIndex = (keywords: string[], fallbackIdx: number): number => {
      const idx = headers.findIndex(h => keywords.some(kw => h.includes(kw)));
      return idx !== -1 ? idx : fallbackIdx;
    };

    const colName = findColIndex(['ten', 'name', 'model', 'san pham'], 0);
    const colSeries = findColIndex(['series', 'dong', 'the he'], 1);
    const colAvailability = findColIndex(['tinh trang', 'trang thai', 'availability', 'stock', 'kho'], 2);
    const colImei = findColIndex(['imei', 'serial', 'ma'], 3);
    const colPrice = findColIndex(['gia ban', 'gia thuc te', 'price', 'gia'], 4);
    const colOrigPrice = findColIndex(['gia goc', 'gia niem yet', 'original', 'cu'], 5);
    const colStorage = findColIndex(['dung luong', 'storage', 'bo nho', 'gb', 'rom'], 6);
    const colCondition = findColIndex(['hinh thuc', 'ngoai hinh', 'condition', 'may'], 7);
    const colColor = findColIndex(['mau', 'color'], 8);
    const colImage = findColIndex(['anh', 'hinh', 'image', 'drive', 'photo', 'link'], 9);
    const colDesc = findColIndex(['mo ta', 'ghi chu', 'desc', 'note'], 10);

    const parsedProducts: Product[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const rawName = row[colName]?.trim();
      if (!rawName) continue;

      // Series
      let rawSeries = row[colSeries]?.trim() || '';
      let series: SeriesCategory = '16 Series';
      if (rawSeries.includes('17')) series = '17 Series';
      else if (rawSeries.includes('16')) series = '16 Series';
      else if (rawSeries.includes('15')) series = '15 Series';
      else if (rawSeries.includes('14')) series = '14 Series';
      else if (rawSeries.includes('13')) series = '13 Series';
      else if (rawSeries.includes('12')) series = '12 Series';
      else if (rawSeries.includes('11')) series = '11 Series';
      else if (rawSeries.toLowerCase().includes('phụ') || rawSeries.toLowerCase().includes('phu')) series = 'Phụ kiện';
      else if (rawName.includes('17')) series = '17 Series';
      else if (rawName.includes('16')) series = '16 Series';
      else if (rawName.includes('15')) series = '15 Series';
      else if (rawName.includes('14')) series = '14 Series';
      else if (rawName.includes('13')) series = '13 Series';
      else if (rawName.includes('12')) series = '12 Series';
      else if (rawName.includes('11')) series = '11 Series';

      // Availability 4-tier check: in_stock_99, in_stock_clearance, order_99, order_new_seal
      const rawAvail = (row[colAvailability] || '').toLowerCase();
      let availability: 'in_stock_99' | 'in_stock_clearance' | 'order_99' | 'order_new_seal' | 'in_stock' | 'order' = 'in_stock_99';
      
      if (rawAvail.includes('clearance') || rawAvail.includes('thanh ly') || rawAvail.includes('thanh lý')) {
        availability = 'in_stock_clearance';
      } else if (rawAvail.includes('order_99') || rawAvail.includes('order 99') || rawAvail.includes('order lướt')) {
        availability = 'order_99';
      } else if (rawAvail.includes('new seal') || rawAvail.includes('seal') || rawAvail.includes('order_new_seal') || rawAvail.includes('order')) {
        availability = 'order_new_seal';
      } else {
        availability = 'in_stock_99';
      }

      const isOrder = (availability as string) === 'order_99' || (availability as string) === 'order_new_seal' || (availability as string) === 'order';

      // IMEI
      const imei = row[colImei]?.trim() || '';

      // Price parse
      const rawPrice = (row[colPrice] || '').toString().replace(/[^0-9]/g, '');
      const price = rawPrice ? parseInt(rawPrice, 10) : 10000000;

      const rawOrigPrice = (row[colOrigPrice] || '').toString().replace(/[^0-9]/g, '');
      const originalPrice = rawOrigPrice ? parseInt(rawOrigPrice, 10) : price + 2000000;

      // Storage & Color
      const rawStorage = row[colStorage]?.trim() || '128GB';
      const condition = row[colCondition]?.trim() || (isOrder ? (availability === 'order_99' ? 'Like New 99%' : 'New Seal 100%') : (availability === 'in_stock_clearance' ? 'Thanh Lý Zin' : 'Like New 99%'));
      const rawColor = row[colColor]?.trim() || 'Titan Tự Nhiên';
      
      const rawImage = row[colImage]?.trim() || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80';
      const image = convertGoogleDriveImageUrl(rawImage);
      const shortDesc = row[colDesc]?.trim() || 'Máy chuẩn zin nguyên bản 100%, bảo hành 1 đổi 1 60 ngày, tặng full quà tặng.';

      const storageOptions = isOrder
        ? rawStorage.split(/[,;/+]/).map(s => s.trim()).filter(Boolean)
        : [rawStorage];

      const colors = isOrder
        ? rawColor.split(/[,;/+]/).map(c => ({ name: c.trim(), hex: '#9E988E' })).filter(c => c.name.length > 0)
        : [{ name: rawColor, hex: '#9E988E' }];

      let tag = 'CÓ SẴN TẠI QUẦY';
      if (availability === 'in_stock_clearance') tag = 'MÁY THANH LÝ';
      else if (availability === 'order_99') tag = 'ORDER 99% LƯỚT';
      else if (availability === 'order_new_seal') tag = 'ORDER NEW SEAL';

      parsedProducts.push({
        id: 'prod-sync-' + Date.now() + '-' + i,
        name: rawName,
        series,
        availability,
        imei: isOrder ? undefined : (imei || `Mã: TN-${i}`),
        exactStorage: isOrder ? undefined : rawStorage,
        exactColor: isOrder ? undefined : { name: rawColor, hex: '#9E988E' },
        price,
        originalPrice,
        storageOptions: storageOptions.length > 0 ? storageOptions : ['128GB', '256GB'],
        condition,
        batteryHealth: isOrder ? 'Pin 100%' : 'Pin 95% - 100%',
        colors: colors.length > 0 ? colors : [{ name: 'Titan Tự Nhiên', hex: '#9E988E' }],
        image,
        tag,
        shortDesc,
        featured: i <= 4
      });
    }

    if (parsedProducts.length === 0) {
      return {
        success: false,
        message: 'Không tìm thấy dòng sản phẩm hợp lệ trong tệp CSV.'
      };
    }

    return {
      success: true,
      products: parsedProducts,
      message: `Đã nạp thành công ${parsedProducts.length} sản phẩm thực tế!`
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Lỗi phân tích CSV: ${err?.message || err}`
    };
  }
}

/**
 * Tải và phân tích dữ liệu sản phẩm từ link Google Sheet hoặc Google Apps Script Webhook
 * (Hỗ trợ cả link chia sẻ xem trực tiếp, link xuất CSV, và Apps Script JSON API)
 */
export async function fetchProductsFromGoogleSheet(sheetUrl: string): Promise<{
  success: boolean;
  products?: Product[];
  message: string;
}> {
  if (!sheetUrl || !sheetUrl.trim().startsWith('http')) {
    return {
      success: false,
      message: 'Vui lòng nhập đường dẫn Google Sheet hợp lệ (Link Google Sheet bật chia sẻ công khai hoặc URL Apps Script Webhook).'
    };
  }

  try {
    const trimmedUrl = sheetUrl.trim();

    // Trường hợp 1: URL là Google Apps Script Webhook (trả về JSON hoặc chuyển hướng)
    if (trimmedUrl.includes('script.google.com')) {
      const fetchUrl = trimmedUrl.includes('?') ? `${trimmedUrl}&action=get_products` : `${trimmedUrl}?action=get_products`;
      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error(`Không thể kết nối Apps Script (Mã HTTP: ${response.status})`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        const mappedProducts = data.map((item: any, idx: number) => ({
          ...item,
          image: convertGoogleDriveImageUrl(item.image || ''),
          gallery: Array.isArray(item.gallery) ? item.gallery.map(convertGoogleDriveImageUrl) : undefined
        }));
        return {
          success: true,
          products: mappedProducts,
          message: `Đã nạp thành công ${mappedProducts.length} sản phẩm trực tiếp từ Google Sheet!`
        };
      } else if (data.products && Array.isArray(data.products)) {
        const mappedProducts = data.products.map((item: any) => ({
          ...item,
          image: convertGoogleDriveImageUrl(item.image || ''),
          gallery: Array.isArray(item.gallery) ? item.gallery.map(convertGoogleDriveImageUrl) : undefined
        }));
        return {
          success: true,
          products: mappedProducts,
          message: `Đã nạp thành công ${mappedProducts.length} sản phẩm trực tiếp từ Google Sheet!`
        };
      }
    }

    // Trường hợp 2: Link Google Sheet thông thường -> Chuyển thành link xuất CSV
    let csvUrl = trimmedUrl;
    if (csvUrl.includes('docs.google.com/spreadsheets/d/')) {
      const match = csvUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        const sheetId = match[1];
        const gidMatch = csvUrl.match(/gid=([0-9]+)/);
        const gid = gidMatch ? gidMatch[1] : '0';
        csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
      }
    }

    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Không thể kết nối đến Google Sheet (Mã lỗi: ${response.status}). Vui lòng kiểm tra quyền chia sẻ của trang tính.`);
    }

    const csvText = await response.text();
    return parseProductsFromCSVText(csvText);

  } catch (error: any) {
    return {
      success: false,
      message: `Lỗi kết nối Google Sheet: ${error?.message || error}. Hãy đảm bảo bạn đã chọn "Chia sẻ" -> "Bất kỳ ai có đường liên kết" trên Google Sheet.`
    };
  }
}

/**
 * Tự động đồng bộ hành động thêm/sửa/xóa một sản phẩm sang Google Sheet qua Apps Script Webhook
 */
export async function syncProductActionToGoogleSheet(
  webhookUrl: string,
  product: Product,
  action: 'add' | 'update' | 'delete'
): Promise<{ success: boolean; message: string }> {
  if (!webhookUrl || !webhookUrl.trim().startsWith('http')) {
    return {
      success: false,
      message: 'Chưa cấu hình URL Google Sheet Webhook. Đã lưu nội bộ trên máy.'
    };
  }

  try {
    const payload = {
      action: action === 'add' ? 'add_product' : (action === 'update' ? 'update_product' : 'delete_product'),
      product,
      timestamp: new Date().toISOString()
    };

    await fetch(webhookUrl.trim(), {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    return {
      success: true,
      message: `Đã tự động đồng bộ ${action === 'add' ? 'thêm' : action === 'update' ? 'cập nhật' : 'xóa'} cây máy lên Google Sheet!`
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Lỗi gửi Webhook: ' + (error?.message || error)
    };
  }
}

/**
 * Tự động đồng bộ toàn bộ danh sách kho máy sang Google Sheet qua Apps Script Webhook
 */
export async function syncAllProductsToGoogleSheet(
  webhookUrl: string,
  products: Product[]
): Promise<{ success: boolean; message: string }> {
  if (!webhookUrl || !webhookUrl.trim().startsWith('http')) {
    return {
      success: false,
      message: 'Chưa cấu hình URL Google Sheet Webhook.'
    };
  }

  try {
    const payload = {
      action: 'sync_all_products',
      products,
      timestamp: new Date().toISOString()
    };

    await fetch(webhookUrl.trim(), {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    return {
      success: true,
      message: `Đã gửi toàn bộ ${products.length} sản phẩm đồng bộ lên Google Sheet!`
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Lỗi gửi Webhook: ' + (error?.message || error)
    };
  }
}

/**
 * Xuất toàn bộ danh sách sản phẩm hiện tại ra file CSV chuẩn Google Sheet / Excel (UTF-8 BOM Tiếng Việt)
 */
export function exportProductsToCSV(products: Product[]): void {
  const headers = [
    'Tên Máy',
    'Dòng Máy',
    'Tình Trạng (in_stock/order)',
    'Mã IMEI / Serial',
    'Giá Bán Thực Tế',
    'Giá Gốc Niêm Yết',
    'Dung Lượng',
    'Hình Thức Máy',
    'Màu Sắc',
    'Link Ảnh (Google Drive hoặc URL)',
    'Mô Tả Ngắn'
  ];

  const rows = products.map(p => {
    const isOrder = p.availability === 'order';
    const storageStr = isOrder ? (p.storageOptions?.join(', ') || '128GB') : (p.exactStorage || p.storageOptions?.[0] || '128GB');
    const colorStr = isOrder ? (p.colors?.map(c => c.name).join(', ') || 'Titan Tự Nhiên') : (p.exactColor?.name || p.colors?.[0]?.name || 'Titan Tự Nhiên');
    
    return [
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${p.series}"`,
      `"${p.availability}"`,
      `"${(p.imei || '').replace(/"/g, '""')}"`,
      `"${p.price}"`,
      `"${p.originalPrice || p.price}"`,
      `"${storageStr}"`,
      `"${(p.condition || 'Like New 99%').replace(/"/g, '""')}"`,
      `"${colorStr}"`,
      `"${(p.image || '').replace(/"/g, '""')}"`,
      `"${(p.shortDesc || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  a.download = `TaoNew_KhoSanPham_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Gửi dữ liệu khách hàng về Google Sheet qua Webhook
 */
export async function sendLeadToGoogleSheet(
  webhookUrl: string,
  lead: LeadOrder
): Promise<{ success: boolean; message: string }> {
  if (!webhookUrl || !webhookUrl.trim().startsWith('http')) {
    return {
      success: false,
      message: 'Chưa cấu hình URL Google Sheet Webhook. Dữ liệu đã được lưu trữ nội bộ trên trang quản trị.'
    };
  }

  try {
    await fetch(webhookUrl.trim(), {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(lead)
    });

    return {
      success: true,
      message: 'Đã đồng bộ đơn hàng sang Google Sheet thành công!'
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Lỗi gửi Webhook: ' + (error?.message || error)
    };
  }
}

/**
 * Xuất danh sách khách hàng ra file Excel/CSV chuẩn Tiếng Việt (UTF-8 BOM)
 */
export function exportLeadsToCSV(leads: LeadOrder[]): void {
  const headers = [
    'Mã Đơn',
    'Thời Gian Đăng Ký',
    'Họ và Tên Khách Hàng',
    'Số Điện Thoại',
    'Sản Phẩm Quan Tâm',
    'Mã IMEI / Máy',
    'Dung Lượng',
    'Màu Sắc',
    'Phân Loại',
    'Ghi Chú',
    'Trạng Thái',
    'Đã Đồng Bộ Sheet'
  ];

  const rows = leads.map(l => {
    const time = new Date(l.createdAt).toLocaleString('vi-VN');
    const orderType = l.orderType === 'in_stock' ? 'Hàng Có Sẵn' : (l.orderType === 'order' ? 'Hàng Order' : 'Tư Vấn Báo Giá');
    const statusText = l.status === 'contacted' ? 'Đã Tư Vấn' : (l.status === 'closed' ? 'Đã Chốt Máy' : (l.status === 'cancelled' ? 'Hủy' : 'Mới'));
    
    return [
      `"${l.id}"`,
      `"${time}"`,
      `"${(l.customerName || '').replace(/"/g, '""')}"`,
      `"'\t${l.phoneNumber}"`, // Tránh mất số 0 đầu dòng trên Excel
      `"${(l.interestedProduct || '').replace(/"/g, '""')}"`,
      `"${(l.imei || '').replace(/"/g, '""')}"`,
      `"${l.storageSelected || ''}"`,
      `"${l.colorSelected || ''}"`,
      `"${orderType}"`,
      `"${(l.note || '').replace(/"/g, '""')}"`,
      `"${statusText}"`,
      `"${l.syncedToSheet ? 'Có' : 'Chưa'}"`
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TaoNew_KhachHang_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Tải file mẫu Google Sheet định dạng chuẩn để quản lý máy
 */
export function downloadSampleProductSheetCSV(): void {
  const headers = [
    'Tên Máy',
    'Dòng Máy',
    'Tình Trạng (in_stock / order)',
    'Mã IMEI / Số Serial',
    'Giá Bán Thực Tế (VNĐ)',
    'Giá Gốc (VNĐ)',
    'Dung Lượng (VD: 256GB hoặc 128GB, 256GB nếu là order)',
    'Hình Thức Máy',
    'Màu Sắc',
    'Link Ảnh (Google Drive hoặc URL)',
    'Mô Tả Ngắn'
  ];

  const sampleRows = [
    [
      '"iPhone 16 Pro Max 256GB"',
      '"16 Series"',
      '"in_stock"',
      '"IMEI: ...8923"',
      '"30490000"',
      '"34990000"',
      '"256GB"',
      '"Like New 99%"',
      '"Titan Sa Mạc"',
      '"https://drive.google.com/file/d/1A2B3C/view"',
      '"Cây máy chuẩn zin nguyên bản 100%, pin 100%, bảo hành 1 đổi 1 60 ngày."'
    ],
    [
      '"iPhone 15 Pro Max 256GB"',
      '"15 Series"',
      '"in_stock"',
      '"IMEI: ...5502"',
      '"24590000"',
      '"28990000"',
      '"256GB"',
      '"Like New 99%"',
      '"Titan Tự Nhiên"',
      '"https://drive.google.com/file/d/1D4E5F/view"',
      '"Titan Tự Nhiên, pin 98% zin all chuẩn 3uTools."'
    ],
    [
      '"iPhone 17 Pro Max"',
      '"17 Series"',
      '"order"',
      '""',
      '"36990000"',
      '"39990000"',
      '"256GB, 512GB, 1TB"',
      '"New Seal 100%"',
      '"Titanium Blue Khói, Titanium Tự Nhiên, Titanium Đen"',
      '"https://drive.google.com/file/d/1G7H8I/view"',
      '"Hàng New Seal, nhận máy sau 15-30 phút, tùy chọn dung lượng và màu."'
    ]
  ];

  const csvContent = '\uFEFF' + [headers.join(','), ...sampleRows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TaoNew_MauGoogleSheet_SanPham.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Tải trực tiếp một ảnh (dạng Base64 hoặc File) lên Google Drive thông qua Apps Script Webhook
 */
export async function uploadImageToGoogleDriveViaWebhook(
  webhookUrl: string,
  base64Data: string,
  fileName?: string
): Promise<{ success: boolean; directUrl?: string; driveUrl?: string; message: string }> {
  if (!webhookUrl || !webhookUrl.trim().startsWith('http')) {
    return {
      success: false,
      message: 'Chưa cấu hình URL Google Apps Script Webhook.'
    };
  }

  try {
    const payload = {
      action: 'upload_image_to_drive',
      imageBase64: base64Data,
      fileName: fileName || `may_${Date.now()}.jpg`,
      timestamp: new Date().toISOString()
    };

    const response = await fetch(webhookUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8' // Dùng text/plain để tránh CORS preflight nếu là Apps Script
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      // Thử chế độ no-cors hoặc fallback
      return {
        success: false,
        message: `Máy chủ Google Apps Script trả về lỗi HTTP ${response.status}`
      };
    }

    const data = await response.json();
    if (data.status === 'success' && data.imageUrl) {
      return {
        success: true,
        directUrl: data.imageUrl,
        driveUrl: data.driveUrl,
        message: 'Đã tải ảnh lên Google Drive thành công!'
      };
    } else {
      return {
        success: false,
        message: data.message || 'Không thể tạo tệp trên Google Drive.'
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: 'Lỗi tải ảnh lên Google Drive: ' + (error?.message || error)
    };
  }
}

export const SAMPLE_GOOGLE_APPS_SCRIPT_CODE = `// =========================================================================
// TÁO NEW STORE - GOOGLE APPS SCRIPT ĐỒNG BỘ 2 CHIỀU & LƯU ẢNH DRIVE (V4.1)
// Quản lý: Thư mục ảnh Drive (TAO_NEW_HINH_ANH_MAY), Kho Máy (4 Phân Loại) & Đơn Khách
// =========================================================================

var GOOGLE_DRIVE_FOLDER_NAME = "TAO_NEW_HINH_ANH_MAY"; // Thư mục lưu ảnh máy trên Drive
var SHEET_PRODUCTS = "Kho_San_Pham";                  // Tab lưu kho sản phẩm
var SHEET_LEADS = "Don_Hang_Web";                     // Tab lưu đơn đặt hàng

// Tự động tìm hoặc tạo thư mục trên Google Drive
function getOrCreateDriveFolder() {
  var folders = DriveApp.getFoldersByName(GOOGLE_DRIVE_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  var newFolder = DriveApp.createFolder(GOOGLE_DRIVE_FOLDER_NAME);
  newFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return newFolder;
}

// Khởi tạo tab Kho Sản Phẩm nếu chưa có
function getOrCreateProductsSheet(ss) {
  var sheet = ss.getSheetByName(SHEET_PRODUCTS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_PRODUCTS);
    sheet.appendRow([
      "Mã ID",
      "Tên Máy",
      "Dòng Máy",
      "Phân Loại (in_stock_99 / in_stock_clearance / order_99 / order_new_seal)",
      "Mã IMEI / Serial",
      "Giá Bán Thực Tế (VNĐ)",
      "Giá Gốc (VNĐ)",
      "Dung Lượng",
      "Hình Thức Máy",
      "Màu Sắc",
      "Link Ảnh (Google Drive / Web)",
      "Mô Tả Chi Tiết"
    ]);
    var header = sheet.getRange(1, 1, 1, 12);
    header.setBackground("#0F172A");
    header.setFontColor("#FFFFFF");
    header.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Khởi tạo tab Đơn Hàng nếu chưa có
function getOrCreateLeadsSheet(ss) {
  var sheet = ss.getSheetByName(SHEET_LEADS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_LEADS);
    sheet.appendRow([
      "Thời Gian Đăng Ký",
      "Họ và Tên Khách Hàng",
      "Số Điện Thoại",
      "Dòng Máy Quan Tâm",
      "Mã IMEI / Cây Máy",
      "Dung Lượng Chọn",
      "Màu Sắc",
      "Loại Đơn Hàng",
      "Ghi Chú Yêu Cầu",
      "Trạng Thái Xử Lý"
    ]);
    var header = sheet.getRange(1, 1, 1, 10);
    header.setBackground("#0F172A");
    header.setFontColor("#FFFFFF");
    header.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Xử lý gửi dữ liệu từ Web lên Google Drive & Google Sheet (POST)
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var contents = e.postData.contents;
    var payload = JSON.parse(contents);
    var action = payload.action || "lead";

    // 1. TẢI ẢNH LÊN THƯ MỤC GOOGLE DRIVE
    if (action === "upload_image_to_drive") {
      var folder = getOrCreateDriveFolder();
      var rawBase64 = payload.imageBase64 || "";
      var base64Data = rawBase64.indexOf(",") !== -1 ? rawBase64.split(",")[1] : rawBase64;
      var decodedBlob = Utilities.newBlob(
        Utilities.base64Decode(base64Data),
        payload.mimeType || "image/jpeg",
        payload.fileName || ("may_" + Date.now() + ".jpg")
      );
      
      var file = folder.createFile(decodedBlob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      var fileId = file.getId();
      var directImageUrl = "https://lh3.googleusercontent.com/d/" + fileId;

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        fileId: fileId,
        driveUrl: file.getUrl(),
        imageUrl: directImageUrl
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. ĐỒNG BỘ TOÀN BỘ KHO MÁY (SYNC ALL)
    if (action === "sync_all_products") {
      var prodSheet = getOrCreateProductsSheet(ss);
      var lastRow = prodSheet.getLastRow();
      if (lastRow > 1) {
        prodSheet.deleteRows(2, lastRow - 1);
      }
      var products = payload.products || [];
      for (var i = 0; i < products.length; i++) {
        var p = products[i];
        var avail = p.availability || "in_stock_99";
        var isOrder = (avail === "order" || avail === "order_99" || avail === "order_new_seal");
        var storage = isOrder ? (p.storageOptions ? p.storageOptions.join(", ") : "128GB") : (p.exactStorage || "128GB");
        var color = isOrder ? (p.colors ? p.colors.map(function(c){return c.name;}).join(", ") : "Titan") : (p.exactColor ? p.exactColor.name : "Titan");
        prodSheet.appendRow([
          p.id || ("prod-" + (i+1)),
          p.name || "",
          p.series || "16 Series",
          avail,
          p.imei || "",
          p.price || 0,
          p.originalPrice || p.price || 0,
          storage,
          p.condition || "Like New 99%",
          color,
          p.image || "",
          p.shortDesc || ""
        ]);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Đã đồng bộ toàn bộ " + products.length + " máy vào Google Sheet!" })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. THÊM CÂY MÁY MỚI (ADD PRODUCT)
    if (action === "add_product") {
      var prodSheet = getOrCreateProductsSheet(ss);
      var p = payload.product;
      var avail = p.availability || "in_stock_99";
      var isOrder = (avail === "order" || avail === "order_99" || avail === "order_new_seal");
      var storage = isOrder ? (p.storageOptions ? p.storageOptions.join(", ") : "128GB") : (p.exactStorage || "128GB");
      var color = isOrder ? (p.colors ? p.colors.map(function(c){return c.name;}).join(", ") : "Titan") : (p.exactColor ? p.exactColor.name : "Titan");
      prodSheet.appendRow([
        p.id || ("prod-" + Date.now()),
        p.name || "",
        p.series || "16 Series",
        avail,
        p.imei || "",
        p.price || 0,
        p.originalPrice || p.price || 0,
        storage,
        p.condition || "Like New 99%",
        color,
        p.image || "",
        p.shortDesc || ""
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Đã thêm cây máy vào Google Sheet!" })).setMimeType(ContentService.MimeType.JSON);
    }

    // 4. CẬP NHẬT CÂY MÁY (UPDATE PRODUCT)
    if (action === "update_product") {
      var prodSheet = getOrCreateProductsSheet(ss);
      var p = payload.product;
      var data = prodSheet.getDataRange().getValues();
      var foundRow = -1;
      for (var r = 1; r < data.length; r++) {
        if (data[r][0] == p.id || (p.imei && data[r][4] == p.imei)) {
          foundRow = r + 1;
          break;
        }
      }
      var avail = p.availability || "in_stock_99";
      var isOrder = (avail === "order" || avail === "order_99" || avail === "order_new_seal");
      var storage = isOrder ? (p.storageOptions ? p.storageOptions.join(", ") : "128GB") : (p.exactStorage || "128GB");
      var color = isOrder ? (p.colors ? p.colors.map(function(c){return c.name;}).join(", ") : "Titan") : (p.exactColor ? p.exactColor.name : "Titan");
      var newRow = [
        p.id || "",
        p.name || "",
        p.series || "16 Series",
        avail,
        p.imei || "",
        p.price || 0,
        p.originalPrice || p.price || 0,
        storage,
        p.condition || "Like New 99%",
        color,
        p.image || "",
        p.shortDesc || ""
      ];
      if (foundRow > 0) {
        prodSheet.getRange(foundRow, 1, 1, 12).setValues([newRow]);
      } else {
        prodSheet.appendRow(newRow);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Đã cập nhật máy trên Google Sheet!" })).setMimeType(ContentService.MimeType.JSON);
    }

    // 5. XÓA CÂY MÁY (DELETE PRODUCT)
    if (action === "delete_product") {
      var prodSheet = getOrCreateProductsSheet(ss);
      var p = payload.product;
      var data = prodSheet.getDataRange().getValues();
      for (var r = 1; r < data.length; r++) {
        if (data[r][0] == p.id || (p.imei && data[r][4] == p.imei) || data[r][1] == p.name) {
          prodSheet.deleteRow(r + 1);
          break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Đã xóa máy khỏi Google Sheet!" })).setMimeType(ContentService.MimeType.JSON);
    }

    // 6. ĐƠN ĐẶT MÁY / TƯ VẤN TỪ KHÁCH HÀNG (LEAD)
    var leadsSheet = getOrCreateLeadsSheet(ss);
    var timeFormatted = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
    var orderTypeDesc = payload.orderType === "in_stock" || payload.orderType === "in_stock_99" || payload.orderType === "in_stock_clearance"
      ? "Giữ Máy Sẵn Quầy" 
      : (payload.orderType === "order_99" ? "Order 99% Lướt" : (payload.orderType === "order_new_seal" || payload.orderType === "order" ? "Order New Seal" : "Tư Vấn"));
    
    leadsSheet.appendRow([
      timeFormatted,
      payload.customerName || "Khách Hàng",
      "'" + (payload.phoneNumber || ""),
      payload.interestedProduct || "iPhone",
      payload.imei || "Theo máy",
      payload.storageSelected || "128GB",
      payload.colorSelected || "Mặc định",
      orderTypeDesc,
      payload.note || "Đăng ký từ Web Táo New",
      "Chờ Liên Hệ"
    ]);

    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Đã lưu đơn hàng vào Sheet thành công!" })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Xử lý lấy danh sách máy từ Sheet về Web (GET)
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var prodSheet = ss.getSheetByName(SHEET_PRODUCTS);
    if (!prodSheet) {
      return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    }
    var rows = prodSheet.getDataRange().getValues();
    if (rows.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    }
    var products = [];
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      if (!row[1]) continue;
      var rawAvail = (row[3] || "in_stock_99").toString().toLowerCase();
      var availability = "in_stock_99";
      if (rawAvail.indexOf("clearance") !== -1 || rawAvail.indexOf("thanh ly") !== -1 || rawAvail.indexOf("thanh lý") !== -1) {
        availability = "in_stock_clearance";
      } else if (rawAvail.indexOf("order_99") !== -1 || rawAvail.indexOf("order 99") !== -1 || rawAvail.indexOf("order lướt") !== -1) {
        availability = "order_99";
      } else if (rawAvail.indexOf("seal") !== -1 || rawAvail.indexOf("order_new_seal") !== -1 || rawAvail.indexOf("order") !== -1) {
        availability = "order_new_seal";
      } else {
        availability = "in_stock_99";
      }

      var isOrder = (availability === "order_99" || availability === "order_new_seal");
      var rawStorage = (row[7] || "128GB").toString();
      var rawColor = (row[9] || "Titan Tự Nhiên").toString();
      var tag = "CÓ SẴN TẠI QUẦY";
      if (availability === "in_stock_clearance") tag = "MÁY THANH LÝ";
      else if (availability === "order_99") tag = "ORDER 99% LƯỚT";
      else if (availability === "order_new_seal") tag = "ORDER NEW SEAL";

      products.push({
        id: (row[0] || ("prod-" + i)).toString(),
        name: row[1].toString(),
        series: row[2].toString() || "16 Series",
        availability: availability,
        imei: isOrder ? undefined : (row[4] ? row[4].toString() : ""),
        exactStorage: isOrder ? undefined : rawStorage,
        exactColor: isOrder ? undefined : { name: rawColor, hex: "#9E988E" },
        price: parseInt((row[5] || "0").toString().replace(/[^0-9]/g, ""), 10) || 0,
        originalPrice: parseInt((row[6] || "0").toString().replace(/[^0-9]/g, ""), 10) || 0,
        storageOptions: isOrder ? rawStorage.split(/[,;/+]/).map(function(s){return s.trim();}) : [rawStorage],
        condition: row[8] ? row[8].toString() : (isOrder ? (availability === "order_99" ? "Like New 99%" : "New Seal 100%") : "Like New 99%"),
        batteryHealth: isOrder ? "Pin 100%" : "Pin 95% - 100%",
        colors: [{ name: rawColor, hex: "#9E988E" }],
        image: row[10] ? row[10].toString() : "",
        tag: tag,
        shortDesc: row[11] ? row[11].toString() : ""
      });
    }
    return ContentService.createTextOutput(JSON.stringify(products)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`;
