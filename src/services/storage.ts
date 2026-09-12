import { Product, LeadOrder, StoreSettings } from '../types';
import { DEFAULT_STORE_SETTINGS, INITIAL_PRODUCTS } from '../data/initialData';

const PRODUCTS_KEY = 'taonew_products_v1';
const LEADS_KEY = 'taonew_leads_v1';
const SETTINGS_KEY = 'taonew_settings_v1';

export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (raw === null) {
      // Chỉ khi lần đầu tiên truy cập chưa từng có key trong localStorage
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_PRODUCTS;
  } catch (e) {
    console.error('Failed to load products from storage:', e);
    return INITIAL_PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save products to storage:', e);
  }
}

export function getStoredLeads(): LeadOrder[] {
  try {
    const raw = localStorage.getItem(LEADS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load leads from storage:', e);
    return [];
  }
}

export function saveStoredLeads(leads: LeadOrder[]): void {
  try {
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  } catch (e) {
    console.error('Failed to save leads to storage:', e);
  }
}

export function addLead(lead: Omit<LeadOrder, 'id' | 'createdAt' | 'status'>): LeadOrder {
  const newLead: LeadOrder = {
    ...lead,
    id: 'lead-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    createdAt: new Date().toISOString(),
    status: 'new',
    syncedToSheet: false
  };

  const currentLeads = getStoredLeads();
  const updatedLeads = [newLead, ...currentLeads];
  saveStoredLeads(updatedLeads);
  return newLead;
}

export function getStoredSettings(): StoreSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_STORE_SETTINGS));
      return DEFAULT_STORE_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STORE_SETTINGS,
      ...parsed,
      googleSheetWebhookUrl: parsed.googleSheetWebhookUrl || DEFAULT_STORE_SETTINGS.googleSheetWebhookUrl,
      googleSheetProductUrl: parsed.googleSheetProductUrl || DEFAULT_STORE_SETTINGS.googleSheetProductUrl
    };
  } catch (e) {
    console.error('Failed to load settings from storage:', e);
    return DEFAULT_STORE_SETTINGS;
  }
}

export function saveStoredSettings(settings: StoreSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to storage:', e);
  }
}

export function resetToDefaults(): { products: Product[]; settings: StoreSettings } {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_STORE_SETTINGS));
  return {
    products: INITIAL_PRODUCTS,
    settings: DEFAULT_STORE_SETTINGS
  };
}

// ================= HỆ THỐNG MÁY CHỦ TRUNG TÂM (ĐỒNG BỘ PC & MOBILE 100%) =================

/**
 * Tải dữ liệu chuẩn từ máy chủ (để PC & Mobile luôn đồng bộ cùng nhau)
 */
export async function fetchServerData(): Promise<{
  success: boolean;
  products?: Product[];
  settings?: StoreSettings;
  leads?: LeadOrder[];
  message?: string;
}> {
  try {
    const res = await fetch('/api/data', { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const json = await res.json();
    if (json.success) {
      if (Array.isArray(json.products) && json.products.length > 0) {
        // Lọc bỏ sản phẩm ma nếu có
        const clean = json.products.filter(
          (p: Product) => (Number(p.price) || 0) > 0 && !(p.name && p.name.trim().toLowerCase() === 'iphone' && Number(p.price) < 1000000)
        );
        saveStoredProducts(clean);
        json.products = clean;
      }
      if (json.settings) {
        saveStoredSettings(json.settings);
      }
      if (Array.isArray(json.leads)) {
        saveStoredLeads(json.leads);
      }
      return {
        success: true,
        products: json.products,
        settings: json.settings,
        leads: json.leads
      };
    }
    return { success: false, message: 'Máy chủ phản hồi không thành công' };
  } catch (err: any) {
    console.warn('Không thể kết nối máy chủ /api/data, sử dụng dữ liệu cục bộ:', err?.message || err);
    return { success: false, message: err?.message };
  }
}

/**
 * Lưu danh sách sản phẩm lên máy chủ trung tâm
 */
export async function saveProductsToServer(products: Product[]): Promise<{ success: boolean; message: string }> {
  // Luôn lưu cục bộ trước để giao diện mượt mà tức thì
  saveStoredProducts(products);

  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return { success: true, message: json.message || 'Đã lưu lên máy chủ!' };
  } catch (err: any) {
    console.warn('Lưu máy chủ thất bại, dữ liệu đã lưu an toàn trên máy cục bộ:', err);
    return { success: false, message: 'Đã lưu trên máy này (Chưa thể đồng bộ lên máy chủ)' };
  }
}

/**
 * Lưu cài đặt cửa hàng lên máy chủ trung tâm
 */
export async function saveSettingsToServer(settings: StoreSettings): Promise<{ success: boolean; message: string }> {
  saveStoredSettings(settings);

  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return { success: true, message: json.message || 'Đã lưu cài đặt lên máy chủ!' };
  } catch (err: any) {
    console.warn('Lưu cài đặt lên máy chủ lỗi:', err);
    return { success: false, message: 'Đã lưu trên máy này' };
  }
}

/**
 * Lưu đơn hàng / yêu cầu tư vấn lên máy chủ
 */
export async function addLeadToServer(lead: Omit<LeadOrder, 'id' | 'createdAt' | 'status'>): Promise<LeadOrder> {
  const localLead = addLead(lead);

  try {
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead: localLead })
    });
  } catch (err) {
    console.warn('Không thể gửi đơn lên máy chủ:', err);
  }

  return localLead;
}

/**
 * Tải ảnh trực tiếp lên thư mục lưu trữ tĩnh của máy chủ
 * Trả về đường dẫn vĩnh viễn (ví dụ: /uploads/taonew_171000.jpg)
 * Cả điện thoại và máy tính đều xem được ngay lập tức, không bao giờ bị mất link
 */
export async function uploadImageToServer(
  base64OrDataUrl: string, 
  fileName?: string
): Promise<{ success: boolean; imageUrl: string; message: string }> {
  try {
    const res = await fetch('/api/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64: base64OrDataUrl,
        fileName: fileName || 'photo'
      })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && json.imageUrl) {
      return {
        success: true,
        imageUrl: json.imageUrl,
        message: 'Đã tải ảnh lên máy chủ thành công!'
      };
    }
    // Fallback: nếu máy chủ lỗi thì dùng lại data URL
    return {
      success: true,
      imageUrl: base64OrDataUrl,
      message: 'Đã lưu ảnh cục bộ!'
    };
  } catch (err: any) {
    console.warn('Tải ảnh lên máy chủ lỗi, giữ nguyên URL gốc:', err);
    return {
      success: true,
      imageUrl: base64OrDataUrl,
      message: 'Đã lưu ảnh cục bộ!'
    };
  }
}

/**
 * Khôi phục dữ liệu gốc trên máy chủ
 */
export async function resetServerDefaults(): Promise<{ success: boolean; products: Product[]; settings: StoreSettings }> {
  const local = resetToDefaults();
  try {
    const res = await fetch('/api/reset', { method: 'POST' });
    if (res.ok) {
      const json = await res.json();
      return {
        success: true,
        products: json.products || local.products,
        settings: json.settings || local.settings
      };
    }
  } catch (err) {
    console.warn('Lỗi reset máy chủ:', err);
  }
  return {
    success: true,
    products: local.products,
    settings: local.settings
  };
}

/**
 * Xuất toàn bộ cơ sở dữ liệu website (Sản phẩm, Cài đặt, Showroom, Khách hàng) ra file JSON an toàn
 */
export function exportFullDatabaseBackup(products: Product[], settings: StoreSettings, leads: LeadOrder[]): void {
  const backupData = {
    app: 'TaoNew_Store_Database',
    version: '1.2.0',
    exportedAt: new Date().toISOString(),
    storeName: settings.name,
    data: {
      products,
      settings,
      leads
    }
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  a.download = `TaoNew_Backup_Data_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Nhập và khôi phục toàn bộ cơ sở dữ liệu từ file JSON sao lưu
 */
export function importFullDatabaseBackup(jsonString: string): {
  success: boolean;
  message: string;
  data?: {
    products: Product[];
    settings: StoreSettings;
    leads: LeadOrder[];
  };
} {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed) {
      return { success: false, message: 'File sao lưu không chứa dữ liệu JSON hợp lệ.' };
    }

    // Support both direct data and wrapped data
    const rawData = parsed.data || parsed;
    const restoredProducts: Product[] = Array.isArray(rawData.products) ? rawData.products : [];
    const restoredSettings: StoreSettings = rawData.settings ? { ...DEFAULT_STORE_SETTINGS, ...rawData.settings } : DEFAULT_STORE_SETTINGS;
    const restoredLeads: LeadOrder[] = Array.isArray(rawData.leads) ? rawData.leads : [];

    if (restoredProducts.length === 0 && !rawData.settings) {
      return {
        success: false,
        message: 'File sao lưu không đúng định dạng của Táo New (Thiếu danh sách sản phẩm hoặc cài đặt).'
      };
    }

    // Save to local storage
    if (restoredProducts.length > 0) {
      saveStoredProducts(restoredProducts);
    }
    saveStoredSettings(restoredSettings);
    if (restoredLeads.length > 0) {
      saveStoredLeads(restoredLeads);
    }

    return {
      success: true,
      message: `Khôi phục thành công ${restoredProducts.length} sản phẩm, cài đặt cửa hàng và ${restoredLeads.length} đơn hàng!`,
      data: {
        products: restoredProducts,
        settings: restoredSettings,
        leads: restoredLeads
      }
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Lỗi đọc file sao lưu: ${err?.message || 'File JSON bị lỗi cấu trúc'}`
    };
  }
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Ẩn bảo mật số IMEI / Serial máy (chỉ hiện 4 ký tự cuối, phần trước thay bằng xxx)
 * Ví dụ: "358921098491823" -> "xxxx-xxxx-xxxx-1823" hoặc "xxx...1823"
 * Nếu là admin thì hiển thị đầy đủ
 */
export function maskIMEI(imei?: string, isAdmin: boolean = false): string {
  if (!imei) return '';
  if (isAdmin) return imei;

  const trimmed = imei.trim();
  if (trimmed.length <= 4) {
    return 'xxx...' + trimmed;
  }

  // Tách tiền tố nếu có (ví dụ "IMEI: ", "Mã: ", "Serial: ")
  const prefixMatch = trimmed.match(/^(IMEI:\s*|Mã:\s*|Serial:\s*)/i);
  const prefix = prefixMatch ? prefixMatch[0] : 'IMEI: ';
  const rawNumber = prefixMatch ? trimmed.slice(prefixMatch[0].length).trim() : trimmed;

  // Lấy 4 ký tự cuối
  const cleanDigits = rawNumber.replace(/[^a-zA-Z0-9]/g, '');
  if (cleanDigits.length <= 4) {
    return `${prefix}xxx...${cleanDigits}`;
  }

  const last4 = cleanDigits.slice(-4);
  return `${prefix}xxx-xxxx-${last4}`;
}

/**
 * Lấy chuỗi định danh đuôi an toàn cho nút bấm và thông báo:
 * Ví dụ: "358921098491823" -> "Đuôi ...1823"
 */
export function getMaskedIMEIEndOnly(imei?: string, isAdmin: boolean = false): string {
  if (!imei) return '';
  if (isAdmin) return imei;
  const cleanDigits = imei.replace(/[^a-zA-Z0-9]/g, '');
  if (cleanDigits.length <= 4) return cleanDigits;
  return `Đuôi ...${cleanDigits.slice(-4)}`;
}


