'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Check, AlertCircle, Sparkles, ZoomIn, ZoomOut, Move } from 'lucide-react';
import {
  IMAGE_SPECS,
  ImageSpec,
  validateImageFile,
  processAndOptimizeImage,
  OptimizationResult,
  CropArea,
} from '@/lib/image-processor';

import { uploadFiles } from '@/lib/uploadthing';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelected: (url: string) => void;
  specType?: 'logo' | 'product' | 'square' | 'portrait' | 'landscape' | 'banner';
  title?: string;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onImageSelected,
  specType = 'product',
  title,
}) => {
  const spec: ImageSpec = IMAGE_SPECS[specType] || IMAGE_SPECS.product;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState<string>('');
  const [cropRatio, setCropRatio] = useState<'1:1' | '4:5' | '16:9' | 'free'>('1:1');
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  
  // Crop canvas states
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (specType === 'portrait') setCropRatio('4:5');
    else if (specType === 'landscape' || specType === 'banner') setCropRatio('16:9');
    else setCropRatio('1:1');
  }, [specType]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setOptimizationResult(null);

    const validation = validateImageFile(file, spec);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'ไฟล์ไม่ถูกต้อง');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewSrc(reader.result as string);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleProcessAndCrop = async () => {
    if (!previewSrc || !selectedFile) return;

    setIsProcessing(true);
    setStatusText('กำลังปรับแต่งและบีบอัดรูปภาพ...');
    try {
      // Calculate crop from drag/zoom position
      let targetRatioValue = 1;
      if (cropRatio === '4:5') targetRatioValue = 4 / 5;
      if (cropRatio === '16:9') targetRatioValue = 16 / 9;

      const dynamicSpec = {
        ...spec,
        aspectRatio: targetRatioValue,
      };

      const result = await processAndOptimizeImage(selectedFile, dynamicSpec);
      setOptimizationResult(result);

      // Convert blob to File for UploadThing
      setStatusText('กำลังอัปโหลดขึ้น Cloud CDN...');
      let finalUrl = result.dataUrl;

      try {
        const fileToUpload = new File(
          [result.blob],
          `${specType}_${Date.now()}.webp`,
          { type: 'image/webp' }
        );

        const uploadRes = await uploadFiles('imageUploader', {
          files: [fileToUpload],
        });

        if (uploadRes && uploadRes[0]?.url) {
          finalUrl = uploadRes[0].url;
        }
      } catch (uploadErr) {
        console.warn('UploadThing upload failed, using optimized local dataUrl fallback:', uploadErr);
      }

      onImageSelected(finalUrl);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMessage('เกิดข้อผิดพลาดในการปรับแต่งรูปภาพ');
    } finally {
      setIsProcessing(false);
      setStatusText('');
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setPreviewSrc(null);
    setErrorMessage(null);
    setOptimizationResult(null);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-soft/50">
          <div>
            <h3 className="text-lg font-semibold text-dark-primary font-display">
              {title || `อัปโหลด ${spec.name}`}
            </h3>
            <p className="text-xs text-dark-secondary">{spec.description}</p>
          </div>
          <button
            onClick={resetModal}
            className="p-2 rounded-full hover:bg-zinc-100 text-dark-muted hover:text-dark-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {errorMessage && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">ไม่สามารถอัปโหลดรูปภาพได้</p>
                <p className="mt-0.5 text-xs text-red-600">{errorMessage}</p>
              </div>
            </div>
          )}

          {!previewSrc ? (
            /* Upload Dropzone */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-200 hover:border-primary-500 hover:bg-orange-50/20 rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 group flex flex-col items-center justify-center gap-3"
            >
              <div className="w-16 h-16 rounded-full bg-orange-50 group-hover:bg-orange-100 text-primary-500 flex items-center justify-center transition-colors">
                <Upload className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-dark-primary">
                  คลิกเพื่ออัปโหลดรูปภาพ หรือลากไฟล์มาวางที่นี่
                </p>
                <p className="text-xs text-dark-secondary">
                  รองรับไฟล์ JPG, PNG หรือ WebP (ขนาดไม่เกิน 10 MB)
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 rounded-full text-xs text-dark-secondary font-medium">
                <Sparkles className="w-3.5 h-3.5 text-primary-500" />
                <span>ระบบจะปรับขนาดและบีบอัดภาพให้อัตโนมัติ (เป้าหมาย ≤ {spec.targetMaxCompressedSizeKB >= 1024 ? (spec.targetMaxCompressedSizeKB / 1024).toFixed(1) + ' MB' : spec.targetMaxCompressedSizeKB + ' KB'})</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            /* Crop & Adjustment Interface */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-dark-secondary">สัดส่วน Crop:</span>
                  {(['1:1', '4:5', '16:9'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setCropRatio(ratio)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        cropRatio === ratio
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-zinc-100 text-dark-secondary hover:bg-zinc-200'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewSrc(null);
                    setSelectedFile(null);
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  เลือกรูปใหม่
                </button>
              </div>

              {/* Crop Canvas Preview Container */}
              <div
                className="relative w-full h-64 bg-zinc-950 rounded-xl overflow-hidden flex items-center justify-center select-none cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  ref={imageRef}
                  src={previewSrc}
                  alt="Crop preview"
                  className="max-h-full max-w-full object-contain pointer-events-none transition-transform duration-75"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  }}
                />

                {/* Ratio overlay guideline box */}
                <div
                  className={`pointer-events-none absolute border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] rounded-lg transition-all ${
                    cropRatio === '1:1'
                      ? 'w-48 h-48'
                      : cropRatio === '4:5'
                      ? 'w-40 h-52'
                      : 'w-64 h-36'
                  }`}
                />

                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] text-white flex items-center gap-1.5 pointer-events-none">
                  <Move className="w-3 h-3 text-orange-400" />
                  <span>ลากเพื่อจัดตำแหน่งกึ่งกลาง</span>
                </div>
              </div>

              {/* Zoom & Details controls */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-dark-secondary">
                  <ZoomOut className="w-4 h-4" />
                  <input
                    type="range"
                    min="0.8"
                    max="2.5"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-32 accent-primary-500 cursor-pointer"
                  />
                  <ZoomIn className="w-4 h-4" />
                </div>
                {selectedFile && (
                  <span className="text-xs text-dark-muted">
                    ไฟล์ต้นฉบับ: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-soft/50">
          <button
            type="button"
            onClick={resetModal}
            className="px-4 py-2 text-sm font-medium text-dark-secondary hover:text-dark-primary hover:bg-zinc-100 rounded-xl transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            disabled={!previewSrc || isProcessing}
            onClick={handleProcessAndCrop}
            className="px-5 py-2 text-sm font-medium bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{statusText || 'กำลังประมวลผล...'}</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Crop & ใช้งานรูปภาพ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
