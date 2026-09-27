'use client';

import React, { useState, useEffect } from 'react';
import { ElementsSidebar } from '@/components/builder/ElementsSidebar';
import { PreviewCenter } from '@/components/builder/PreviewCenter';
import { PropertiesPanel } from '@/components/builder/PropertiesPanel';
import { useStore } from '@/lib/store-context';
import { Eye, PlusCircle, SlidersHorizontal } from 'lucide-react';

export default function MenuBuilderPage() {
  const { selectedSectionId } = useStore();
  const [mobileTab, setMobileTab] = useState<'preview' | 'elements' | 'properties'>('preview');

  // If user selects a section, focus properties tab on mobile
  useEffect(() => {
    if (selectedSectionId && mobileTab === 'elements') {
      setMobileTab('properties');
    }
  }, [selectedSectionId]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full w-full overflow-hidden relative">
      {/* Mobile / Tablet Tab Bar (Hidden on desktop lg:) */}
      <div className="lg:hidden flex items-center justify-around bg-white border-b border-border p-1.5 z-30 flex-shrink-0 shadow-2xs gap-1.5">
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
          <span className="truncate">Preview เมนู</span>
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

      {/* Left Column: Elements & Drag-and-Drop Sections */}
      <div
        className={`h-full ${
          mobileTab === 'elements' ? 'flex-1 flex w-full' : 'hidden'
        } lg:flex lg:w-64 xl:w-72 flex-shrink-0`}
      >
        <ElementsSidebar />
      </div>

      {/* Center Column: Live Menu Preview Canvas & Viewport Switchers */}
      <div
        className={`h-full ${
          mobileTab === 'preview' ? 'flex-1 flex w-full' : 'hidden'
        } lg:flex lg:flex-1 min-w-0`}
      >
        <PreviewCenter />
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
  );
}
