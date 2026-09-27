'use client';

import React from 'react';
import Link from 'next/link';
import {
  UtensilsCrossed,
  Sparkles,
  QrCode,
  Smartphone,
  Layers,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Move,
} from 'lucide-react';
import { useStore } from '@/lib/store-context';

export default function HomePage() {
  const { store } = useStore();

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-white/90 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
              M
            </div>
            <span className="font-bold text-xl tracking-tight font-display text-dark-primary">
              MyMenu
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/m/${store.slug}`}
              target="_blank"
              className="px-4 py-2 text-xs font-semibold text-dark-secondary hover:text-dark-primary hover:bg-zinc-100 rounded-xl transition-colors"
            >
              ดูตัวอย่างเมนูจริง (Demo)
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>ระบบจัดการหลังบ้าน</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/60 text-primary-600 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ระบบสร้างเมนูออนไลน์สำหรับร้านอาหารยุคใหม่</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-dark-primary tracking-tight font-display leading-[1.15]">
          สร้างเมนูออนไลน์ สแกนสั่งง่าย <br />
          <span className="text-primary-500">ด้วย Drag & Drop Builder</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-dark-secondary max-w-2xl mx-auto leading-relaxed">
          เพิ่มรายการอาหาร ปรับแต่งสไตล์อิสระ พร้อมระบบบีบอัดรูปภาพและสร้าง QR Code ให้ลูกค้าสแกนดูผ่านมือถือได้ทันที โดยไม่ต้องเขียนโค้ด
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/admin/builder"
            className="px-6 py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm rounded-2xl shadow-md transition-all flex items-center gap-2"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>เข้าสู่ Menu Builder</span>
          </Link>
          <Link
            href={`/m/${store.slug}`}
            className="px-6 py-3.5 bg-white border border-border hover:bg-zinc-50 text-dark-primary font-semibold text-sm rounded-2xl shadow-xs transition-all flex items-center gap-2"
          >
            <QrCode className="w-4 h-4 text-primary-500" />
            <span>ทดลองสแกน / เปิดเมนูลูกค้า</span>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-3xl bg-soft border border-border hover:border-zinc-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-primary-600 flex items-center justify-center mb-4">
              <Move className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-dark-primary font-display">
              Drag & Drop Page Builder
            </h3>
            <p className="text-xs text-dark-secondary mt-2 leading-relaxed">
              จัดลำดับ Section เมนูได้อย่างอิสระ ทั้ง Logo, ชื่อร้าน, แบนเนอร์, ข้อความ และรายการอาหาร พร้อม Live Preview ทันที
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-soft border border-border hover:border-zinc-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-dark-primary font-display">
              Auto Image Resize & Crop
            </h3>
            <p className="text-xs text-dark-secondary mt-2 leading-relaxed">
              รองรับ Crop สัดส่วน 1:1, 4:5, 16:9 และบีบอัดเป็น WebP ความละเอียดสูงแต่โหลดเร็ว ไม่เปลืองเน็ตลูกค้า
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-soft border border-border hover:border-zinc-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-dark-primary font-display">
              QR Code & Public Menu URL
            </h3>
            <p className="text-xs text-dark-secondary mt-2 leading-relaxed">
              Publish ปุ๊บ สร้าง QR Code และ Public URL ให้ทันที ดาวน์โหลดนำไปตั้งโต๊ะหรือแชร์ในโซเชียลได้ทันใจ
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border py-6 text-center text-xs text-dark-muted">
        © 2026 MyMenu — Online Menu Builder. Built for modern food businesses.
      </footer>
    </div>
  );
}
