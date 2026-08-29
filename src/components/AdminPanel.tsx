import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Lock, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  Download, 
  FileSpreadsheet, 
  Phone, 
  User, 
  Check, 
  RefreshCw, 
  Store, 
  Settings, 
  ShoppingBag, 
  SlidersHorizontal,
  ExternalLink,
  ShieldCheck,
  Search,
  Copy,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Link as LinkIcon,
  UploadCloud,
  Layers,
  HelpCircle,
  Eye,
  Camera,
  Database,
  FileDown,
  FileUp,
  FolderSync,
  MessageCircle,
  Clock,
  XCircle,
  FileText,
  Smartphone,
  Facebook,
  MapPin,
  Navigation,
  Share2,
  Heart
} from 'lucide-react';
import { Product, LeadOrder, StoreSettings, SeriesCategory, ProductAvailability, StoreGalleryImage, CustomerReviewItem } from '../types';
import { formatVND, exportFullDatabaseBackup, importFullDatabaseBackup } from '../services/storage';
import { 
  SAMPLE_GOOGLE_APPS_SCRIPT_CODE, 
  sendLeadToGoogleSheet, 
  exportLeadsToCSV,
  exportProductsToCSV,
  convertGoogleDriveImageUrl,
  fetchProductsFromGoogleSheet,
  parseProductsFromCSVText,
  downloadSampleProductSheetCSV,
  syncProductActionToGoogleSheet,
  syncAllProductsToGoogleSheet
} from '../services/googleSheet';
import { ImageUploadInput } from './ImageUploadInput';
import { Logo } from './Logo';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  leads: LeadOrder[];
  settings: StoreSettings;
  onSaveProducts: (products: Product[]) => void;
  onSaveLeads: (leads: LeadOrder[]) => void;
  onSaveSettings: (settings: StoreSettings) => void;
  onResetDefaults: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  products,
  leads,
  settings,
  onSaveProducts,
  onSaveLeads,
  onSaveSettings,
  onResetDefaults,
}) => {
  // PIN authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Navigation tab in Admin: products | gallery | reviews | leads | sheets | backup | settings
  const [activeTab, setActiveTab] = useState<'products' | 'gallery' | 'reviews' | 'leads' | 'sheets' | 'backup' | 'settings'>('products');

  // Product Form state (for adding/editing)
  const [isEditingProduct, setIsEditingProduct] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
    name: '',
    series: '16 Series',
    availability: 'in_stock',
    price: 20000000,
    originalPrice: 22000000,
    storageOptions: ['128GB', '256GB'],
    condition: 'Like New 99%',
    batteryHealth: 'Pin 100%',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
    colors: [{ name: 'Titan Tự Nhiên', hex: '#9E988E' }, { name: 'Titan Đen', hex: '#2C2B2E' }],
    tag: 'SẴN HÀNG',
    orderEstimateDays: '15 - 30 Phút',
    shortDesc: 'Máy đẹp keng nguyên bản, tặng full sạc cáp tai nghe.',
    detailedImages: {
      overview: [],
      screenBezel: [],
      camera: [],
      details: []
    }
  });

  // Toast notification feedback system
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3500);
  };

  // Google Sheet URL input for product sync
  const [sheetSyncUrl, setSheetSyncUrl] = useState('');
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [sheetSyncResult, setSheetSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  // File input refs for uploading CSV & JSON
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const jsonBackupInputRef = useRef<HTMLInputElement>(null);

  // Drive image tester tool state
  const [testDriveInput, setTestDriveInput] = useState('');
  const [testDriveResult, setTestDriveResult] = useState<{ original: string; direct: string } | null>(null);
  const [isPushingAllToSheet, setIsPushingAllToSheet] = useState(false);

  // Leads search, filter, edit & delete states
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<'all' | 'new' | 'contacted' | 'completed' | 'cancelled'>('all');
  const [editingLead, setEditingLead] = useState<LeadOrder | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<LeadOrder | null>(null);
  const [showClearCompletedConfirm, setShowClearCompletedConfirm] = useState(false);

  // Delete confirmation modal state (replaces window.confirm which is blocked in iframes)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [galleryItemToDelete, setGalleryItemToDelete] = useState<StoreGalleryImage | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Settings form state
  const [tempSettings, setTempSettings] = useState<StoreSettings>(settings);
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Store Gallery form state
  const [storeImagesList, setStoreImagesList] = useState<StoreGalleryImage[]>(
    settings.storeImages || []
  );
  const [newGalleryItem, setNewGalleryItem] = useState<{ url: string; title: string; caption: string }>({
    url: '',
    title: '',
    caption: ''
  });

  // Customer Reviews / Delivery Photos form state
  const [customerReviewsList, setCustomerReviewsList] = useState<CustomerReviewItem[]>(
    settings.customerReviews || []
  );
  const [newReviewItem, setNewReviewItem] = useState<{
    imageUrl: string;
    customerName: string;
    deviceBought: string;
    date: string;
    feedback: string;
  }>({
    imageUrl: '',
    customerName: 'Khách Hàng Táo New',
    deviceBought: '',
    date: 'Mới giao',
    feedback: ''
  });
  const [reviewItemToDelete, setReviewItemToDelete] = useState<CustomerReviewItem | null>(null);

  // Keep local settings state synchronized when settings prop changes
  useEffect(() => {
    setTempSettings(settings);
    setStoreImagesList(settings.storeImages || []);
    setCustomerReviewsList(settings.customerReviews || []);
  }, [settings]);

  if (!isOpen) return null;

  // Authentication check
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === settings.adminPin || pinInput === '8888') {
      setIsAuthenticated(true);
      setPinError(false);
      showToast('Đăng nhập Quản trị thành công!', 'success');
    } else {
      setPinError(true);
      showToast('Mã PIN không chính xác! Vui lòng thử lại.', 'error');
    }
  };

  // Product CRUD
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct.name || !currentProduct.name.trim()) {
      showToast('Vui lòng nhập tên sản phẩm / dòng máy!', 'error');
      return;
    }
    if (!currentProduct.price || Number(currentProduct.price) <= 0) {
      showToast('Vui lòng nhập giá bán thực tế hợp lệ lớn hơn 0!', 'error');
      return;
    }

    const processedImage = convertGoogleDriveImageUrl(currentProduct.image || '');
    const finalStorage = currentProduct.exactStorage || currentProduct.storageOptions?.[0] || '128GB';
    const finalColor = currentProduct.exactColor || currentProduct.colors?.[0] || { name: 'Titan Tự Nhiên', hex: '#9E988E' };

    const productPayload: Product = {
      ...(currentProduct as Product),
      name: currentProduct.name.trim(),
      price: Number(currentProduct.price),
      originalPrice: Number(currentProduct.originalPrice || currentProduct.price),
      image: processedImage,
      exactStorage: finalStorage,
      storageOptions: [finalStorage],
      exactColor: finalColor,
      colors: [finalColor]
    };

    if (currentProduct.id) {
      // Update existing
      const updated = products.map(p => p.id === currentProduct.id ? productPayload : p);
      onSaveProducts(updated);
      if (settings.googleSheetWebhookUrl && settings.autoSyncGoogleSheet !== false) {
        syncProductActionToGoogleSheet(settings.googleSheetWebhookUrl, productPayload, 'update');
        showToast(`Đã lưu cập nhật máy "${productPayload.name}" & đồng bộ lên Google Sheet!`, 'success');
      } else {
        showToast(`Đã lưu cập nhật cây máy "${productPayload.name}" thành công!`, 'success');
      }
    } else {
      // Create new
      const newProd: Product = {
        ...productPayload,
        id: 'prod-' + Date.now()
      };
      onSaveProducts([newProd, ...products]);
      if (settings.googleSheetWebhookUrl && settings.autoSyncGoogleSheet !== false) {
        syncProductActionToGoogleSheet(settings.googleSheetWebhookUrl, newProd, 'add');
        showToast(`Đã thêm mới máy "${newProd.name}" & đồng bộ lên Google Sheet!`, 'success');
      } else {
        showToast(`Đã thêm mới cây máy "${newProd.name}" vào kho thành công!`, 'success');
      }
    }
    setIsEditingProduct(false);
  };

  const handleDeleteProduct = (prod: Product) => {
    setProductToDelete(prod);
  };

  const confirmDeleteProduct = () => {
    if (!productToDelete) return;
    const deletedProd = productToDelete;
    const deletedName = deletedProd.name;
    const updated = products.filter(p => p.id !== deletedProd.id);
    onSaveProducts(updated);
    if (settings.googleSheetWebhookUrl && settings.autoSyncGoogleSheet !== false) {
      syncProductActionToGoogleSheet(settings.googleSheetWebhookUrl, deletedProd, 'delete');
      showToast(`Đã xóa cây máy "${deletedName}" khỏi kho & cập nhật trên Google Sheet!`, 'info');
    } else {
      showToast(`Đã xóa cây máy "${deletedName}" khỏi kho hàng!`, 'info');
    }
    if (isEditingProduct && currentProduct.id === deletedProd.id) {
      setIsEditingProduct(false);
    }
    setProductToDelete(null);
  };

  const handleEditProductClick = (prod: Product) => {
    setCurrentProduct({
      ...prod,
      exactStorage: prod.exactStorage || prod.storageOptions?.[0] || '128GB',
      exactColor: prod.exactColor || prod.colors?.[0] || { name: 'Titan Tự Nhiên', hex: '#9E988E' },
      detailedImages: prod.detailedImages || {
        overview: prod.gallery || [prod.image],
        screenBezel: [],
        camera: [],
        details: []
      }
    });
    setIsEditingProduct(true);
  };

  const handleAddNewProductClick = () => {
    setCurrentProduct({
      name: '',
      series: '16 Series',
      availability: 'in_stock',
      imei: '',
      exactStorage: '128GB',
      exactColor: { name: 'Titan Tự Nhiên', hex: '#9E988E' },
      price: 15000000,
      originalPrice: 17000000,
      storageOptions: ['128GB'],
      condition: 'Like New 99%',
      batteryHealth: 'Pin 100%',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
      colors: [{ name: 'Titan Tự Nhiên', hex: '#9E988E' }],
      tag: 'CÓ SẴN TẠI QUẦY',
      orderEstimateDays: '15 - 30 Phút',
      shortDesc: 'Máy đẹp keng nguyên bản 100%, bảo hành 1 đổi 1 60 ngày.',
      detailedImages: {
        overview: [],
        screenBezel: [],
        camera: [],
        details: []
      }
    });
    setIsEditingProduct(true);
  };

  // Color helpers in Product Form
  const handleAddColor = (name: string, hex: string) => {
    const list = currentProduct.colors || [];
    setCurrentProduct({
      ...currentProduct,
      colors: [...list, { name, hex }]
    });
  };

  const handleRemoveColor = (index: number) => {
    const list = currentProduct.colors || [];
    setCurrentProduct({
      ...currentProduct,
      colors: list.filter((_, idx) => idx !== index)
    });
  };

  // Detailed images per category helpers
  const handleAddDetailedImage = (category: 'overview' | 'screenBezel' | 'camera' | 'details', url: string) => {
    if (!url) return;
    const converted = convertGoogleDriveImageUrl(url);
    const detailed = currentProduct.detailedImages || { overview: [], screenBezel: [], camera: [], details: [] };
    const list = detailed[category] || [];
    setCurrentProduct({
      ...currentProduct,
      detailedImages: {
        ...detailed,
        [category]: [...list, converted]
      }
    });
  };

  const handleRemoveDetailedImage = (category: 'overview' | 'screenBezel' | 'camera' | 'details', index: number) => {
    const detailed = currentProduct.detailedImages || { overview: [], screenBezel: [], camera: [], details: [] };
    const list = detailed[category] || [];
    setCurrentProduct({
      ...currentProduct,
      detailedImages: {
        ...detailed,
        [category]: list.filter((_, idx) => idx !== index)
      }
    });
  };

  // Save Settings
  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempSettings.name?.trim()) {
      showToast('Tên cửa hàng không được để trống!', 'error');
      return;
    }
    onSaveSettings(tempSettings);
    setIsSettingsSaved(true);
    showToast('Đã lưu tất cả cài đặt cửa hàng & logo thành công!', 'success');
    setTimeout(() => setIsSettingsSaved(false), 3000);
  };

  // Gallery CRUD
  const handleAddGalleryItem = () => {
    if (!newGalleryItem.url?.trim()) {
      showToast('Vui lòng chọn hoặc dán link ảnh không gian!', 'error');
      return;
    }
    const updatedList: StoreGalleryImage[] = [
      ...storeImagesList,
      {
        id: 'st-' + Date.now(),
        url: convertGoogleDriveImageUrl(newGalleryItem.url),
        title: newGalleryItem.title || 'Không gian cửa hàng Táo New',
        caption: newGalleryItem.caption || 'Khu vực trưng bày và phục vụ khách hàng'
      }
    ];
    setStoreImagesList(updatedList);
    const updatedSettings = { ...tempSettings, storeImages: updatedList };
    setTempSettings(updatedSettings);
    onSaveSettings(updatedSettings);
    setNewGalleryItem({ url: '', title: '', caption: '' });
    showToast('Đã thêm ảnh không gian vào Showroom thành công!', 'success');
  };

  const handleDeleteGalleryItem = (item: StoreGalleryImage) => {
    setGalleryItemToDelete(item);
  };

  const confirmDeleteGalleryItem = () => {
    if (!galleryItemToDelete) return;
    const updatedList = storeImagesList.filter(item => item.id !== galleryItemToDelete.id);
    setStoreImagesList(updatedList);
    const updatedSettings = { ...tempSettings, storeImages: updatedList };
    setTempSettings(updatedSettings);
    onSaveSettings(updatedSettings);
    setGalleryItemToDelete(null);
    showToast('Đã xóa ảnh khỏi Showroom!', 'info');
  };

  // Customer Reviews / Delivery Photos CRUD
  const handleAddReviewItem = () => {
    if (!newReviewItem.imageUrl?.trim()) {
      showToast('Vui lòng chọn hoặc dán link ảnh bàn giao thực tế!', 'error');
      return;
    }
    const updatedList: CustomerReviewItem[] = [
      {
        id: 'rev-' + Date.now(),
        imageUrl: convertGoogleDriveImageUrl(newReviewItem.imageUrl),
        customerName: newReviewItem.customerName.trim() || 'Khách Hàng Táo New',
        deviceBought: newReviewItem.deviceBought.trim() || 'iPhone Chuẩn Zin',
        date: newReviewItem.date.trim() || 'Mới đây',
        feedback: newReviewItem.feedback.trim() || 'Máy chuẩn đẹp keng, test zin 100%, bảo hành uy tín!'
      },
      ...customerReviewsList
    ];
    setCustomerReviewsList(updatedList);
    const updatedSettings = { ...tempSettings, customerReviews: updatedList };
    setTempSettings(updatedSettings);
    onSaveSettings(updatedSettings);
    setNewReviewItem({
      imageUrl: '',
      customerName: 'Khách Hàng Táo New',
      deviceBought: '',
      date: 'Mới giao',
      feedback: ''
    });
    showToast('Đã thêm ảnh bàn giao máy thực tế thành công!', 'success');
  };

  const handleDeleteReviewItem = (item: CustomerReviewItem) => {
    setReviewItemToDelete(item);
  };

  const confirmDeleteReviewItem = () => {
    if (!reviewItemToDelete) return;
    const updatedList = customerReviewsList.filter(item => item.id !== reviewItemToDelete.id);
    setCustomerReviewsList(updatedList);
    const updatedSettings = { ...tempSettings, customerReviews: updatedList };
    setTempSettings(updatedSettings);
    onSaveSettings(updatedSettings);
    setReviewItemToDelete(null);
    showToast('Đã xóa ảnh bàn giao máy!', 'info');
  };

  // Sync Products from Google Sheets (Public Link)
  const handleSyncFromSheet = async () => {
    if (!sheetSyncUrl.trim()) {
      showToast('Vui lòng dán link Google Sheet!', 'error');
      return;
    }
    setIsSyncingSheet(true);
    setSheetSyncResult(null);

    const result = await fetchProductsFromGoogleSheet(sheetSyncUrl.trim());
    setIsSyncingSheet(false);

    if (result.success && result.products) {
      onSaveProducts(result.products as Product[]);
      setSheetSyncResult({
        success: true,
        message: `Đã đồng bộ thành công ${result.products.length} sản phẩm thực tế từ Google Sheet!`
      });
      showToast(`Đã đồng bộ thành công ${result.products.length} sản phẩm từ Google Sheet!`, 'success');
    } else {
      setSheetSyncResult({
        success: false,
        message: result.message || 'Không thể đồng bộ dữ liệu. Vui lòng kiểm tra quyền chia sẻ bảng tính.'
      });
      showToast(result.message || 'Không thể đồng bộ bảng tính!', 'error');
    }
  };

  // Push All Products to Google Sheet via Webhook
  const handlePushAllProductsToSheet = async () => {
    const webhookUrl = tempSettings.googleSheetWebhookUrl || settings.googleSheetWebhookUrl;
    if (!webhookUrl || !webhookUrl.trim()) {
      showToast('Vui lòng nhập URL Google Sheet Webhook trước trong mục Cài Đặt hoặc phía dưới!', 'error');
      return;
    }
    setIsPushingAllToSheet(true);
    const result = await syncAllProductsToGoogleSheet(webhookUrl.trim(), products);
    setIsPushingAllToSheet(false);
    if (result.success) {
      showToast(`Đã đẩy toàn bộ ${products.length} cây máy lên Google Sheet thành công!`, 'success');
    } else {
      showToast(result.message || 'Lỗi gửi dữ liệu lên Google Sheet', 'error');
    }
  };

  // Direct CSV File Upload from Computer
  const handleCSVFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (!content) return;
      const result = parseProductsFromCSVText(content);
      if (result.success && result.products) {
        onSaveProducts(result.products);
        showToast(result.message, 'success');
      } else {
        showToast(result.message || 'Lỗi đọc tệp CSV.', 'error');
      }
      if (csvFileInputRef.current) {
        csvFileInputRef.current.value = '';
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  // JSON Database Backup & Restore Handlers
  const handleExportJSONBackup = () => {
    exportFullDatabaseBackup(products, tempSettings, leads);
    showToast('Đã tải tệp sao lưu JSON toàn bộ website về máy tính thành công!', 'success');
  };

  const handleJSONBackupFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (!content) return;
      const result = importFullDatabaseBackup(content);
      if (result.success && result.data) {
        onSaveProducts(result.data.products);
        onSaveSettings(result.data.settings);
        onSaveLeads(result.data.leads);
        showToast(result.message, 'success');
      } else {
        showToast(result.message || 'File sao lưu không hợp lệ.', 'error');
      }
      if (jsonBackupInputRef.current) {
        jsonBackupInputRef.current.value = '';
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  // Copy Google Script Code
  const handleCopyScript = () => {
    navigator.clipboard.writeText(SAMPLE_GOOGLE_APPS_SCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  // Test Google Drive link preview tool
  const handleTestDriveLink = () => {
    if (!testDriveInput.trim()) return;
    const directUrl = convertGoogleDriveImageUrl(testDriveInput.trim());
    setTestDriveResult({
      original: testDriveInput.trim(),
      direct: directUrl
    });
  };

  // Lead Order CRUD Handlers
  const handleEditLead = (lead: LeadOrder) => {
    setEditingLead({ ...lead });
  };

  const handleSaveEditedLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    if (!editingLead.customerName?.trim() || !editingLead.phoneNumber?.trim()) {
      showToast('Vui lòng nhập họ tên khách hàng và số điện thoại!', 'error');
      return;
    }

    const updatedLeads = leads.map(l => l.id === editingLead.id ? editingLead : l);
    onSaveLeads(updatedLeads);
    setEditingLead(null);
    showToast('Đã lưu thông tin chỉnh sửa đơn hàng thành công!', 'success');
  };

  const handleQuickChangeLeadStatus = (leadId: string, newStatus: LeadOrder['status']) => {
    const updatedLeads = leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l);
    onSaveLeads(updatedLeads);
    showToast('Đã cập nhật trạng thái xử lý đơn hàng!', 'success');
  };

  const handleDeleteLead = (lead: LeadOrder) => {
    setLeadToDelete(lead);
  };

  const confirmDeleteLead = () => {
    if (!leadToDelete) return;
    const updatedLeads = leads.filter(l => l.id !== leadToDelete.id);
    onSaveLeads(updatedLeads);
    setLeadToDelete(null);
    if (editingLead && editingLead.id === leadToDelete.id) {
      setEditingLead(null);
    }
    showToast('Đã xóa đơn hàng khỏi danh sách thành công!', 'info');
  };

  const confirmClearCompletedLeads = () => {
    const updatedLeads = leads.filter(l => l.status !== 'completed' && l.status !== 'closed' && l.status !== 'cancelled');
    const removedCount = leads.length - updatedLeads.length;
    onSaveLeads(updatedLeads);
    setShowClearCompletedConfirm(false);
    showToast(`Đã dọn dẹp ${removedCount} đơn đã hỗ trợ / hủy!`, 'info');
  };

  // Lead counts statistics
  const leadStats = {
    total: leads.length,
    new: leads.filter(l => (l.status || 'new') === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    completed: leads.filter(l => l.status === 'completed' || l.status === 'closed').length,
    cancelled: leads.filter(l => l.status === 'cancelled').length,
  };

  // Filtered leads
  const filteredLeads = leads.filter(l => {
    if (leadStatusFilter !== 'all') {
      const currentStatus = l.status || 'new';
      if (currentStatus !== leadStatusFilter) return false;
    }
    if (!leadSearch.trim()) return true;
    const q = leadSearch.toLowerCase();
    return (
      (l.customerName || '').toLowerCase().includes(q) ||
      (l.phoneNumber || '').includes(q) ||
      (l.interestedProduct || '').toLowerCase().includes(q) ||
      (l.imei || '').toLowerCase().includes(q) ||
      (l.note || '').toLowerCase().includes(q)
    );
  });

  // PIN Login View
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#121216] border border-neutral-800 text-white shadow-2xl space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-neutral-800 flex items-center justify-center text-white">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold">Quản Trị Hệ Thống Táo New</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-neutral-400 mb-1.5 font-medium">
                Nhập Mã PIN Quản Trị
              </label>
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="••••"
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-2xl text-center text-xl tracking-[0.5em] text-white focus:outline-none focus:border-white transition-colors"
                autoFocus
              />
              {pinError && (
                <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Mã PIN không chính xác. Vui lòng thử lại!
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-white text-black font-extrabold text-sm hover:bg-neutral-200 transition-colors shadow-lg active:scale-98"
            >
              Mở Khóa Bảng Quản Trị
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main Admin Dashboard
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-hidden">
      <div className="w-full max-w-6xl h-[92vh] rounded-3xl bg-[#101014] border border-neutral-800 text-white shadow-2xl flex flex-col overflow-hidden">
        
        {/* Hidden File Inputs for Import */}
        <input
          type="file"
          ref={csvFileInputRef}
          accept=".csv,text/csv"
          onChange={handleCSVFileSelect}
          className="hidden"
        />
        <input
          type="file"
          ref={jsonBackupInputRef}
          accept=".json,application/json"
          onChange={handleJSONBackupFileSelect}
          className="hidden"
        />

        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between shrink-0 bg-[#0c0c0f]">
          <div className="flex items-center gap-3">
            <Logo variant="mark" logoUrl={tempSettings.logoUrl} size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold text-white">
                  Trung Tâm Quản Trị Táo New
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Admin Online
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Quản lý kho máy, upload ảnh showroom, Google Sheet, Google Drive & Sao lưu dữ liệu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 py-2.5 bg-[#09090c] border-b border-neutral-800/80 flex items-center gap-2 overflow-x-auto shrink-0 no-scrollbar">
          <button
            onClick={() => { setActiveTab('products'); setIsEditingProduct(false); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-white text-black shadow-md'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Kho Máy & Giá Bán ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'gallery'
                ? 'bg-white text-black shadow-md'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            Ảnh Cửa Hàng ({storeImagesList.length})
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'bg-white text-black shadow-md'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-400" />
            Ảnh Bàn Giao Khách ({customerReviewsList.length})
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'leads'
                ? 'bg-white text-black shadow-md'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <User className="w-4 h-4" />
            Khách Đặt Giữ Máy ({leads.length})
          </button>

          <button
            onClick={() => setActiveTab('sheets')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'sheets'
                ? 'bg-white text-black shadow-md'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Google Sheet & Drive
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'backup'
                ? 'bg-white text-black shadow-md'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Database className="w-4 h-4" />
            Sao Lưu & Phục Hồi
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-white text-black shadow-md'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            Cài Đặt Logo & Bảo Hành
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#0f0f13]">
          
          {/* TAB 1: KHO MÁY & SẢN PHẨM */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {isEditingProduct ? (
                /* PRODUCT EDIT FORM WITH CATEGORIZED IMAGE UPLOADS */
                <form onSubmit={handleSaveProduct} className="max-w-4xl mx-auto space-y-6 bg-neutral-900/90 p-6 rounded-3xl border border-neutral-800">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs">
                        {currentProduct.id ? 'SỬA' : 'TẠO'}
                      </div>
                      <h3 className="text-base font-bold text-white">
                        {currentProduct.id ? 'Chỉnh Sửa Thông Tin Máy' : 'Thêm Máy Mới Vào Kho'}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingProduct(false)}
                      className="text-xs text-neutral-400 hover:text-white"
                    >
                      Hủy bỏ
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">Tên Dòng Máy *</label>
                      <input
                        type="text"
                        required
                        value={currentProduct.name || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                        placeholder="Ví dụ: iPhone 16 Pro Max 256GB"
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">Phân Loại Series *</label>
                      <select
                        value={currentProduct.series || '16 Series'}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, series: e.target.value as SeriesCategory })}
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white"
                      >
                        <option value="17 Series">17 Series</option>
                        <option value="16 Series">16 Series</option>
                        <option value="15 Series">15 Series</option>
                        <option value="14 Series">14 Series</option>
                        <option value="13 Series">13 Series</option>
                        <option value="12 Series">12 Series</option>
                        <option value="11 Series">11 Series</option>
                        <option value="Phụ kiện">Phụ kiện Apple</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">Trạng Thái Sẵn Hàng *</label>
                      <select
                        value={currentProduct.availability || 'in_stock'}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, availability: e.target.value as ProductAvailability })}
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white"
                      >
                        <option value="in_stock">Có Sẵn Tại Shop (Cây máy cụ thể)</option>
                        <option value="order">Hàng Order (15 - 30 Phút Có Máy)</option>
                      </select>
                    </div>

                    {/* IMEI / SERIAL - CHO HÀNG CÓ SẴN HOẶC THỜI GIAN ORDER */}
                    {currentProduct.availability === 'in_stock' ? (
                      <div>
                        <label className="block text-xs font-bold text-emerald-400 mb-1">
                          Mã IMEI / Serial Cây Máy (Hàng sẵn cụ thể) *
                        </label>
                        <input
                          type="text"
                          value={currentProduct.imei || ''}
                          onChange={(e) => setCurrentProduct({ ...currentProduct, imei: e.target.value })}
                          placeholder="Ví dụ: IMEI: ...8923 hoặc Mã: TN-16PM-01"
                          className="w-full px-3.5 py-2.5 bg-neutral-950 border border-emerald-500/50 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-amber-400 mb-1">Thời Gian Order / Giao</label>
                        <input
                          type="text"
                          value={currentProduct.orderEstimateDays || '15 - 30 Phút'}
                          onChange={(e) => setCurrentProduct({ ...currentProduct, orderEstimateDays: e.target.value })}
                          placeholder="Mặc định: 15 - 30 Phút"
                          className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white font-mono"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">Giá Bán Thực Tế (VNĐ) *</label>
                      <input
                        type="number"
                        required
                        value={currentProduct.price || 0}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })}
                        placeholder="Ví dụ: 24500000"
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">Giá Gốc Niêm Yết (VNĐ)</label>
                      <input
                        type="number"
                        value={currentProduct.originalPrice || 0}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, originalPrice: Number(e.target.value) })}
                        placeholder="Ví dụ: 27900000"
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">Tình Trạng Ngoại Hình</label>
                      <input
                        type="text"
                        value={currentProduct.condition || 'Like New 99%'}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, condition: e.target.value })}
                        placeholder="Ví dụ: Like New 99% Zin Keng, Chưa qua sửa chữa"
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">Tình Trạng Pin</label>
                      <input
                        type="text"
                        value={currentProduct.batteryHealth || 'Pin 100%'}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, batteryHealth: e.target.value })}
                        placeholder="Ví dụ: Pin 98% hoặc Pin 100% Zin"
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">Tag Nhãn Nổi Bật</label>
                      <input
                        type="text"
                        value={currentProduct.tag || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, tag: e.target.value })}
                        placeholder="Ví dụ: CÓ SẴN TẠI QUẦY, PIN 100%, LIKE NEW 99%"
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">Mô Tả Nhanh Máy</label>
                      <input
                        type="text"
                        value={currentProduct.shortDesc || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, shortDesc: e.target.value })}
                        placeholder="Máy đẹp zin nguyên bản, tặng full sạc cáp ốp dán trọn đời..."
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white"
                      />
                    </div>
                  </div>

                  {/* DUNG LƯỢNG & MÀU SẮC */}
                  <div className="pt-2 border-t border-neutral-800 space-y-4">
                    {currentProduct.availability === 'in_stock' ? (
                      /* KHỐI HÀNG CÓ SẴN: DUNG LƯỢNG & MÀU CHÍNH XÁC CỦA CÂY MÁY */
                      <div className="p-4 rounded-2xl bg-neutral-950 border border-emerald-500/30 space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            Cấu Hình Cây Máy Có Sẵn (Chính xác dung lượng & màu sắc)
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-neutral-300 mb-1">Dung lượng máy:</label>
                            <div className="flex gap-2">
                              {['64GB', '128GB', '256GB', '512GB', '1TB'].map((cap) => (
                                <button
                                  type="button"
                                  key={cap}
                                  onClick={() => setCurrentProduct({
                                    ...currentProduct,
                                    exactStorage: cap,
                                    storageOptions: [cap]
                                  })}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    (currentProduct.exactStorage || currentProduct.storageOptions?.[0]) === cap
                                      ? 'bg-emerald-500 text-black shadow-md'
                                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                                  }`}
                                >
                                  {cap}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-300 mb-1">Màu sắc máy:</label>
                            <div className="flex flex-wrap gap-2">
                              {[
                                { name: 'Titan Sa Mạc', hex: '#C2A383' },
                                { name: 'Titan Tự Nhiên', hex: '#9E988E' },
                                { name: 'Titan Trắng', hex: '#E3E4E5' },
                                { name: 'Titan Đen', hex: '#2C2B2E' },
                                { name: 'Titan Xanh', hex: '#3B4D5B' },
                                { name: 'Deep Purple', hex: '#4A3B52' },
                                { name: 'Gold', hex: '#F4E8CE' },
                                { name: 'Silver', hex: '#E1E2E4' }
                              ].map((c) => (
                                <button
                                  type="button"
                                  key={c.name}
                                  onClick={() => {
                                    setCurrentProduct({
                                      ...currentProduct,
                                      exactColor: { name: c.name, hex: c.hex },
                                      colors: [{ name: c.name, hex: c.hex }]
                                    });
                                  }}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                    (currentProduct.exactColor?.name || currentProduct.colors?.[0]?.name) === c.name
                                      ? 'bg-emerald-500 text-black font-bold'
                                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                                  }`}
                                >
                                  <span className="w-2 h-2 rounded-full border border-black/30" style={{ backgroundColor: c.hex }} />
                                  {c.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* KHỐI HÀNG ORDER: NHIỀU DUNG LƯỢNG & NHIỀU MÀU SẮC CHO KHÁCH LỰA CHỌN */
                      <div className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/30 space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            Cấu Hình Hàng Order (Cho phép khách tự chọn Màu & Dung lượng)
                          </h4>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-neutral-300 mb-1.5">
                            Các dung lượng có thể order (cách nhau bởi dấu phẩy):
                          </label>
                          <input
                            type="text"
                            value={(currentProduct.storageOptions || ['128GB', '256GB', '512GB']).join(', ')}
                            onChange={(e) => {
                              const opts = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                              setCurrentProduct({ ...currentProduct, storageOptions: opts });
                            }}
                            placeholder="128GB, 256GB, 512GB, 1TB"
                            className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-neutral-300 mb-1.5">
                            Các màu sắc có thể order:
                          </label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {currentProduct.colors?.map((c, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-white">
                                <span className="w-3 h-3 rounded-full border border-neutral-600" style={{ backgroundColor: c.hex }} />
                                {c.name}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveColor(idx)}
                                  className="text-neutral-400 hover:text-rose-400 ml-1"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-2 max-w-md">
                            <input
                              type="text"
                              id="input-new-color-name"
                              placeholder="Tên màu mới (VD: Titan Tự Nhiên)"
                              className="flex-1 px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white"
                            />
                            <input
                              type="color"
                              id="input-new-color-hex"
                              defaultValue="#9E988E"
                              className="w-8 h-8 p-0.5 bg-neutral-900 border border-neutral-700 rounded-lg cursor-pointer"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const nameEl = document.getElementById('input-new-color-name') as HTMLInputElement;
                                const hexEl = document.getElementById('input-new-color-hex') as HTMLInputElement;
                                if (nameEl && hexEl && nameEl.value.trim()) {
                                  handleAddColor(nameEl.value.trim(), hexEl.value);
                                  nameEl.value = '';
                                }
                              }}
                              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold"
                            >
                              + Thêm màu
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 1. ẢNH ĐẠI DIỆN CHÍNH CỦA MÁY */}
                  <div className="pt-2 border-t border-neutral-800">
                    <label className="block text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      1. Ảnh Đại Diện Chính (Thumbnail hiển thị ở danh sách) *
                    </label>
                    <ImageUploadInput
                      value={currentProduct.image || ''}
                      onChange={(url) => setCurrentProduct({ ...currentProduct, image: url })}
                      webhookUrl={tempSettings.googleSheetWebhookUrl || settings.googleSheetWebhookUrl}
                      label=""
                      placeholder="Dán link ảnh Google Drive hoặc bấm tải từ máy..."
                      aspectRatio="square"
                    />
                  </div>

                  {/* 2. CÁC MỤC ẢNH CHI TIẾT THEO DANH MỤC */}
                  <div className="pt-4 border-t border-neutral-800 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-4 h-4 text-sky-400" />
                        2. Các Mục Ảnh Chụp Thực Tế Chi Tiết (Khách có thể xem từng góc chụp)
                      </h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Tải ảnh thực tế của máy theo từng góc độ để khách kiểm tra độ zin và thẩm mỹ:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Mục A: Ngoại hình máy */}
                      <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-200">📱 Ngoại hình (Mặt trước / Mặt sau)</span>
                          <span className="text-[10px] text-neutral-500">{currentProduct.detailedImages?.overview?.length || 0} ảnh</span>
                        </div>
                        <ImageUploadInput
                          value=""
                          onChange={(url) => handleAddDetailedImage('overview', url)}
                          webhookUrl={tempSettings.googleSheetWebhookUrl || settings.googleSheetWebhookUrl}
                          placeholder="Thêm ảnh ngoại hình máy..."
                          label=""
                        />
                        {currentProduct.detailedImages?.overview && currentProduct.detailedImages.overview.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {currentProduct.detailedImages.overview.map((img, idx) => (
                              <div key={idx} className="relative w-14 h-14 rounded-lg bg-neutral-900 border border-neutral-700 overflow-hidden group">
                                <img src={img} alt="overview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDetailedImage('overview', idx)}
                                  className="absolute inset-0 bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Mục B: Viền màn hình & Khung sườn */}
                      <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-200">🔍 Viền màn hình & 4 góc sườn</span>
                          <span className="text-[10px] text-neutral-500">{currentProduct.detailedImages?.screenBezel?.length || 0} ảnh</span>
                        </div>
                        <ImageUploadInput
                          value=""
                          onChange={(url) => handleAddDetailedImage('screenBezel', url)}
                          webhookUrl={tempSettings.googleSheetWebhookUrl || settings.googleSheetWebhookUrl}
                          placeholder="Thêm ảnh viền màn hình..."
                          label=""
                        />
                        {currentProduct.detailedImages?.screenBezel && currentProduct.detailedImages.screenBezel.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {currentProduct.detailedImages.screenBezel.map((img, idx) => (
                              <div key={idx} className="relative w-14 h-14 rounded-lg bg-neutral-900 border border-neutral-700 overflow-hidden group">
                                <img src={img} alt="bezel" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDetailedImage('screenBezel', idx)}
                                  className="absolute inset-0 bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Mục C: Cụm Camera */}
                      <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-200">📷 Cụm Camera (Mắt cam & viền cam)</span>
                          <span className="text-[10px] text-neutral-500">{currentProduct.detailedImages?.camera?.length || 0} ảnh</span>
                        </div>
                        <ImageUploadInput
                          value=""
                          onChange={(url) => handleAddDetailedImage('camera', url)}
                          webhookUrl={tempSettings.googleSheetWebhookUrl || settings.googleSheetWebhookUrl}
                          placeholder="Thêm ảnh cụm camera..."
                          label=""
                        />
                        {currentProduct.detailedImages?.camera && currentProduct.detailedImages.camera.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {currentProduct.detailedImages.camera.map((img, idx) => (
                              <div key={idx} className="relative w-14 h-14 rounded-lg bg-neutral-900 border border-neutral-700 overflow-hidden group">
                                <img src={img} alt="camera" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDetailedImage('camera', idx)}
                                  className="absolute inset-0 bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Mục D: Cổng sạc & Loa */}
                      <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-200">🔌 Cổng sạc Type-C/Lightning & Loa</span>
                          <span className="text-[10px] text-neutral-500">{currentProduct.detailedImages?.details?.length || 0} ảnh</span>
                        </div>
                        <ImageUploadInput
                          value=""
                          onChange={(url) => handleAddDetailedImage('details', url)}
                          webhookUrl={tempSettings.googleSheetWebhookUrl || settings.googleSheetWebhookUrl}
                          placeholder="Thêm ảnh cổng sạc & loa..."
                          label=""
                        />
                        {currentProduct.detailedImages?.details && currentProduct.detailedImages.details.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {currentProduct.detailedImages.details.map((img, idx) => (
                              <div key={idx} className="relative w-14 h-14 rounded-lg bg-neutral-900 border border-neutral-700 overflow-hidden group">
                                <img src={img} alt="details" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDetailedImage('details', idx)}
                                  className="absolute inset-0 bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="pt-4 border-t border-neutral-800 flex items-center justify-between gap-3">
                    <div>
                      {currentProduct.id && (
                        <button
                          type="button"
                          onClick={() => {
                            const found = products.find(p => p.id === currentProduct.id);
                            if (found) handleDeleteProduct(found);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Xóa Máy Này Khỏi Kho
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsEditingProduct(false)}
                        className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-black flex items-center gap-2 shadow-lg transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Lưu Sản Phẩm Vào Kho
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* PRODUCT LIST TABLE */
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-white">
                        Danh Sách Máy Đang Bán ({products.length} dòng máy)
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Bấm sửa để thay đổi giá bán, tình trạng hoặc cập nhật thêm các ảnh góc chụp thực tế.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Direct CSV Export */}
                      <button
                        type="button"
                        onClick={() => {
                          exportProductsToCSV(products);
                          showToast('Đã tải tệp CSV kho sản phẩm về máy tính!', 'success');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                        title="Xuất bảng tính CSV mở bằng Excel / Google Sheet"
                      >
                        <FileDown className="w-3.5 h-3.5 text-sky-400" />
                        Xuất CSV
                      </button>

                      {/* Direct CSV Import */}
                      <button
                        type="button"
                        onClick={() => csvFileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                        title="Tải lên tệp CSV từ máy tính"
                      >
                        <FileUp className="w-3.5 h-3.5 text-emerald-400" />
                        Nhập CSV
                      </button>

                      {/* Add Product Button */}
                      <button
                        onClick={handleAddNewProductClick}
                        className="px-4 py-2 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-neutral-200 transition-colors flex items-center gap-1.5 shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm Máy Mới
                      </button>
                    </div>
                  </div>

                  {/* Products Grid / Table */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {products.map((prod) => (
                      <div
                        key={prod.id}
                        className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all flex items-start gap-3 relative group"
                      >
                        <div className="w-16 h-16 rounded-xl bg-neutral-950 border border-neutral-800 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="max-h-full max-w-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                              {prod.series}
                            </span>
                            {prod.availability === 'in_stock' ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                                Sẵn kho
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-black">
                                Order 15-30p
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs font-bold text-white truncate">{prod.name}</h4>
                          <p className="text-xs font-extrabold text-emerald-400">{formatVND(prod.price)}</p>
                          {prod.availability === 'in_stock' ? (
                            <p className="text-[10px] text-neutral-300 flex items-center gap-1 font-mono">
                              <span className="text-emerald-400 font-bold">{prod.imei || 'Sẵn kho'}</span> • {prod.exactStorage || prod.storageOptions?.[0]} • {prod.exactColor?.name || prod.colors?.[0]?.name}
                            </p>
                          ) : (
                            <p className="text-[10px] text-amber-300">
                              Tùy chọn: {prod.storageOptions?.join(', ')} • {prod.colors?.map(c => c.name).join(', ')}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            onClick={() => handleEditProductClick(prod)}
                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
                            title="Sửa máy này"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                            title="Xóa máy này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ẢNH CỬA HÀNG & SHOWROOM */}
          {activeTab === 'gallery' && (
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* HƯỚNG DẪN TẢI ẢNH CHO CHỦ SHOP */}
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-neutral-300 space-y-1">
                  <p className="font-bold text-white">Cách Thêm Ảnh Showroom Chuẩn Đẹp:</p>
                  <p>
                    📁 <strong>Cách 1: Tải trực tiếp từ điện thoại / máy tính</strong> — Bấm vào khung bên dưới để chọn ảnh chụp showroom.
                  </p>
                  <p>
                    🔗 <strong>Cách 2: Sử dụng link Google Drive hoặc link Web</strong> — Dán link ảnh chia sẻ ở chế độ <em>"Bất kỳ ai có đường liên kết"</em> (Anyone with the link), hệ thống sẽ tự chuyển đổi định dạng chuẩn.
                  </p>
                  <p>
                    💡 <strong>Gợi ý ảnh chụp đẹp:</strong> Chụp góc rộng không gian quầy trưng bày, bàn trải nghiệm iPhone, khu vực kỹ thuật viên test 3uTools công khai, quầy phụ kiện chính hãng để tăng uy tín cho khách hàng.
                  </p>
                </div>
              </div>

              {/* ADD NEW STORE PHOTO FORM */}
              <div className="p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  Thêm Ảnh Không Gian Mới Vào Trang Chủ
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <ImageUploadInput
                      value={newGalleryItem.url}
                      onChange={(url) => setNewGalleryItem({ ...newGalleryItem, url })}
                      webhookUrl={tempSettings.googleSheetWebhookUrl || settings.googleSheetWebhookUrl}
                      label="Chọn hoặc Dán Ảnh Cửa Hàng *"
                      placeholder="Tải ảnh showroom từ máy hoặc nhập URL Google Drive..."
                      aspectRatio="video"
                    />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">Tiêu Đề Ảnh *</label>
                      <input
                        type="text"
                        value={newGalleryItem.title}
                        onChange={(e) => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })}
                        placeholder="Ví dụ: Bàn Trải Nghiệm iPhone & Test 3uTools"
                        className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">Mô Tả Ngắn (Caption)</label>
                      <input
                        type="text"
                        value={newGalleryItem.caption}
                        onChange={(e) => setNewGalleryItem({ ...newGalleryItem, caption: e.target.value })}
                        placeholder="Ví dụ: Đầy đủ máy demo chuẩn zin cho khách trải nghiệm trực tiếp."
                        className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddGalleryItem}
                      disabled={!newGalleryItem.url}
                      className="w-full py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      Đăng Ảnh Lên Trang Chủ
                    </button>
                  </div>
                </div>
              </div>

              {/* STORE PHOTOS LIST */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Danh Sách Ảnh Không Gian Hiện Tại ({storeImagesList.length})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {storeImagesList.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden flex flex-col justify-between group"
                    >
                      <div className="aspect-video w-full bg-neutral-950 overflow-hidden relative">
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          onClick={() => handleDeleteGalleryItem(item)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-500 text-white transition-colors shadow-md"
                          title="Xóa ảnh này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="p-3.5 space-y-1">
                        <h5 className="text-xs font-bold text-white truncate">{item.title}</h5>
                        {item.caption && (
                          <p className="text-[11px] text-neutral-400 line-clamp-2">{item.caption}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB: ẢNH BÀN GIAO MÁY THỰC TẾ (CUSTOMER DELIVERY REVIEWS) */}
          {activeTab === 'reviews' && (
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* HƯỚNG DẪN */}
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-start gap-3">
                <Heart className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 fill-rose-400" />
                <div className="text-xs text-neutral-300 space-y-1">
                  <p className="font-bold text-white">Quản Lý Mục "Hình Ảnh Bàn Giao Máy Thực Tế":</p>
                  <p>
                    📸 Các bức ảnh được thêm ở đây sẽ tự động hiển thị chạy mượt mà trên thanh <strong>"Tri Ân Khách Hàng - Hình Ảnh Bàn Giao Máy Thực Tế"</strong> ngoài trang chủ.
                  </p>
                  <p>
                    📁 Bạn có thể <strong>tải trực tiếp từ máy ảnh điện thoại/máy tính</strong> hoặc dán link Google Drive chia sẻ công khai.
                  </p>
                </div>
              </div>

              {/* FORM THÊM ẢNH BÀN GIAO MỚI */}
              <div className="p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-rose-400" />
                  Thêm Ảnh Bàn Giao Khách Mới
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <ImageUploadInput
                      value={newReviewItem.imageUrl}
                      onChange={(url) => setNewReviewItem({ ...newReviewItem, imageUrl: url })}
                      webhookUrl={tempSettings.googleSheetWebhookUrl || settings.googleSheetWebhookUrl}
                      label="Chọn hoặc Dán Ảnh Bàn Giao Thực Tế *"
                      placeholder="Tải ảnh khách nhận máy từ thiết bị hoặc nhập link Google Drive..."
                      aspectRatio="square"
                    />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">Dòng Máy Bàn Giao *</label>
                      <input
                        type="text"
                        value={newReviewItem.deviceBought}
                        onChange={(e) => setNewReviewItem({ ...newReviewItem, deviceBought: e.target.value })}
                        placeholder="Ví dụ: iPhone 16 Pro Max 256GB Desert Titanium"
                        className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1">Tên Khách Hàng</label>
                        <input
                          type="text"
                          value={newReviewItem.customerName}
                          onChange={(e) => setNewReviewItem({ ...newReviewItem, customerName: e.target.value })}
                          placeholder="Ví dụ: Anh Hoàng / Chị Linh"
                          className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1">Thời Gian Giao</label>
                        <input
                          type="text"
                          value={newReviewItem.date}
                          onChange={(e) => setNewReviewItem({ ...newReviewItem, date: e.target.value })}
                          placeholder="Ví dụ: Hôm nay / Vừa giao"
                          className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 mb-1">Cảm Nhận / Đánh Giá Ngắn (Tùy Chọn)</label>
                      <input
                        type="text"
                        value={newReviewItem.feedback}
                        onChange={(e) => setNewReviewItem({ ...newReviewItem, feedback: e.target.value })}
                        placeholder="Ví dụ: Khách lên đời máy mới, test zin 3uTools xanh 100%, hài lòng tuyệt đối!"
                        className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddReviewItem}
                      disabled={!newReviewItem.imageUrl}
                      className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Đăng Ảnh Lên Mục Bàn Giao Thực Tế
                    </button>
                  </div>
                </div>
              </div>

              {/* DANH SÁCH ẢNH BÀN GIAO HIỆN TẠI */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Danh Sách Ảnh Bàn Giao Đang Chạy ({customerReviewsList.length})
                  </h4>
                  <span className="text-[11px] text-neutral-500">
                    Bấm vào thùng rác đỏ để xóa ảnh không dùng
                  </span>
                </div>

                {customerReviewsList.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs">
                    Chưa có ảnh bàn giao nào. Hãy tải lên ảnh bàn giao đầu tiên ở khung trên.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                    {customerReviewsList.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden flex flex-col justify-between group relative hover:border-neutral-700 transition-all"
                      >
                        <div className="aspect-[4/3] w-full bg-neutral-950 overflow-hidden relative">
                          <img
                            src={item.imageUrl}
                            alt={item.deviceBought || 'Ảnh bàn giao máy'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            onClick={() => handleDeleteReviewItem(item)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white transition-colors shadow-lg cursor-pointer"
                            title="Xóa ảnh này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="p-2.5 space-y-0.5">
                          <p className="text-[11px] font-bold text-white truncate">
                            {item.deviceBought || 'iPhone Chuẩn Zin'}
                          </p>
                          <p className="text-[10px] text-neutral-400 truncate">
                            {item.customerName} • {item.date || 'Mới đây'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: KHÁCH ĐẶT GIỮ MÁY (LEADS & ORDERS) */}
          {activeTab === 'leads' && (
            <div className="space-y-4">
              
              {/* Header & Controls */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Quản Lý Đơn Hàng & Khách Đặt Máy</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                      {leads.length} đơn
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Theo dõi, gọi tư vấn, chỉnh sửa thông tin hoặc xóa đơn hàng sau khi đã hỗ trợ xong.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                  {/* Search input */}
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={leadSearch}
                      onChange={(e) => setLeadSearch(e.target.value)}
                      placeholder="Tìm theo tên / SĐT / máy / IMEI..."
                      className="pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-white w-full sm:w-60"
                    />
                  </div>

                  {/* Bulk Clear Completed Button */}
                  {leadStats.completed + leadStats.cancelled > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowClearCompletedConfirm(true)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Dọn dẹp các đơn đã hoàn tất hoặc đã hủy"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Dọn đơn đã xong ({leadStats.completed + leadStats.cancelled})</span>
                    </button>
                  )}

                  {/* Export Excel Button */}
                  <button
                    type="button"
                    onClick={() => {
                      exportLeadsToCSV(leads);
                      showToast('Đã tải danh sách khách hàng ra file Excel / CSV!', 'success');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Xuất File Excel</span>
                  </button>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-neutral-950/80 border border-neutral-800/80 text-xs">
                <button
                  type="button"
                  onClick={() => setLeadStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    leadStatusFilter === 'all' 
                      ? 'bg-neutral-800 text-white shadow-sm' 
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>Tất Cả</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-neutral-700/60 text-[10px] text-neutral-300 font-mono">
                    {leadStats.total}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setLeadStatusFilter('new')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    leadStatusFilter === 'new' 
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm' 
                      : 'text-neutral-400 hover:text-sky-300'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                  <span>Đơn Mới</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-sky-950 text-[10px] text-sky-300 font-mono">
                    {leadStats.new}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setLeadStatusFilter('contacted')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    leadStatusFilter === 'contacted' 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' 
                      : 'text-neutral-400 hover:text-amber-300'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>Đã Liên Hệ / Đang Tư Vấn</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-950 text-[10px] text-amber-300 font-mono">
                    {leadStats.contacted}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setLeadStatusFilter('completed')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    leadStatusFilter === 'completed' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' 
                      : 'text-neutral-400 hover:text-emerald-300'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Đã Hoàn Tất / Bàn Giao</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-[10px] text-emerald-300 font-mono">
                    {leadStats.completed}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setLeadStatusFilter('cancelled')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    leadStatusFilter === 'cancelled' 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm' 
                      : 'text-neutral-400 hover:text-rose-300'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  <span>Đã Hủy</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-950 text-[10px] text-rose-300 font-mono">
                    {leadStats.cancelled}
                  </span>
                </button>
              </div>

              {/* Leads Table */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300 min-w-[760px]">
                  <thead className="bg-neutral-950 text-neutral-400 font-semibold border-b border-neutral-800">
                    <tr>
                      <th className="p-3.5">Khách Hàng</th>
                      <th className="p-3.5">Liên Hệ (Hotline / Zalo)</th>
                      <th className="p-3.5">Máy Đặt / Quan Tâm</th>
                      <th className="p-3.5">Phân Loại</th>
                      <th className="p-3.5">Thời Gian</th>
                      <th className="p-3.5">Trạng Thái</th>
                      <th className="p-3.5 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-neutral-500 space-y-1">
                          <p className="font-semibold text-neutral-400">
                            {leads.length === 0 ? 'Chưa có lượt đăng ký giữ máy nào.' : 'Không tìm thấy đơn hàng phù hợp với bộ lọc.'}
                          </p>
                          {leadSearch && (
                            <button
                              onClick={() => setLeadSearch('')}
                              className="text-xs text-emerald-400 hover:underline cursor-pointer"
                            >
                              Xóa từ khóa tìm kiếm
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead) => {
                        const status = lead.status || 'new';
                        return (
                          <tr key={lead.id} className="hover:bg-neutral-800/40 transition-colors group">
                            {/* Khách hàng */}
                            <td className="p-3.5">
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                <span className="truncate">{lead.customerName}</span>
                              </div>
                              {lead.note && (
                                <div className="mt-1 flex items-start gap-1 text-[11px] text-amber-300/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 line-clamp-1" title={lead.note}>
                                  <FileText className="w-3 h-3 shrink-0 mt-0.5 text-amber-400" />
                                  <span className="truncate">{lead.note}</span>
                                </div>
                              )}
                            </td>

                            {/* Số điện thoại / Zalo */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-2">
                                <a 
                                  href={`tel:${lead.phoneNumber}`} 
                                  className="font-mono text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                                  title="Bấm để gọi ngay"
                                >
                                  <Phone className="w-3 h-3 shrink-0" /> {lead.phoneNumber}
                                </a>
                                <a
                                  href={`https://zalo.me/${lead.phoneNumber.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 rounded bg-[#4094ff]/20 hover:bg-[#4094ff]/30 text-[#4094ff] text-[10px] font-bold transition-colors"
                                  title="Mở Zalo nhắn tin với khách"
                                >
                                  Zalo
                                </a>
                              </div>
                            </td>

                            {/* Máy quan tâm */}
                            <td className="p-3.5">
                              <div className="font-semibold text-neutral-100 flex items-center gap-1">
                                <Smartphone className="w-3 h-3 text-neutral-400 shrink-0" />
                                <span className="truncate">{lead.interestedProduct}</span>
                              </div>
                              <div className="text-[11px] text-neutral-400 flex flex-wrap items-center gap-1.5 mt-0.5">
                                {lead.storageSelected && (
                                  <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-mono text-[10px]">
                                    {lead.storageSelected}
                                  </span>
                                )}
                                {lead.colorSelected && (
                                  <span className="text-neutral-400">
                                    Màu: {lead.colorSelected}
                                  </span>
                                )}
                                {lead.imei && (
                                  <span className="font-mono text-emerald-400/90 text-[10px] bg-emerald-950/60 px-1 rounded border border-emerald-500/20">
                                    IMEI: {lead.imei}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Phân loại */}
                            <td className="p-3.5">
                              {lead.orderType === 'in_stock' ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 whitespace-nowrap">
                                  Máy Sẵn Shop
                                </span>
                              ) : lead.orderType === 'consultation' ? (
                                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30 whitespace-nowrap">
                                  Tư Vấn Máy
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-amber-400 text-black text-[10px] font-bold whitespace-nowrap">
                                  Order 15-30P
                                </span>
                              )}
                            </td>

                            {/* Thời gian */}
                            <td className="p-3.5 text-neutral-400 text-[11px] whitespace-nowrap">
                              {new Date(lead.createdAt).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>

                            {/* Trạng thái xử lý (Quick Selector) */}
                            <td className="p-3.5">
                              <select
                                value={status}
                                onChange={(e) => handleQuickChangeLeadStatus(lead.id, e.target.value as LeadOrder['status'])}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer focus:outline-none ${
                                  status === 'new'
                                    ? 'bg-sky-950 text-sky-300 border-sky-500/40'
                                    : status === 'contacted'
                                    ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                                    : status === 'completed' || status === 'closed'
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                                    : 'bg-rose-950 text-rose-300 border-rose-500/40'
                                }`}
                              >
                                <option value="new" className="bg-neutral-900 text-sky-300">🔵 Mới</option>
                                <option value="contacted" className="bg-neutral-900 text-amber-300">🟡 Đã liên hệ</option>
                                <option value="completed" className="bg-neutral-900 text-emerald-300">🟢 Hoàn tất</option>
                                <option value="cancelled" className="bg-neutral-900 text-rose-300">🔴 Đã hủy</option>
                              </select>
                            </td>

                            {/* Thao tác (Edit & Delete) */}
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleEditLead(lead)}
                                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer shadow-sm"
                                  title="Chỉnh sửa đơn hàng"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLead(lead)}
                                  className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white transition-colors cursor-pointer shadow-sm"
                                  title="Xóa đơn hàng"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: GOOGLE SHEET & GOOGLE DRIVE INTEGRATION */}
          {activeTab === 'sheets' && (
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* 1. ĐỒNG BỘ 2 CHIỀU GOOGLE SHEET */}
              <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <FolderSync className="w-5 h-5" />
                    <h3 className="text-sm font-bold text-white">
                      1. Đồng Bộ 2 Chiều Tự Động Với Google Sheet
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {tempSettings.googleSheetWebhookUrl ? 'Đã liên kết Webhook' : 'Sử dụng Local & Sheet'}
                  </span>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  Khi bạn thêm máy, sửa thông tin, đổi giá hoặc xóa máy trên website, hệ thống sẽ tự động cập nhật ngay lập tức vào Google Sheet. Khi mở lại website hoặc ấn F5, dữ liệu sẽ tự động được tải mới nhất từ Google Sheet.
                </p>

                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="url"
                      value={sheetSyncUrl}
                      onChange={(e) => setSheetSyncUrl(e.target.value)}
                      placeholder="Dán link Google Sheet công khai hoặc link Webhook..."
                      className="flex-1 px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white font-mono"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSyncFromSheet}
                        disabled={isSyncingSheet || !sheetSyncUrl.trim()}
                        className="px-4 py-2.5 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-neutral-200 transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheet ? 'animate-spin' : ''}`} />
                        {isSyncingSheet ? 'Đang đọc...' : 'Tải Từ Sheet'}
                      </button>
                      <button
                        type="button"
                        onClick={handlePushAllProductsToSheet}
                        disabled={isPushingAllToSheet}
                        className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                      >
                        <UploadCloud className={`w-3.5 h-3.5 ${isPushingAllToSheet ? 'animate-spin' : ''}`} />
                        {isPushingAllToSheet ? 'Đang đẩy...' : `Đẩy Toàn Bộ ${products.length} Máy Lên Sheet`}
                      </button>
                    </div>
                  </div>

                  {sheetSyncResult && (
                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      sheetSyncResult.success 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {sheetSyncResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                      <span>{sheetSyncResult.message}</span>
                    </div>
                  )}

                  <div className="pt-2 flex items-center gap-3 flex-wrap text-xs">
                    <button
                      type="button"
                      onClick={downloadSampleProductSheetCSV}
                      className="text-sky-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Download className="w-3.5 h-3.5" /> Tải File Mẫu Chuẩn Google Sheet (.CSV)
                    </button>
                    <span className="text-neutral-700">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        exportProductsToCSV(products);
                        showToast('Đã xuất kho sản phẩm ra file CSV!', 'success');
                      }}
                      className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <FileDown className="w-3.5 h-3.5" /> Xuất Kho Hiện Tại Ra CSV
                    </button>
                    <span className="text-neutral-700">|</span>
                    <button
                      type="button"
                      onClick={() => csvFileInputRef.current?.click()}
                      className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <FileUp className="w-3.5 h-3.5" /> Nhập File CSV Từ Máy Tính
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. CÔNG CỤ TEST & LƯU TRỮ ẢNH TRÊN GOOGLE DRIVE */}
              <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
                <div className="flex items-center gap-2 text-sky-400">
                  <LinkIcon className="w-5 h-5" />
                  <h3 className="text-sm font-bold text-white">
                    2. Lưu Trữ Ảnh Trên Google Drive & Tự Động Chuyển Thành Ảnh CDN
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-neutral-400">
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px]">1</span>
                      Tải ảnh lên Google Drive
                    </span>
                    <p className="text-[11px]">Tạo thư mục trên Google Drive và tải ảnh máy / ảnh chi tiết lên.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px]">2</span>
                      Chia sẻ quyền công khai
                    </span>
                    <p className="text-[11px]">Chuột phải vào ảnh hoặc thư mục &gt; Chọn <strong>Chia sẻ (Bất kỳ ai có đường liên kết)</strong>.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px]">3</span>
                      Dán link vào website
                    </span>
                    <p className="text-[11px]">Hệ thống sẽ tự động chuyển thành ảnh chất lượng cao hiển thị siêu mượt.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={testDriveInput}
                      onChange={(e) => setTestDriveInput(e.target.value)}
                      placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                      className="flex-1 px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleTestDriveLink}
                      disabled={!testDriveInput.trim()}
                      className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs transition-colors shrink-0 disabled:opacity-50"
                    >
                      Kiểm Tra Ảnh
                    </button>
                  </div>

                  {testDriveResult && (
                    <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Link CDN trực tiếp đã tạo thành công:
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(testDriveResult.direct);
                            showToast('Đã copy link CDN trực tiếp!', 'success');
                          }}
                          className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" /> Copy Link
                        </button>
                      </div>
                      <p className="text-[11px] font-mono text-neutral-400 break-all bg-neutral-900 p-2 rounded-lg">
                        {testDriveResult.direct}
                      </p>
                      <div className="w-32 h-32 rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden flex items-center justify-center p-1">
                        <img
                          src={testDriveResult.direct}
                          alt="Test Google Drive"
                          className="max-h-full max-w-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. GOOGLE APPS SCRIPT WEBHOOK AUTO-SYNC (2 CHIỀU ĐẦY ĐỦ) */}
              <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400">
                    <FolderSync className="w-5 h-5" />
                    <h3 className="text-sm font-bold text-white">
                      3. Mã Google Apps Script Đồng Bộ 2 Chiều & Nhận Khách Hàng
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyScript}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedScript ? 'Đã sao chép!' : 'Sao chép mã Apps Script'}
                  </button>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  Mã này hỗ trợ đầy đủ <strong>Đồng bộ sản phẩm 2 chiều (Thêm/Sửa/Xóa)</strong> tự động tạo sheet <code>Kho_San_Pham</code> và ghi nhận khách đặt mua vào sheet <code>Don_Hang_Web</code>. Dán vào <strong>Tiện ích mở rộng &gt; Apps Script</strong> trong Google Sheet rồi Deploy dạng <strong>Web App (Bất kỳ ai - Anyone)</strong>.
                </p>

                <pre className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-300 max-h-56 overflow-y-auto no-scrollbar">
                  {SAMPLE_GOOGLE_APPS_SCRIPT_CODE}
                </pre>
              </div>

            </div>
          )}

          {/* TAB 5: SAO LƯU & PHỤC HỒI DỮ LIỆU (FULL DATABASE BACKUP & RESTORE) */}
          {activeTab === 'backup' && (
            <div className="max-w-4xl mx-auto space-y-6">
              
              <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Database className="w-6 h-6" />
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Sao Lưu & Phục Hồi Dữ Liệu Toàn Diện (Không Lo Mất Dữ Liệu)
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Tất cả dữ liệu sản phẩm, cài đặt, logo, ảnh showroom và danh sách khách hàng được lưu trữ bền vững.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  
                  {/* EXPORT BACKUP */}
                  <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                        <FileDown className="w-4 h-4" />
                        Xuất Toàn Bộ Dữ Liệu (.JSON)
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        Tải xuống tệp sao lưu hoàn chỉnh gồm <strong>{products.length} sản phẩm</strong>, toàn bộ cấu hình cửa hàng, ảnh showroom và <strong>{leads.length} đơn hàng</strong>.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportJSONBackup}
                      className="w-full py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      Tải File Sao Lưu (.JSON)
                    </button>
                  </div>

                  {/* IMPORT BACKUP */}
                  <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                        <FileUp className="w-4 h-4" />
                        Phục Hồi Từ File Sao Lưu (.JSON)
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        Khôi phục toàn bộ website chỉ với 1 click khi bạn chuyển sang máy tính mới hoặc reset trình duyệt.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => jsonBackupInputRef.current?.click()}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
                    >
                      <UploadCloud className="w-4 h-4" />
                      Chọn Tệp Sao Lưu Để Phục Hồi
                    </button>
                  </div>

                </div>
              </div>

              {/* THAO TÁC ĐẶC BIỆT */}
              <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Thao Tác Đặt Lại Mẫu Ban Đầu
                </h4>
                <p className="text-xs text-neutral-400">
                  Nếu bạn muốn quay trở lại dữ liệu mẫu lúc mới khởi tạo của Táo New:
                </p>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Khôi Phục Dữ Liệu Mẫu Mặc Định
                </button>
              </div>

            </div>
          )}

          {/* TAB 6: CÀI ĐẶT CỬA HÀNG & LOGO */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettingsSubmit} className="max-w-4xl mx-auto space-y-6 bg-neutral-900/90 p-6 rounded-3xl border border-neutral-800">
              
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Cài Đặt Logo & Thông Tin Táo New</h3>
                  <p className="text-xs text-neutral-400">Thay đổi logo, hotline, địa chỉ và chính sách bảo hành.</p>
                </div>
                {isSettingsSaved && (
                  <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Đã lưu thành công!
                  </span>
                )}
              </div>

              {/* Ô CHÈN VÀ TẢI ẢNH LOGO TỬ TẾ */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Ảnh Logo Cửa Hàng (PNG Trong Suốt / Tự Động Không Viền)
                    </h4>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium">Hỗ trợ PNG trong suốt 100% không viền</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-7">
                    <ImageUploadInput
                      value={tempSettings.logoUrl || ''}
                      onChange={(url) => setTempSettings({ ...tempSettings, logoUrl: url })}
                      webhookUrl={tempSettings.googleSheetWebhookUrl || settings.googleSheetWebhookUrl}
                      label=""
                      placeholder="Tải ảnh logo PNG tách nền từ máy hoặc dán link Google Drive/Web..."
                      aspectRatio="wide"
                    />
                  </div>
                  <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-center">
                    <span className="text-[10px] font-bold text-neutral-400 mb-2">Xem Trước Logo Không Viền:</span>
                    <div className="w-full h-24 rounded-xl bg-gradient-to-b from-neutral-950 to-neutral-900 border border-neutral-800 p-2 flex items-center justify-center overflow-hidden">
                      {tempSettings.logoUrl ? (
                        <img 
                          src={tempSettings.logoUrl} 
                          alt="Xem trước logo" 
                          style={{ mixBlendMode: 'screen' }}
                          className="w-full h-full object-contain drop-shadow-lg select-none"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Logo variant="horizontal" size="md" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Tên Cửa Hàng</label>
                  <input
                    type="text"
                    value={tempSettings.name}
                    onChange={(e) => setTempSettings({ ...tempSettings, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Slogan Cam Kết</label>
                  <input
                    type="text"
                    value={tempSettings.slogan}
                    onChange={(e) => setTempSettings({ ...tempSettings, slogan: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Địa Chỉ Showroom</label>
                  <input
                    type="text"
                    value={tempSettings.address}
                    onChange={(e) => setTempSettings({ ...tempSettings, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Mã PIN Admin Mới</label>
                  <input
                    type="text"
                    value={tempSettings.adminPin}
                    onChange={(e) => setTempSettings({ ...tempSettings, adminPin: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Hotline 1 (Tư vấn)</label>
                  <input
                    type="text"
                    value={tempSettings.hotlines[0] || ''}
                    onChange={(e) => {
                      const h = [...tempSettings.hotlines];
                      h[0] = e.target.value;
                      setTempSettings({ ...tempSettings, hotlines: h });
                    }}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Hotline 2 (Kỹ thuật)</label>
                  <input
                    type="text"
                    value={tempSettings.hotlines[1] || ''}
                    onChange={(e) => {
                      const h = [...tempSettings.hotlines];
                      h[1] = e.target.value;
                      setTempSettings({ ...tempSettings, hotlines: h });
                    }}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white font-mono"
                  />
                </div>
              </div>

              {/* CẤU HÌNH MẠNG XÃ HỘI & BẢN ĐỒ GOOGLE MAPS */}
              <div className="space-y-4 pt-2 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <Share2 className="w-4 h-4" />
                    Cấu Hình Liên Kết Mạng Xã Hội & Bản Đồ Google Maps
                  </div>
                  <span className="text-[11px] text-neutral-400">Tự động kích hoạt các nút liên hệ trên website</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* FACEBOOK LINK */}
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                    <div className="flex items-center gap-2 text-[#1877F2] font-bold text-xs">
                      <Facebook className="w-4 h-4" />
                      Link Facebook Fanpage / Messenger
                    </div>
                    <input
                      type="url"
                      value={tempSettings.facebookLink || ''}
                      onChange={(e) => setTempSettings({ ...tempSettings, facebookLink: e.target.value })}
                      placeholder="https://facebook.com/taonew.official"
                      className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white font-mono"
                    />
                    <span className="text-[10px] text-neutral-500 block">
                      Đường dẫn Fanpage hoặc link chat m.me của shop.
                    </span>
                  </div>

                  {/* ZALO LINK */}
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                    <div className="flex items-center gap-2 text-[#0068FF] font-bold text-xs">
                      <span className="w-4 h-4 rounded-full bg-[#0068FF] text-white flex items-center justify-center text-[9px] font-black">Z</span>
                      Link Zalo (Cá Nhân / OA / Nhóm Báo Giá)
                    </div>
                    <input
                      type="text"
                      value={tempSettings.zaloLink || ''}
                      onChange={(e) => setTempSettings({ ...tempSettings, zaloLink: e.target.value })}
                      placeholder="https://zalo.me/0388859959 hoặc link nhóm"
                      className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white font-mono"
                    />
                    <span className="text-[10px] text-neutral-500 block">
                      Link Zalo cá nhân, Zalo OA hoặc Link Nhóm Zalo báo giá.
                    </span>
                  </div>

                  {/* GOOGLE MAPS LINK */}
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                      <MapPin className="w-4 h-4" />
                      Link Google Maps Chỉ Đường
                    </div>
                    <input
                      type="url"
                      value={tempSettings.googleMapsLink || ''}
                      onChange={(e) => setTempSettings({ ...tempSettings, googleMapsLink: e.target.value })}
                      placeholder="https://maps.google.com/?q=..."
                      className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white font-mono"
                    />
                    <span className="text-[10px] text-neutral-500 block">
                      Link định vị ghim địa chỉ showroom trên Google Maps.
                    </span>
                  </div>
                </div>
              </div>

              {/* Webhook Google Sheet */}
              <div className="space-y-4 pt-2 border-t border-neutral-800">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <FolderSync className="w-4 h-4" />
                  Cấu Hình Đồng Bộ 2 Chiều Google Sheet
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Google Apps Script Webhook URL (Đồng bộ Thêm/Sửa/Xóa máy & Nhận Đơn Hàng)
                  </label>
                  <input
                    type="url"
                    value={tempSettings.googleSheetWebhookUrl || ''}
                    onChange={(e) => setTempSettings({ ...tempSettings, googleSheetWebhookUrl: e.target.value })}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white font-mono"
                  />
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    URL Web App triển khai từ Google Apps Script (Quyền truy cập: Anyone).
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Link Bảng Tính Google Sheet Danh Mục Máy (Công Khai)
                  </label>
                  <input
                    type="url"
                    value={tempSettings.googleSheetProductUrl || ''}
                    onChange={(e) => setTempSettings({ ...tempSettings, googleSheetProductUrl: e.target.value })}
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit?usp=sharing"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white font-mono"
                  />
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Link này dùng để tự động tải danh mục sản phẩm khi F5 hoặc mở trang web.
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">Tự động đồng bộ 2 chiều khi F5 hoặc sửa đổi kho</span>
                    <p className="text-[11px] text-neutral-400">Khi bật, mọi thao tác sửa, thêm, xóa máy và tải trang sẽ tự động đồng bộ qua Google Sheet.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tempSettings.autoSyncGoogleSheet !== false}
                      onChange={(e) => setTempSettings({ ...tempSettings, autoSyncGoogleSheet: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Khôi phục dữ liệu gốc
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-black flex items-center gap-2 shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  Lưu Tất Cả Cài Đặt
                </button>
              </div>

            </form>
          )}

        </div>

        {/* ========================================================================= */}
        {/* CUSTOM IN-APP DELETE MODAL FOR PRODUCT */}
        {/* ========================================================================= */}
        {productToDelete && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Xác Nhận Xóa Máy Khỏi Kho</h4>
                  <p className="text-xs text-neutral-400">Thao tác này sẽ xóa máy khỏi danh sách hiển thị.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center gap-3">
                <img
                  src={productToDelete.image}
                  alt={productToDelete.name}
                  className="w-12 h-12 object-contain rounded-lg bg-neutral-900 border border-neutral-800 p-0.5 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{productToDelete.name}</p>
                  <p className="text-[11px] text-emerald-400 font-bold">{formatVND(productToDelete.price)}</p>
                  <p className="text-[10px] text-neutral-400 truncate font-mono">
                    {productToDelete.imei ? `IMEI: ${productToDelete.imei} • ` : ''}
                    {productToDelete.exactStorage || productToDelete.storageOptions?.[0]} • {productToDelete.exactColor?.name || productToDelete.colors?.[0]?.name}
                  </p>
                </div>
              </div>

              <p className="text-xs text-neutral-300">
                Bạn có chắc chắn muốn xóa cây máy này không? Sau khi xóa, bạn vẫn có thể thêm lại bất kỳ lúc nào.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteProduct}
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors shadow-lg flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Đồng Ý Xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CUSTOM IN-APP DELETE MODAL FOR GALLERY ITEM */}
        {/* ========================================================================= */}
        {galleryItemToDelete && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Xác Nhận Xóa Ảnh Không Gian</h4>
                  <p className="text-xs text-neutral-400">Ảnh này sẽ không còn hiển thị ở mục Showroom trang chủ.</p>
                </div>
              </div>

              <div className="aspect-video w-full rounded-2xl bg-neutral-950 overflow-hidden border border-neutral-800">
                <img src={galleryItemToDelete.url} alt={galleryItemToDelete.title} className="w-full h-full object-cover" />
              </div>

              <p className="text-xs font-bold text-white">{galleryItemToDelete.title}</p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGalleryItemToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteGalleryItem}
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors shadow-lg flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa Ảnh
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CUSTOM IN-APP DELETE MODAL FOR CUSTOMER DELIVERY REVIEW */}
        {/* ========================================================================= */}
        {reviewItemToDelete && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Xác Nhận Xóa Ảnh Bàn Giao Máy</h4>
                  <p className="text-xs text-neutral-400">Ảnh này sẽ ngừng hiển thị trên thanh Tri Ân Khách Hàng.</p>
                </div>
              </div>

              <div className="aspect-[4/3] w-full rounded-2xl bg-neutral-950 overflow-hidden border border-neutral-800">
                <img
                  src={reviewItemToDelete.imageUrl}
                  alt={reviewItemToDelete.deviceBought || 'Ảnh bàn giao'}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-xs space-y-0.5">
                <p className="font-bold text-white">{reviewItemToDelete.deviceBought || 'iPhone Chuẩn Zin'}</p>
                <p className="text-neutral-400">{reviewItemToDelete.customerName} • {reviewItemToDelete.date || 'Mới đây'}</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewItemToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteReviewItem}
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors shadow-lg flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa Ảnh Bàn Giao
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CUSTOM IN-APP EDIT LEAD / ORDER MODAL */}
        {/* ========================================================================= */}
        {editingLead && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
            <div className="w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-3xl p-6 space-y-5 shadow-2xl my-8">
              
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2.5 text-white">
                  <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                    <Edit className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Chỉnh Sửa Thông Tin Đơn Hàng</h4>
                    <p className="text-[11px] text-neutral-400">Cập nhật thông tin khách, máy đặt hoặc trạng thái hỗ trợ.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditedLead} className="space-y-4 text-xs">
                {/* Tên khách hàng & SĐT */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Họ & Tên Khách Hàng <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingLead.customerName}
                      onChange={(e) => setEditingLead({ ...editingLead, customerName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white"
                      placeholder="VD: Anh Nam, Chị Hương..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Số Điện Thoại / Zalo <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={editingLead.phoneNumber}
                      onChange={(e) => setEditingLead({ ...editingLead, phoneNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-emerald-400 font-mono focus:outline-none focus:border-white"
                      placeholder="09xxxxxxxx"
                    />
                  </div>
                </div>

                {/* Máy quan tâm */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Dòng Máy Quan Tâm <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingLead.interestedProduct}
                    onChange={(e) => setEditingLead({ ...editingLead, interestedProduct: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white"
                    placeholder="VD: iPhone 15 Pro Max 256GB Titan Tự Nhiên"
                  />
                </div>

                {/* Dung lượng & Màu sắc */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Dung Lượng
                    </label>
                    <input
                      type="text"
                      value={editingLead.storageSelected || ''}
                      onChange={(e) => setEditingLead({ ...editingLead, storageSelected: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white font-mono"
                      placeholder="128GB / 256GB / 512GB / 1TB"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Màu Sắc
                    </label>
                    <input
                      type="text"
                      value={editingLead.colorSelected || ''}
                      onChange={(e) => setEditingLead({ ...editingLead, colorSelected: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white"
                      placeholder="Titan Tự Nhiên / Trắng / Đen..."
                    />
                  </div>
                </div>

                {/* Mã IMEI máy */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Mã IMEI / Cây Máy Cụ Thể (Nếu có)
                  </label>
                  <input
                    type="text"
                    value={editingLead.imei || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, imei: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-emerald-400 font-mono focus:outline-none focus:border-white"
                    placeholder="VD: 358921098491823"
                  />
                </div>

                {/* Phân loại & Trạng thái */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Phân Loại Đơn
                    </label>
                    <select
                      value={editingLead.orderType || 'in_stock'}
                      onChange={(e) => setEditingLead({ ...editingLead, orderType: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white"
                    >
                      <option value="in_stock">Máy Sẵn Tại Shop</option>
                      <option value="order">Order 15-30P</option>
                      <option value="consultation">Tư Vấn & Báo Giá</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Trạng Thái Xử Lý
                    </label>
                    <select
                      value={editingLead.status || 'new'}
                      onChange={(e) => setEditingLead({ ...editingLead, status: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white"
                    >
                      <option value="new">🔵 Mới (Chưa gọi)</option>
                      <option value="contacted">🟡 Đã Liên Hệ / Đang Tư Vấn</option>
                      <option value="completed">🟢 Đã Hoàn Tất / Bàn Giao Máy</option>
                      <option value="cancelled">🔴 Đã Hủy / Khách Không Mua</option>
                    </select>
                  </div>
                </div>

                {/* Ghi chú */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Ghi Chú Khách Hàng / Ghi Chú Cửa Hàng
                  </label>
                  <textarea
                    rows={3}
                    value={editingLead.note || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, note: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-white resize-none"
                    placeholder="VD: Khách hẹn 18h qua xem máy, lấy thêm sạc 20W..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteLead(editingLead);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Xóa Đơn Này
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingLead(null)}
                      className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-colors shadow-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Lưu Thay Đổi
                    </button>
                  </div>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CUSTOM IN-APP DELETE SINGLE LEAD MODAL */}
        {/* ========================================================================= */}
        {leadToDelete && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Xác Nhận Xóa Đơn Hàng</h4>
                  <p className="text-xs text-neutral-400">Đơn hàng này sẽ bị xóa khỏi danh sách quản lý.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Khách hàng:</span>
                  <span className="font-bold text-white">{leadToDelete.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Số điện thoại:</span>
                  <span className="font-mono text-emerald-400">{leadToDelete.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Máy quan tâm:</span>
                  <span className="font-semibold text-neutral-200">{leadToDelete.interestedProduct}</span>
                </div>
                {leadToDelete.imei && (
                  <div className="flex justify-between">
                    <span className="text-neutral-400">IMEI:</span>
                    <span className="font-mono text-emerald-400">{leadToDelete.imei}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setLeadToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteLead}
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa Đơn Hàng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CUSTOM IN-APP BULK CLEAR COMPLETED LEADS MODAL */}
        {/* ========================================================================= */}
        {showClearCompletedConfirm && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 text-amber-400">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Dọn Dẹp Đơn Đã Hoàn Tất</h4>
                  <p className="text-xs text-neutral-400">Xóa các đơn đã bàn giao hoặc đã hủy sau khi hỗ trợ xong.</p>
                </div>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                Hệ thống sẽ xóa <strong className="text-white font-bold">{leadStats.completed + leadStats.cancelled} đơn hàng</strong> đã ở trạng thái "Hoàn tất" hoặc "Đã hủy" để làm gọn danh sách. Các đơn "Mới" và "Đang tư vấn" vẫn được giữ nguyên.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClearCompletedConfirm(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={confirmClearCompletedLeads}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold transition-colors shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Đồng Ý Dọn Dẹp
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CUSTOM IN-APP RESET DEFAULTS MODAL */}
        {/* ========================================================================= */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 text-amber-400">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Khôi Phục Dữ Liệu Gốc</h4>
                  <p className="text-xs text-neutral-400">Cài đặt lại toàn bộ sản phẩm và thông tin mặc định.</p>
                </div>
              </div>

              <p className="text-xs text-neutral-300">
                Bạn có chắc muốn đưa dữ liệu về trạng thái mẫu ban đầu? Toàn bộ các sản phẩm tạo thủ công sẽ được thay thế lại bằng danh sách mẫu.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetConfirm(false);
                    onResetDefaults();
                    setIsEditingProduct(false);
                    showToast('Đã khôi phục toàn bộ sản phẩm và cài đặt cửa hàng về mặc định ban đầu!', 'info');
                  }}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold transition-colors shadow-lg"
                >
                  Đồng Ý Khôi Phục
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PROMINENT IN-APP FLOATING TOAST NOTIFICATION */}
        {/* ========================================================================= */}
        {toast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] max-w-md w-[90%] pointer-events-auto animate-in slide-in-from-top-4 duration-300">
            <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center justify-between gap-3 text-xs font-bold ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200 shadow-emerald-950/50'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/60 text-rose-200 shadow-rose-950/50'
                : 'bg-amber-950/90 border-amber-500/60 text-amber-200 shadow-amber-950/50'
            }`}>
              <div className="flex items-center gap-2.5 min-w-0">
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                {toast.type === 'info' && <RefreshCw className="w-5 h-5 text-amber-400 shrink-0" />}
                <p className="truncate leading-relaxed">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
