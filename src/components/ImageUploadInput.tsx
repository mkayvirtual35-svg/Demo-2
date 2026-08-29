import React, { useRef, useState } from 'react';
import { UploadCloud, Link as LinkIcon, X, Check, Image as ImageIcon, AlertCircle, CloudCheck, Loader2 } from 'lucide-react';
import { convertGoogleDriveImageUrl, uploadImageToGoogleDriveViaWebhook } from '../services/googleSheet';

interface ImageUploadInputProps {
  value: string;
  onChange: (url: string) => void;
  webhookUrl?: string;
  label?: string;
  placeholder?: string;
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto';
  className?: string;
  helperText?: string;
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  value,
  onChange,
  webhookUrl,
  label,
  placeholder = 'Nhập link ảnh (Web / Google Drive) hoặc tải từ máy...',
  aspectRatio = 'square',
  className = '',
  helperText,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadedToDrive, setUploadedToDrive] = useState(false);

  // Handle local file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Vui lòng chọn đúng định dạng file ảnh (PNG, JPG, JPEG, WEBP).');
      return;
    }

    setErrorMessage('');
    setIsProcessing(true);
    setUploadedToDrive(false);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (result) {
        // Tối ưu nén ảnh qua canvas và giữ nguyên kênh Alpha trong suốt cho PNG
        const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
        compressImageIfNeeded(result, isPng, async (optimized) => {
          // Nếu đã cấu hình Webhook Google Apps Script, cố gắng đẩy trực tiếp lên thư mục Google Drive
          if (webhookUrl && webhookUrl.trim().startsWith('http')) {
            try {
              const driveUploadRes = await uploadImageToGoogleDriveViaWebhook(
                webhookUrl,
                optimized,
                file.name || `img_${Date.now()}.${isPng ? 'png' : 'jpg'}`
              );
              if (driveUploadRes.success && driveUploadRes.directUrl) {
                onChange(driveUploadRes.directUrl);
                setUrlInput(driveUploadRes.directUrl);
                setUploadedToDrive(true);
                setIsProcessing(false);
                return;
              }
            } catch (uploadErr) {
              console.warn('Upload to Drive failed, fallback to local optimized image:', uploadErr);
            }
          }

          // Fallback lưu trực tiếp ảnh đã tối ưu (giữ trọn vẹn trong suốt)
          onChange(optimized);
          setUrlInput(optimized);
          setIsProcessing(false);
        });
      } else {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Lỗi khi đọc file ảnh từ máy.');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  // Compress image if needed, preserving transparent PNG and auto-removing dark solid backgrounds for logos
  const compressImageIfNeeded = (dataUrl: string, isPng: boolean, callback: (result: string) => void) => {
    const img = new window.Image();
    img.onload = () => {
      const maxDim = 1200;
      let { width, height } = img;
      
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Nếu là ảnh PNG hoặc ảnh logo cần tách nền: tự động kiểm tra và chuyển các pixel nền đen/tối thành trong suốt 100%
        if (isPng || aspectRatio === 'banner' || aspectRatio === 'wide' || aspectRatio === 'square') {
          try {
            const imgData = ctx.getImageData(0, 0, width, height);
            const data = imgData.data;
            let hasDarkBackground = false;

            // Kiểm tra mẫu 4 góc ảnh xem có nền đen/tối không
            const cornerIndices = [0, (width - 1) * 4, ((height - 1) * width) * 4, ((height - 1) * width + width - 1) * 4];
            for (const idx of cornerIndices) {
              if (idx < data.length) {
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const a = data[idx + 3];
                if (a > 100 && (r < 30 && g < 30 && b < 30)) {
                  hasDarkBackground = true;
                  break;
                }
              }
            }

            // Nếu phát hiện nền đen nguyên khối, xử lý chuyển nền đen thành trong suốt (Alpha = 0)
            if (hasDarkBackground) {
              for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];
                if (a > 0) {
                  const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
                  if (brightness <= 24) {
                    data[i + 3] = 0; // Trong suốt hoàn toàn
                  } else if (brightness < 55) {
                    // Chuyển tiếp mượt mà vùng viền
                    data[i + 3] = Math.round(((brightness - 24) / 31) * a);
                  }
                }
              }
              ctx.putImageData(imgData, 0, 0);
            }

            // Xuất chuẩn PNG trong suốt không nén vỡ
            const compressedPng = canvas.toDataURL('image/png');
            callback(compressedPng);
            return;
          } catch (e) {
            console.warn('Canvas pixel processing error, falling back:', e);
          }
        }

        // Xuất ảnh JPEG chất lượng cao 85% cho các ảnh thông thường
        const compressed = isPng ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.85);
        callback(compressed);
      } else {
        callback(dataUrl);
      }
    };
    img.onerror = () => callback(dataUrl);
    img.src = dataUrl;
  };

  // Handle URL change
  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    const processed = convertGoogleDriveImageUrl(urlInput.trim());
    onChange(processed);
    setUrlInput(processed);
    setErrorMessage('');
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    setErrorMessage('');
    setUploadedToDrive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getAspectClass = () => {
    if (aspectRatio === 'square') return 'aspect-square max-h-36';
    if (aspectRatio === 'video') return 'aspect-video max-h-44';
    if (aspectRatio === 'banner') return 'aspect-[21/9] max-h-48';
    return 'max-h-48';
  };

  const isGoogleDriveImage = value.includes('googleusercontent.com') || value.includes('drive.google.com') || uploadedToDrive;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
            {label}
            {isGoogleDriveImage && (
              <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-500/30">
                Google Drive
              </span>
            )}
          </label>
          <div className="flex items-center gap-1 text-[11px]">
            <button
              type="button"
              onClick={() => setInputMode('upload')}
              className={`px-2 py-0.5 rounded transition-colors ${
                inputMode === 'upload'
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Tải từ máy
            </button>
            <span className="text-neutral-600">|</span>
            <button
              type="button"
              onClick={() => setInputMode('url')}
              className={`px-2 py-0.5 rounded transition-colors ${
                inputMode === 'url'
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Nhập URL Drive
            </button>
          </div>
        </div>
      )}

      {/* Preview if exists */}
      {value ? (
        <div className="relative rounded-xl border border-neutral-700 bg-neutral-900/90 overflow-hidden group flex items-center justify-center p-2">
          <img
            src={value}
            alt="Preview"
            className={`w-full object-contain rounded-lg ${getAspectClass()}`}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold border border-neutral-600 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Đổi ảnh
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 transition-colors"
              title="Xóa ảnh"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Empty State / Upload Mode */
        <div className="space-y-2">
          {inputMode === 'upload' ? (
            <div
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-700 hover:border-neutral-500 rounded-xl p-4 text-center cursor-pointer bg-neutral-900/50 hover:bg-neutral-900 transition-all group"
            >
              {isProcessing ? (
                <div className="flex flex-col items-center py-1">
                  <Loader2 className="w-6 h-6 text-sky-400 animate-spin mb-1.5" />
                  <p className="text-xs font-bold text-sky-300">
                    Đang xử lý & lưu ảnh vào Google Drive...
                  </p>
                </div>
              ) : (
                <>
                  <UploadCloud className="w-6 h-6 text-neutral-400 group-hover:text-white mx-auto mb-1.5 transition-colors" />
                  <p className="text-xs font-bold text-neutral-200 group-hover:text-white">
                    Bấm để tải ảnh từ máy tính / điện thoại
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {webhookUrl ? 'Tự động lưu vào thư mục Google Drive' : 'Hỗ trợ PNG, JPG, JPEG, WEBP (tự động tối ưu)'}
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder={placeholder}
                  className="w-full pl-8 pr-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-3 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors shrink-0 flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Dùng
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {errorMessage && (
        <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {errorMessage}
        </p>
      )}

      {helperText && !errorMessage && (
        <p className="text-[10px] text-neutral-400 mt-1">{helperText}</p>
      )}
    </div>
  );
};

