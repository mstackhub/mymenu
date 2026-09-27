'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  UtensilsCrossed,
  Layers,
  Store as StoreIcon,
  QrCode,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Plus,
  CheckCircle2,
  Clock,
  Eye,
  TrendingUp,
} from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { PublishModal } from '@/components/ui/PublishModal';

export default function AdminDashboardPage() {
  const { store, products, categories, publishedMenu, draftMenu } = useStore();
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const activeProducts = products.filter((p) => p.status === 'active');

  return (
    <>
      <div className="p-6 sm:p-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-border shadow-xs">
          <div className="flex items-center gap-4">
            <img
              src={store.logo_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&fit=crop'}
              alt={store.name}
              className="w-16 h-16 rounded-2xl object-cover border border-border"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-dark-primary font-display">
                  {store.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                  {store.status === 'active' ? 'เปิดบริการ' : 'ปิดชั่วคราว'}
                </span>
              </div>
              <p className="text-xs text-dark-secondary mt-1 max-w-lg truncate">
                {store.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`/m/${store.slug}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2"
              title="เปิดดูหน้าเว็บไซต์เมนูจริง"
            >
              <ExternalLink className="w-4 h-4 text-orange-400" />
              <span>ดูหน้าเว็บร้าน (Live)</span>
            </a>
            <button
              onClick={() => setIsPublishModalOpen(true)}
              className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-dark-primary text-xs font-semibold rounded-xl transition-colors flex items-center gap-2"
            >
              <QrCode className="w-4 h-4 text-primary-500" />
              <span>ดู QR Code</span>
            </button>
            <Link
              href="/admin/builder"
              className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>เปิด Menu Builder</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-dark-secondary">สถานะเมนูออนไลน์</span>
              <span className="p-2 rounded-xl bg-orange-50 text-primary-500">
                <UtensilsCrossed className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-xl font-bold text-dark-primary font-display capitalize">
                {publishedMenu.status}
              </span>
              <p className="text-[11px] text-dark-muted mt-0.5">
                {draftMenu.sections?.length || 0} Sections ในระบบ
              </p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-dark-secondary">รายการอาหารทั้งหมด</span>
              <span className="p-2 rounded-xl bg-blue-50 text-blue-500">
                <Layers className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-dark-primary font-display">
                {products.length}
              </span>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                เปิดแสดง {activeProducts.length} รายการ
              </p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-dark-secondary">หมวดหมู่อาหาร</span>
              <span className="p-2 rounded-xl bg-purple-50 text-purple-500">
                <Layers className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-dark-primary font-display">
                {categories.length}
              </span>
              <p className="text-[11px] text-dark-muted mt-0.5">
                หมวดหมู่ที่จัดเรียงไว้
              </p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-border shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-dark-secondary">Public Slug</span>
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-500">
                <StoreIcon className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-sm font-bold font-mono text-dark-primary truncate block">
                /m/{store.slug}
              </span>
              <a
                href={`/m/${store.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-primary-500 font-medium hover:underline inline-flex items-center gap-1 mt-0.5"
              >
                <span>เปิดดูเมนูลูกค้า</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Product Preview List */}
        <div className="bg-white rounded-3xl border border-border shadow-xs overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-dark-primary font-display">
                รายการอาหารล่าสุด
              </h3>
              <p className="text-xs text-dark-secondary">
                จัดการรายการอาหาร ราคา และตัวเลือกพิเศษ (Option Groups)
              </p>
            </div>
            <Link
              href="/admin/products"
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-dark-primary text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <span>ดูทั้งหมด ({products.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border/60">
            {products.slice(0, 5).map((prod) => (
              <div key={prod.id} className="p-4 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                <div className="flex items-center gap-3.5">
                  <img
                    src={prod.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&fit=crop'}
                    alt={prod.name}
                    className="w-12 h-12 rounded-xl object-cover border border-border"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-dark-primary">{prod.name}</h4>
                    <p className="text-[11px] text-dark-secondary">
                      {categories.find((c) => c.id === prod.category_id)?.name || 'ทั่วไป'}
                      {prod.option_groups && prod.option_groups.length > 0 && ` • ${prod.option_groups.length} กลุ่มตัวเลือก`}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-baseline gap-2 justify-end">
                    <span className="text-xs font-bold text-dark-primary">฿{prod.sale_price}</span>
                    {prod.regular_price && (
                      <span className="text-[11px] text-dark-muted line-through">฿{prod.regular_price}</span>
                    )}
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.2 rounded-full inline-block mt-0.5 ${
                    prod.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-dark-muted'
                  }`}>
                    {prod.status === 'active' ? 'เปิดขาย' : 'ซ่อนไว้'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        store={store}
      />
    </>
  );
}
