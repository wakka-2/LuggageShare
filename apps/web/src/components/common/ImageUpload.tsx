'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import apiClient from '@/lib/api';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  folder?: string;
  currentImage?: string;
  label?: string;
}

export default function ImageUpload({
  onUpload,
  folder = 'general',
  currentImage,
  label = 'رفع صورة',
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post(
        `/uploads/image?folder=${encodeURIComponent(folder)}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const url = response.data?.url || response.data;
      onUpload(url);
    } catch {
      setError('فشل رفع الصورة. حاول مرة أخرى.');
      setPreview(currentImage || null);
    } finally {
      setIsUploading(false);
    }
  }

  function handleClear() {
    setPreview(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm font-medium text-v2-text">{label}</span>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="image-upload-input"
      />

      {preview ? (
        <div className="relative w-full aspect-video rounded-[22px] overflow-hidden bg-v2-bg border-2 border-dashed border-v2-primary/20">
          <img src={preview} alt="معاينة" className="w-full h-full object-cover" />

          {isUploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}

          {!isUploading && (
            <button
              onClick={handleClear}
              className="absolute top-2 left-2 rtl:left-auto rtl:right-2 w-8 h-8 rounded-full bg-white/90 shadow-bubble-sm flex items-center justify-center text-v2-text-muted hover:text-v2-secondary transition-colors"
              aria-label="إزالة الصورة"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-video rounded-[22px] border-2 border-dashed border-v2-primary/20 bg-v2-bg hover:border-v2-primary/40 hover:bg-v2-primary/5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-v2-primary/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-v2-primary" />
          </div>
          <span className="text-sm text-v2-text-soft">اضغط لرفع صورة</span>
          <span className="text-xs text-v2-text-muted">PNG, JPG حتى 5MB</span>
        </button>
      )}

      {error && <p className="text-xs text-v2-secondary">{error}</p>}
    </div>
  );
}
