'use client';

import React, { useState, useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { X, Check, Copy, ExternalLink, Download, QrCode, Sparkles } from 'lucide-react';
import { Store } from '@/types';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store;
}

export const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose, store }) => {
  const [copied, setCopied] = useState(false);
  const qrCanvasRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Compute public menu URL
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const publicUrl = `${origin}/m/${store.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQR = () => {
    const canvas = qrCanvasRef.current?.querySelector('canvas');
    if (!canvas) return;

    // Create a high resolution styled QR code download canvas
    const downloadCanvas = document.createElement('canvas');
    const dpr = 2;
    const padding = 32 * dpr;
    const qrSize = canvas.width * dpr;
    const headerHeight = 60 * dpr;
    const footerHeight = 40 * dpr;

    downloadCanvas.width = qrSize + padding * 2;
    downloadCanvas.height = qrSize + headerHeight + footerHeight + padding * 2;

    const ctx = downloadCanvas.getContext('2d');
    if (!ctx) return;

    // Fill background
    ctx.fillStyle = '#FFFFFF';
    ctx.roundRect ? ctx.roundRect(0, 0, downloadCanvas.width, downloadCanvas.height, 24 * dpr) : ctx.rect(0, 0, downloadCanvas.width, downloadCanvas.height);
    ctx.fill();

    // Store Title
    ctx.fillStyle = '#18181B';
    ctx.font = `bold ${18 * dpr}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(store.name, downloadCanvas.width / 2, padding + 28 * dpr);

    // Subtitle
    ctx.fillStyle = '#71717A';
    ctx.font = `${12 * dpr}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('สแกนเพื่อดูเมนูอาหารออนไลน์', downloadCanvas.width / 2, padding + 50 * dpr);

    // Draw QR
    ctx.drawImage(canvas, padding, headerHeight + padding, qrSize, qrSize);

    // Footer link
    ctx.fillStyle = '#A1A1AA';
    ctx.font = `${11 * dpr}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText(`/${store.slug}`, downloadCanvas.width / 2, downloadCanvas.height - padding / 2);

    // Trigger download
    const link = document.createElement('a');
    link.download = `menu-qr-${store.slug}.png`;
    link.href = downloadCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-border flex flex-col">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 text-center bg-gradient-to-b from-orange-50/70 to-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-100 text-dark-muted hover:text-dark-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-3 shadow-sm">
            <Check className="w-7 h-7 stroke-[2.5]" />
          </div>

          <h3 className="text-xl font-bold text-dark-primary font-display">
            Menu Published ✓
          </h3>
          <p className="text-xs text-dark-secondary mt-1">
            เมนูออนไลน์ของร้านคุณพร้อมให้บริการแล้ว สามารถส่งลิงก์หรือพิมพ์ QR Code ใช้งานได้ทันที
          </p>
        </div>

        {/* QR Code display */}
        <div className="px-6 py-4 flex flex-col items-center justify-center">
          <div
            ref={qrCanvasRef}
            className="p-4 bg-white rounded-2xl border-2 border-border shadow-md flex flex-col items-center justify-center relative group"
          >
            <QRCodeCanvas
              value={publicUrl}
              size={180}
              level="H"
              includeMargin={true}
            />
            <div className="mt-2 text-center">
              <span className="text-xs font-semibold text-dark-primary tracking-tight">
                {store.name}
              </span>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleDownloadQR}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-dark-primary rounded-xl text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด QR Code (PNG)</span>
            </button>
          </div>
        </div>

        {/* Link Box */}
        <div className="px-6 pb-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-dark-secondary">Public Menu URL</label>
            <div className="flex items-center gap-2 p-2 bg-zinc-50 border border-border rounded-xl">
              <span className="text-xs text-dark-primary font-mono truncate flex-1 px-1">
                {publicUrl}
              </span>
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white hover:bg-zinc-100 text-dark-primary border border-border shadow-xs'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>คัดลอกแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium text-sm rounded-xl shadow-sm transition-all"
            >
              <span>เปิดดูหน้าเมนูจริง</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-dark-secondary hover:text-dark-primary font-medium text-sm rounded-xl transition-colors"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
