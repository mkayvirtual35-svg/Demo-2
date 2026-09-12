import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { DEFAULT_STORE_SETTINGS, INITIAL_PRODUCTS } from './src/data/initialData';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser with 50MB limit to support image uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Directories for persistent data and uploaded media
  const DATA_DIR = path.join(process.cwd(), 'data');
  const DB_FILE = path.join(DATA_DIR, 'store_database.json');
  const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  // Helper to initialize or read the database
  function getDatabase() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.products && parsed.settings) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error reading store_database.json, falling back to initial data:', err);
    }

    // Initialize with default store data
    const initialDb = {
      products: INITIAL_PRODUCTS,
      settings: DEFAULT_STORE_SETTINGS,
      leads: [],
      updatedAt: new Date().toISOString()
    };
    saveDatabase(initialDb);
    return initialDb;
  }

  // Helper to persist database atomically
  function saveDatabase(dbData: any): boolean {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Error saving store_database.json:', err);
      return false;
    }
  }

  // Serve static uploads
  app.use('/uploads', express.static(UPLOADS_DIR));

  // ================= API ROUTES (MUST COME BEFORE VITE MIDDLEWARE) =================

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // 2. Fetch full store data (products, settings, leads)
  app.get('/api/data', (req, res) => {
    const db = getDatabase();
    res.json({
      success: true,
      products: db.products || [],
      settings: db.settings || DEFAULT_STORE_SETTINGS,
      leads: db.leads || [],
      updatedAt: db.updatedAt || new Date().toISOString()
    });
  });

  // 3. Save products
  app.post('/api/products', (req, res) => {
    const { products } = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ success: false, message: 'Dữ liệu danh sách sản phẩm không hợp lệ' });
    }

    // Chặn sản phẩm ma 0đ
    const cleanProducts = products.filter(
      p => (Number(p.price) || 0) > 0 && !(p.name && p.name.trim().toLowerCase() === 'iphone' && Number(p.price) < 1000000)
    );

    const db = getDatabase();
    db.products = cleanProducts;
    db.updatedAt = new Date().toISOString();
    saveDatabase(db);

    res.json({
      success: true,
      message: `Đã lưu thành công ${cleanProducts.length} sản phẩm lên máy chủ!`,
      count: cleanProducts.length
    });
  });

  // 4. Save settings (logo, hotlines, address, banners, reviews, policies)
  app.post('/api/settings', (req, res) => {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, message: 'Dữ liệu cài đặt không hợp lệ' });
    }

    const db = getDatabase();
    db.settings = {
      ...db.settings,
      ...settings
    };
    db.updatedAt = new Date().toISOString();
    saveDatabase(db);

    res.json({
      success: true,
      message: 'Đã lưu thông tin cửa hàng thành công!',
      settings: db.settings
    });
  });

  // 5. Submit customer lead / order
  app.post('/api/leads', (req, res) => {
    const { lead } = req.body;
    if (!lead || !lead.customerPhone) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp số điện thoại khách hàng' });
    }

    const newLead = {
      ...lead,
      id: lead.id || ('lead-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7)),
      createdAt: lead.createdAt || new Date().toISOString(),
      status: lead.status || 'new',
      syncedToSheet: false
    };

    const db = getDatabase();
    const leadsList = Array.isArray(db.leads) ? db.leads : [];
    leadsList.unshift(newLead);
    db.leads = leadsList;
    db.updatedAt = new Date().toISOString();
    saveDatabase(db);

    res.json({
      success: true,
      message: 'Đã lưu thông tin đơn hàng / tư vấn thành công!',
      lead: newLead
    });
  });

  // 6. Direct image upload to server disk
  app.post('/api/upload-image', (req, res) => {
    try {
      const { base64, fileName, mimeType } = req.body;
      if (!base64) {
        return res.status(400).json({ success: false, message: 'Không có dữ liệu ảnh tải lên' });
      }

      let ext = '.jpg';
      let cleanBase64 = base64;

      if (base64.includes(';base64,')) {
        const parts = base64.split(';base64,');
        cleanBase64 = parts[1];
        const mime = parts[0].replace('data:', '').toLowerCase();
        if (mime.includes('png')) ext = '.png';
        else if (mime.includes('webp')) ext = '.webp';
        else if (mime.includes('svg')) ext = '.svg';
        else if (mime.includes('gif')) ext = '.gif';
      } else if (mimeType) {
        if (mimeType.includes('png')) ext = '.png';
        else if (mimeType.includes('webp')) ext = '.webp';
        else if (mimeType.includes('svg')) ext = '.svg';
        else if (mimeType.includes('gif')) ext = '.gif';
      }

      const filePrefix = (fileName ? fileName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30) : 'taonew');
      const uniqueFileName = `${filePrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}${ext}`;
      const targetFilePath = path.join(UPLOADS_DIR, uniqueFileName);

      const buffer = Buffer.from(cleanBase64, 'base64');
      fs.writeFileSync(targetFilePath, buffer);

      const imageUrl = `/uploads/${uniqueFileName}`;
      res.json({
        success: true,
        imageUrl: imageUrl,
        fileName: uniqueFileName
      });
    } catch (err: any) {
      console.error('Lỗi lưu ảnh máy chủ:', err);
      res.status(500).json({ success: false, message: 'Lỗi ghi ảnh: ' + err.message });
    }
  });

  // 7. Reset to default state
  app.post('/api/reset', (req, res) => {
    const defaultDb = {
      products: INITIAL_PRODUCTS,
      settings: DEFAULT_STORE_SETTINGS,
      leads: [],
      updatedAt: new Date().toISOString()
    };
    saveDatabase(defaultDb);
    res.json({
      success: true,
      message: 'Đã khôi phục dữ liệu gốc của Táo New Store thành công!',
      products: defaultDb.products,
      settings: defaultDb.settings
    });
  });

  // ================= VITE OR STATIC SERVING =================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Táo New Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
