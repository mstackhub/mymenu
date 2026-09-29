'use client';

import React, { useState, useEffect } from 'react';
import { ElementsSidebar } from '@/components/builder/ElementsSidebar';
import { PreviewCenter } from '@/components/builder/PreviewCenter';
import { PropertiesPanel } from '@/components/builder/PropertiesPanel';
import { useStore } from '@/lib/store-context';
import { PublishModal } from '@/components/ui/PublishModal';
import {
  Eye,
  PlusCircle,
  SlidersHorizontal,
  Smartphone,
  Tablet,
  Monitor,
  ExternalLink,
  Save,
  Check,
  Send,
  Layers,
} from 'lucide-react';

export default function MenuBuilderPage() {
  const { store, draftMenu, selectedSectionId, saveDraftMenu, publishMenu } = useStore();

  const [deviceMode, setDeviceMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [mobileTab, setMobileTab] = useState<'preview' | 'elements' | 'properties'>('preview');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // If user selects a section in elements or preview, automatically open properties on mobile
  useEffect(() => {
    if (selectedSectionId && (mobileTab === 'elements' || mobileTab === 'preview')) {
      setMobileTab('properties');
    }
  }, [selectedSectionId]);

  const handleSaveDraft = () => {
    saveDraftMenu();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handlePublish = () => {
    publishMenu();
    setIsPublishModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden relative bg-zinc-100/60 font-sans">
      {/* 🌟 FULL-WIDTH STUDIO TOP CONTROL BAR (Never squished or hidden behind scroll) */}
      <header className="h-14 bg-white border-b border-border px-3 sm:px-5 flex items-center justify-between z-30 flex-shrink-0 w-full gap-2 select-none shadow-2xs">
        {/* Left: Studio Name & Live Status */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-bold text-dark-primary font-display tracking-tight">
              Menu Builder
            </span>
          </div>

          <span
            className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5 whitespace-nowrap ${
              draftMenu.status === 'published'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                draftMenu.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span className="hidden xs:inline">
              {draftMenu.status === 'published' ? 'Published' : 'Drafting'}
            </span>
          </span>
        </div>

        {/* Center: Device Viewport Switcher (Visible on desktop & tablet screens) */}
        <div className="hidden sm:flex items-center gap-0.5 bg-zinc-100 p-1 rounded-xl border border-border flex-shrink-0">
          <button
            type="button"
            onClick={() => setDeviceMode('mobile')}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
              deviceMode === 'mobile'
                ? 'bg-white text-primary-600 shadow-xs font-bold'
                : 'text-dark-secondary hover:text-dark-primary'
            }`}
            title="Mobile View (390px)"
          >
            <Smartphone className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Mobile</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('tablet')}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
              deviceMode === 'tablet'
                ? 'bg-white text-primary-600 shadow-xs font-bold'
                : 'text-dark-secondary hover:text-dark-primary'
            }`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('desktop')}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
              deviceMode === 'desktop'
                ? 'bg-white text-primary-600 shadow-xs font-bold'
                : 'text-dark-secondary hover:text-dark-primary'
            }`}
            title="Desktop View (1200px)"
          >
            <Monitor className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Desktop</span>
          </button>
        </div>

        {/* Right: PRIMARY ACTIONS — Prominently displayed without any sliding/hiding */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <a
            href={`/m/${store.slug}`}
            target="_blank"
            rel="noreferrer"
            className="px-2.5 sm:px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
            title="เปิดดูหน้าเว็บไซต์เมนูจริงของลูกค้า (New Tab)"
          >
            <ExternalLink className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
            <span className="hidden md:inline">ดูหน้าเว็บจริง</span>
            <span className="md:hidden">ดูเว็บ</span>
          </a>

          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-2.5 sm:px-3.5 py-1.5 bg-white border border-border hover:bg-zinc-50 text-dark-primary text-xs font-medium rounded-xl transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
          >
            {saveToast ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span className="text-emerald-600 font-bold">Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-dark-secondary flex-shrink-0" />
                <span className="hidden md:inline">บันทึก Draft</span>
                <span className="md:hidden">Draft</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePublish}
            className="px-3 sm:px-4 py-1.5 bg-gradient-to-r from-primary-500 to-orange-600 hover:from-primary-600 hover:to-orange-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Publish เมนู</span>
            <span className="sm:hidden">Publish</span>
          </button>
        </div>
      </header>

      {/* Mobile & Tablet Mode Tab Bar (Visible on < lg) */}
      <div className="lg:hidden flex items-center justify-around bg-white border-b border-border p-1.5 z-20 flex-shrink-0 shadow-2xs gap-1.5">
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'preview'
              ? 'bg-primary-500 text-white shadow-xs'
              : 'text-dark-secondary hover:bg-zinc-100 hover:text-dark-primary'
          }`}
        >
          <Eye className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">Preview จัดหน้า</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('elements')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'elements'
              ? 'bg-primary-500 text-white shadow-xs'
              : 'text-dark-secondary hover:bg-zinc-100 hover:text-dark-primary'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">เพิ่ม Elements</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('properties')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'properties'
              ? 'bg-primary-500 text-white shadow-xs'
              : 'text-dark-secondary hover:bg-zinc-100 hover:text-dark-primary'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">ปรับแต่ง Style</span>
        </button>
      </div>

      {/* Main Studio 3-Column Body */}
      <div className="flex-1 flex flex-col lg:flex-row h-full w-full overflow-hidden min-h-0">
        {/* Left Column: Elements Palette & Drag-and-Drop Sections */}
        <div
          className={`h-full ${
            mobileTab === 'elements' ? 'flex-1 flex w-full' : 'hidden'
          } lg:flex lg:w-64 xl:w-72 flex-shrink-0`}
        >
          <ElementsSidebar />
        </div>

        {/* Center Column: Live Menu Preview Canvas */}
        <div
          className={`h-full ${
            mobileTab === 'preview' ? 'flex-1 flex w-full' : 'hidden'
          } lg:flex lg:flex-1 min-w-0`}
        >
          <PreviewCenter deviceMode={deviceMode} hideHeader={true} />
        </div>

        {/* Right Column: Properties & Styling Controls Panel */}
        <div
          className={`h-full ${
            mobileTab === 'properties' ? 'flex-1 flex w-full' : 'hidden'
          } lg:flex lg:w-72 xl:w-80 flex-shrink-0`}
        >
          <PropertiesPanel />
        </div>
      </div>

      {/* Publish Modal */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        store={store}
      />
    </div>
  );
}
