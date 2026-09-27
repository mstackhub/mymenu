'use client';

import React, { useState, useEffect } from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Maximize2,
  Sliders,
  Image as ImageIcon,
  Utensils,
  Link2,
  Unlink2,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  Monitor,
  Smartphone,
} from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { MenuSection, SectionStyles, SectionType } from '@/types';
import { ImageUploadModal } from '@/components/ui/ImageUploadModal';
import { FoodSelectModal } from '@/components/builder/FoodSelectModal';
import { ThemeSettingsPanel } from '@/components/builder/ThemeSettingsPanel';
import { Palette, SlidersHorizontal } from 'lucide-react';
import { AVAILABLE_FONTS } from '@/lib/fonts';

const PRESET_COLORS = [
  '#18181B', // Dark Primary
  '#3F3F46', // Dark Slate
  '#71717A', // Muted Gray
  '#FF5A36', // Primary Orange
  '#E11D48', // Red Rose
  '#059669', // Emerald Green
  '#0284C7', // Sky Blue
  '#D97706', // Amber Gold
  '#FFFFFF', // White
];

export const PropertiesPanel: React.FC = () => {
  const {
    draftMenu,
    selectedSectionId,
    setSelectedSectionId,
    updateSectionStyles,
    updateSectionContent,
    products,
    categories,
    store,
    deleteSection,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'element' | 'theme'>('element');
  const [typoDeviceTab, setTypoDeviceTab] = useState<'desktop' | 'mobile'>('desktop');
  const [isLinkMargin, setIsLinkMargin] = useState(false);
  const [isLinkPadding, setIsLinkPadding] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isFoodSelectOpen, setIsFoodSelectOpen] = useState(false);

  useEffect(() => {
    if (selectedSectionId) {
      setActiveTab('element');
    }
  }, [selectedSectionId]);

  const selectedSection = draftMenu.sections?.find(
    (s) => s.id === selectedSectionId
  );

  const currentTab = !selectedSection ? 'theme' : activeTab;

  const { styles = {}, content = {}, type } = selectedSection || { styles: {}, content: {}, type: 'store_name' as SectionType };

  const handleStyleChange = (key: keyof SectionStyles, value: any) => {
    if (!selectedSection) return;
    updateSectionStyles(selectedSection.id, { [key]: value });
  };

  const handleContentChange = (contentUpdates: any) => {
    if (!selectedSection) return;
    updateSectionContent(selectedSection.id, contentUpdates);
  };

  const handleMarginChange = (side: 'top' | 'right' | 'bottom' | 'left', val: number) => {
    if (!selectedSection) return;
    const current = styles.margin || { top: 0, right: 0, bottom: 0, left: 0 };
    if (isLinkMargin) {
      updateSectionStyles(selectedSection.id, {
        margin: { top: val, right: val, bottom: val, left: val },
      });
    } else {
      updateSectionStyles(selectedSection.id, {
        margin: { ...current, [side]: val },
      });
    }
  };

  const handlePaddingChange = (side: 'top' | 'right' | 'bottom' | 'left', val: number) => {
    if (!selectedSection) return;
    const current = styles.padding || { top: 0, right: 0, bottom: 0, left: 0 };
    if (isLinkPadding) {
      updateSectionStyles(selectedSection.id, {
        padding: { top: val, right: val, bottom: val, left: val },
      });
    } else {
      updateSectionStyles(selectedSection.id, {
        padding: { ...current, [side]: val },
      });
    }
  };

  return (
    <div className="w-full h-full flex-shrink-0 bg-white border-l border-border flex flex-col overflow-hidden text-xs select-none">
      {/* Top Main Mode Tab Switcher */}
      <div className="p-2 border-b border-border bg-zinc-50 flex-shrink-0 flex items-center gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('element')}
          disabled={!selectedSection}
          className={`flex-1 py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all text-[11px] ${
            currentTab === 'element'
              ? 'bg-white text-primary-600 shadow-2xs border border-border/80'
              : !selectedSection
              ? 'opacity-40 text-dark-muted cursor-not-allowed'
              : 'text-dark-secondary hover:text-dark-primary'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Element {selectedSection ? `(${selectedSection.type.replace('_', ' ')})` : ''}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('theme')}
          className={`flex-1 py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all text-[11px] ${
            currentTab === 'theme'
              ? 'bg-white text-primary-600 shadow-2xs border border-border/80'
              : 'text-dark-secondary hover:text-dark-primary'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>ธีม & พื้นหลัง</span>
        </button>
      </div>

      {/* RENDER THEME SETTINGS TAB */}
      {currentTab === 'theme' ? (
        <div className="flex-1 p-4 overflow-y-auto">
          <ThemeSettingsPanel />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="p-3 border-b border-border flex items-center justify-between bg-soft/30 flex-shrink-0">
            <div>
              <span className="font-bold text-dark-primary uppercase tracking-wider font-display block text-[11px]">
                Properties & Style
              </span>
              <span className="text-[10px] text-dark-secondary capitalize">
                Element: {type.replace('_', ' ')}
              </span>
            </div>
            {selectedSection && (
              <button
                onClick={() => deleteSection(selectedSection.id)}
                className="p-1.5 rounded-lg text-dark-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                title="ลบ Section นี้"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

      {/* Settings scrollable area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-6">
        {/* ELEMENT SPECIFIC CONTENT SETTINGS */}
        <div className="space-y-3 pb-4 border-b border-border">
          <label className="font-bold text-dark-primary uppercase tracking-wider text-[11px] block">
            Content
          </label>

          {/* STORE NAME */}
          {type === 'store_name' && (
            <div className="space-y-1.5">
              <label className="text-dark-secondary">ข้อความชื่อร้าน (เว้นว่างใช้จากร้าน)</label>
              <input
                type="text"
                placeholder={store.name}
                value={content.text || ''}
                onChange={(e) =>
                  handleContentChange({ text: e.target.value })
                }
                className="w-full px-3 py-2 bg-zinc-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500"
              />
            </div>
          )}

          {/* LOGO */}
          {type === 'logo' && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <img
                  src={content.url || store.logo_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&fit=crop'}
                  alt="Logo preview"
                  className="w-14 h-14 rounded-xl object-cover border border-border"
                />
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(true)}
                  className="flex-1 py-2 px-3 bg-zinc-100 hover:bg-zinc-200 text-dark-primary font-medium rounded-xl text-center transition-colors"
                >
                  เปลี่ยนรูป Logo
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-dark-secondary">
                  <span>ขนาด Logo (Width)</span>
                  <span>{styles.width || 80}px</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="220"
                  value={typeof styles.width === 'number' ? styles.width : 80}
                  onChange={(e) => handleStyleChange('width', parseInt(e.target.value))}
                  className="w-full accent-primary-500 cursor-pointer"
                />
              </div>

              {/* Alignment */}
              <div className="space-y-1.5 pt-1">
                <label className="text-dark-secondary">การจัดวางตำแหน่ง (Alignment)</label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'left', label: 'ชิดซ้าย', icon: AlignLeft },
                    { id: 'center', label: 'กึ่งกลาง', icon: AlignCenter },
                    { id: 'right', label: 'ชิดขวา', icon: AlignRight },
                  ].map((align) => {
                    const Icon = align.icon;
                    const isSelected = (styles.alignment || 'center') === align.id;
                    return (
                      <button
                        key={align.id}
                        type="button"
                        onClick={() => handleStyleChange('alignment', align.id)}
                        className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 font-medium transition-all ${
                          isSelected
                            ? 'bg-primary-500 text-white shadow-2xs'
                            : 'bg-zinc-100 text-dark-secondary hover:bg-zinc-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{align.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* DESCRIPTION */}
          {type === 'description' && (
            <div className="space-y-1.5">
              <label className="text-dark-secondary">คำอธิบายร้าน (เว้นว่างใช้จากข้อมูลร้าน)</label>
              <textarea
                rows={3}
                placeholder={store.description}
                value={content.text || ''}
                onChange={(e) =>
                  handleContentChange({ text: e.target.value })
                }
                className="w-full p-2.5 bg-zinc-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500"
              />
            </div>
          )}

          {/* IMAGE */}
          {type === 'image' && (
            <div className="space-y-3">
              <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-zinc-100 group">
                <img
                  src={content.url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&fit=crop'}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(true)}
                  className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-medium"
                >
                  <ImageIcon className="w-4 h-4 mr-1.5" />
                  เปลี่ยนรูปภาพ / Crop
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-dark-secondary">สัดส่วนภาพ (Aspect Ratio)</label>
                <div className="grid grid-cols-4 gap-1">
                  {(['original', '1:1', '4:5', '16:9'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => handleStyleChange('aspectRatio', ratio)}
                      className={`py-1.5 rounded-lg font-medium transition-colors ${
                        (styles.aspectRatio || '16:9') === ratio
                          ? 'bg-primary-500 text-white'
                          : 'bg-zinc-100 text-dark-secondary hover:bg-zinc-200'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-dark-secondary block mb-1">Object Fit</label>
                  <select
                    value={styles.objectFit || 'cover'}
                    onChange={(e) => handleStyleChange('objectFit', e.target.value)}
                    className="w-full p-2 bg-zinc-50 border border-border rounded-xl focus:outline-none"
                  >
                    <option value="cover">Cover (เต็มกรอบ)</option>
                    <option value="contain">Contain (พอดีภาพ)</option>
                  </select>
                </div>
                <div>
                  <label className="text-dark-secondary block mb-1">Border Radius</label>
                  <input
                    type="number"
                    value={styles.borderRadius ?? 12}
                    onChange={(e) => handleStyleChange('borderRadius', parseInt(e.target.value) || 0)}
                    className="w-full p-2 bg-zinc-50 border border-border rounded-xl focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TEXT */}
          {type === 'text' && (
            <div className="space-y-1.5">
              <label className="text-dark-secondary">ข้อความ</label>
              <textarea
                rows={3}
                value={content.text || ''}
                onChange={(e) =>
                  handleContentChange({ text: e.target.value })
                }
                className="w-full p-2.5 bg-zinc-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500"
              />
            </div>
          )}

          {/* FOOD LIST */}
          {type === 'product_list' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-dark-secondary">โหมดการดึงรายการอาหาร (Product Source)</label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      handleContentChange({ selectionMode: 'auto' })
                    }
                    className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all ${
                      (!content.selectionMode || content.selectionMode === 'auto')
                        ? 'bg-primary-500 text-white'
                        : 'bg-zinc-100 text-dark-secondary hover:bg-zinc-200'
                    }`}
                  >
                    อัตโนมัติทั้งหมด
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleContentChange({ selectionMode: 'category', categoryId: content.categoryId || (categories[0]?.id || '') })
                    }
                    className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all ${
                      content.selectionMode === 'category'
                        ? 'bg-primary-500 text-white'
                        : 'bg-zinc-100 text-dark-secondary hover:bg-zinc-200'
                    }`}
                  >
                    ตามหมวดหมู่
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleContentChange({ selectionMode: 'manual' })
                    }
                    className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all ${
                      content.selectionMode === 'manual'
                        ? 'bg-primary-500 text-white'
                        : 'bg-zinc-100 text-dark-secondary hover:bg-zinc-200'
                    }`}
                  >
                    เลือกเอง
                  </button>
                </div>
              </div>

              {content.selectionMode === 'category' && (
                <div className="space-y-1.5">
                  <label className="text-dark-secondary">เลือกหมวดหมู่ที่ต้องการแสดง</label>
                  <select
                    value={content.categoryId || ''}
                    onChange={(e) =>
                      handleContentChange({ categoryId: e.target.value })
                    }
                    className="w-full p-2 bg-zinc-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {content.selectionMode === 'manual' && (
                <button
                  type="button"
                  onClick={() => setIsFoodSelectOpen(true)}
                  className="w-full py-2.5 px-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl text-center shadow-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Utensils className="w-4 h-4" />
                  <span>เลือกรายการอาหาร ({(content.productIds || []).length} เมนู)</span>
                </button>
              )}

              {(!content.selectionMode || content.selectionMode === 'auto') && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800">
                  ✨ <strong>โหมดอัตโนมัติ:</strong> เมื่อเพิ่ม/แก้ไขเมนูในแท็บ "รายการอาหาร" ระบบจะอัปเดตแสดงในเมนูนี้ทันที
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-dark-secondary">รูปแบบการแสดงผล (Display Style)</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleContentChange({ display: 'image-text-price' })
                    }
                    className={`p-2 rounded-xl text-left border transition-all ${
                      (content.display || 'image-text-price') === 'image-text-price'
                        ? 'border-primary-500 bg-orange-50/60 font-semibold text-primary-700'
                        : 'border-border bg-white text-dark-secondary hover:bg-zinc-50'
                    }`}
                  >
                    <div className="font-medium">รูปภาพ + รายการ</div>
                    <div className="text-[10px] text-dark-muted">Image + Text + Price</div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleContentChange({ display: 'text-price' })
                    }
                    className={`p-2 rounded-xl text-left border transition-all ${
                      content.display === 'text-price'
                        ? 'border-primary-500 bg-orange-50/60 font-semibold text-primary-700'
                        : 'border-border bg-white text-dark-secondary hover:bg-zinc-50'
                    }`}
                  >
                    <div className="font-medium">รายการอย่างเดียว</div>
                    <div className="text-[10px] text-dark-muted">Text + Price (Clean)</div>
                  </button>
                </div>
              </div>

              {(content.display || 'image-text-price') === 'image-text-price' && (
                <div className="space-y-1.5">
                  <label className="text-dark-secondary">สัดส่วนรูปอาหาร</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['1:1', '4:5', '16:9'] as const).map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => handleStyleChange('imageRatio', ratio)}
                        className={`py-1.5 rounded-lg font-medium transition-colors ${
                          (styles.imageRatio || '1:1') === ratio
                            ? 'bg-primary-500 text-white'
                            : 'bg-zinc-100 text-dark-secondary hover:bg-zinc-200'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CATEGORY SLIDER */}
          {type === 'category_slider' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-dark-secondary">รูปแบบปุ่มหมวดหมู่ (Tab Style)</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'pill', label: 'Pill (ปุ่มมน)', desc: 'สไตล์แอปสั่งอาหาร' },
                    { id: 'solid', label: 'Solid (สี่เหลี่ยม)', desc: 'สไตล์โมเดิร์น' },
                    { id: 'underline', label: 'Underline', desc: 'ขีดเส้นใต้เรียบหรู' },
                    { id: 'bordered', label: 'Bordered', desc: 'กรอบเส้นขอบ' },
                  ].map((styleOpt) => (
                    <button
                      key={styleOpt.id}
                      type="button"
                      onClick={() => handleStyleChange('tabStyle', styleOpt.id)}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        (styles.tabStyle || 'pill') === styleOpt.id
                          ? 'border-primary-500 bg-orange-50/60 font-semibold text-primary-700'
                          : 'border-border bg-white text-dark-secondary hover:bg-zinc-50'
                      }`}
                    >
                      <div className="font-medium text-xs">{styleOpt.label}</div>
                      <div className="text-[10px] text-dark-muted">{styleOpt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Tab Color */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-dark-secondary">
                  <span>สีปุ่มที่เลือก (Active Tab Color)</span>
                  <span className="font-mono">{styles.activeTabBgColor || '#FF5A36'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={styles.activeTabBgColor || '#FF5A36'}
                    onChange={(e) => handleStyleChange('activeTabBgColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-border p-0.5 bg-white"
                  />
                  <div className="flex items-center gap-1.5 flex-1 overflow-x-auto pb-1 scrollbar-none">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleStyleChange('activeTabBgColor', c)}
                        className="w-5 h-5 rounded-full border border-border flex-shrink-0 transition-transform hover:scale-110"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Text Color */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-dark-secondary">
                  <span>สีตัวหนังสือปุ่มที่เลือก</span>
                  <span className="font-mono">{styles.activeTabTextColor || '#FFFFFF'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={styles.activeTabTextColor || '#FFFFFF'}
                    onChange={(e) => handleStyleChange('activeTabTextColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-border p-0.5 bg-white"
                  />
                  <div className="flex items-center gap-1.5 flex-1 overflow-x-auto pb-1 scrollbar-none">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleStyleChange('activeTabTextColor', c)}
                        className="w-5 h-5 rounded-full border border-border flex-shrink-0 transition-transform hover:scale-110"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Show All tab toggle */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-dark-primary font-medium">แสดงแท็บ "ทั้งหมด"</span>
                <input
                  type="checkbox"
                  checked={content.showAll !== false}
                  onChange={(e) => handleContentChange({ showAll: e.target.checked })}
                  className="accent-primary-500 w-4 h-4 rounded cursor-pointer"
                />
              </div>

              {/* Alignment */}
              <div className="space-y-1.5 pt-1">
                <label className="text-dark-secondary">การจัดวางตำแหน่ง (Alignment)</label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'left', label: 'ชิดซ้าย', icon: AlignLeft },
                    { id: 'center', label: 'กึ่งกลาง', icon: AlignCenter },
                    { id: 'right', label: 'ชิดขวา', icon: AlignRight },
                  ].map((align) => {
                    const Icon = align.icon;
                    const isSelected = (styles.alignment || 'center') === align.id;
                    return (
                      <button
                        key={align.id}
                        type="button"
                        onClick={() => handleStyleChange('alignment', align.id)}
                        className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 font-medium transition-all ${
                          isSelected
                            ? 'bg-primary-500 text-white shadow-2xs'
                            : 'bg-zinc-100 text-dark-secondary hover:bg-zinc-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{align.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TYPOGRAPHY SETTINGS (For text, store_name, description, product_list, category_slider) */}
        {['store_name', 'description', 'text', 'product_list', 'category_slider'].includes(type) && (
          <div className="space-y-3 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <label className="font-bold text-dark-primary uppercase tracking-wider text-[11px] block">
                Typography
              </label>

              {/* Device Tab Switcher: Desktop vs Mobile */}
              <div className="flex items-center p-0.5 bg-zinc-100 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setTypoDeviceTab('desktop')}
                  className={`px-2 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1 transition-all ${
                    typoDeviceTab === 'desktop'
                      ? 'bg-white text-primary-600 shadow-2xs'
                      : 'text-dark-secondary hover:text-dark-primary'
                  }`}
                  title="ปรับขนาดฟอนต์บนหน้าจอ Desktop"
                >
                  <Monitor className="w-3 h-3" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTypoDeviceTab('mobile')}
                  className={`px-2 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1 transition-all ${
                    typoDeviceTab === 'mobile'
                      ? 'bg-white text-primary-600 shadow-2xs'
                      : 'text-dark-secondary hover:text-dark-primary'
                  }`}
                  title="ปรับขนาดฟอนต์บนหน้าจอมือถือ Mobile"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* Font Family Override */}
            <div className="space-y-1.5 p-2.5 bg-zinc-50 rounded-xl border border-border/80">
              <div className="flex items-center justify-between text-dark-secondary text-[11px]">
                <span className="font-medium">ฟอนต์เฉพาะส่วนนี้ (Font Family)</span>
                {styles.fontFamily && (
                  <button
                    type="button"
                    onClick={() => handleStyleChange('fontFamily', undefined)}
                    className="text-[10px] text-primary-600 hover:underline font-semibold"
                  >
                    รีเซ็ตตามธีม
                  </button>
                )}
              </div>
              <select
                value={styles.fontFamily || ''}
                onChange={(e) => handleStyleChange('fontFamily', e.target.value || undefined)}
                className="w-full p-2 bg-white border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500 cursor-pointer font-medium"
              >
                <option value="">
                  ⚡ ตามธีมเมนูหลัก ({AVAILABLE_FONTS.find((f) => f.family === (draftMenu.theme?.fontFamily || "'Sarabun', sans-serif"))?.name || 'Sarabun'})
                </option>
                {AVAILABLE_FONTS.map((font) => (
                  <option key={font.id} value={font.family}>
                    {font.name} — {font.nameTh}
                  </option>
                ))}
              </select>
            </div>

            {/* Element Font Size (Desktop vs Mobile) */}
            {type !== 'product_list' && (
              <div className="space-y-1.5 p-2.5 bg-zinc-50 rounded-xl border border-border/80">
                <div className="flex items-center justify-between text-dark-secondary">
                  <span className="font-medium flex items-center gap-1 text-[11px]">
                    {typoDeviceTab === 'desktop' ? (
                      <>
                        <Monitor className="w-3.5 h-3.5 text-blue-500" />
                        <span>ขนาดฟอนต์บน Desktop</span>
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-3.5 h-3.5 text-primary-500" />
                        <span>ขนาดฟอนต์บน Mobile</span>
                      </>
                    )}
                  </span>
                  <span className="font-mono font-bold text-dark-primary">
                    {typoDeviceTab === 'desktop'
                      ? (styles.fontSize || 16)
                      : (styles.fontSizeMobile || styles.fontSize || 16)}
                    px
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const prop = typoDeviceTab === 'desktop' ? 'fontSize' : 'fontSizeMobile';
                      const currentVal = (styles[prop] as number) || (styles.fontSize as number) || 16;
                      handleStyleChange(prop, Math.max(10, currentVal - 1));
                    }}
                    className="w-7 h-7 rounded-lg bg-white border border-border hover:bg-zinc-100 flex items-center justify-center text-dark-primary"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min="10"
                    max="48"
                    value={
                      typoDeviceTab === 'desktop'
                        ? (styles.fontSize || 16)
                        : (styles.fontSizeMobile || styles.fontSize || 16)
                    }
                    onChange={(e) => {
                      const prop = typoDeviceTab === 'desktop' ? 'fontSize' : 'fontSizeMobile';
                      handleStyleChange(prop, parseInt(e.target.value));
                    }}
                    className="flex-1 accent-primary-500 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const prop = typoDeviceTab === 'desktop' ? 'fontSize' : 'fontSizeMobile';
                      const currentVal = (styles[prop] as number) || (styles.fontSize as number) || 16;
                      handleStyleChange(prop, Math.min(64, currentVal + 1));
                    }}
                    className="w-7 h-7 rounded-lg bg-white border border-border hover:bg-zinc-100 flex items-center justify-center text-dark-primary"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Product List Specific Font Sizes (Desktop vs Mobile) */}
            {type === 'product_list' && (
              <div className="space-y-2.5">
                {/* Product Name Font Size */}
                <div className="space-y-1 p-2.5 bg-zinc-50 rounded-xl border border-border/80">
                  <div className="flex items-center justify-between text-dark-secondary">
                    <span className="font-medium flex items-center gap-1 text-[11px]">
                      {typoDeviceTab === 'desktop' ? (
                        <>
                          <Monitor className="w-3 h-3 text-blue-500" />
                          <span>ขนาดชื่ออาหาร (Desktop)</span>
                        </>
                      ) : (
                        <>
                          <Smartphone className="w-3 h-3 text-primary-500" />
                          <span>ขนาดชื่ออาหาร (Mobile)</span>
                        </>
                      )}
                    </span>
                    <span className="font-mono font-bold text-dark-primary">
                      {typoDeviceTab === 'desktop'
                        ? (styles.productNameFontSize || 16)
                        : (styles.productNameFontSizeMobile || styles.productNameFontSize || 15)}
                      px
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const prop =
                          typoDeviceTab === 'desktop'
                            ? 'productNameFontSize'
                            : 'productNameFontSizeMobile';
                        const currentVal =
                          (styles[prop] as number) || (styles.productNameFontSize as number) || 15;
                        handleStyleChange(prop, Math.max(10, currentVal - 1));
                      }}
                      className="w-7 h-7 rounded-lg bg-white border border-border hover:bg-zinc-100 flex items-center justify-center text-dark-primary"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min="11"
                      max="28"
                      value={
                        typoDeviceTab === 'desktop'
                          ? (styles.productNameFontSize || 16)
                          : (styles.productNameFontSizeMobile || styles.productNameFontSize || 15)
                      }
                      onChange={(e) => {
                        const prop =
                          typoDeviceTab === 'desktop'
                            ? 'productNameFontSize'
                            : 'productNameFontSizeMobile';
                        handleStyleChange(prop, parseInt(e.target.value));
                      }}
                      className="flex-1 accent-primary-500 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const prop =
                          typoDeviceTab === 'desktop'
                            ? 'productNameFontSize'
                            : 'productNameFontSizeMobile';
                        const currentVal =
                          (styles[prop] as number) || (styles.productNameFontSize as number) || 15;
                        handleStyleChange(prop, Math.min(36, currentVal + 1));
                      }}
                      className="w-7 h-7 rounded-lg bg-white border border-border hover:bg-zinc-100 flex items-center justify-center text-dark-primary"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Price Font Size */}
                <div className="space-y-1 p-2.5 bg-zinc-50 rounded-xl border border-border/80">
                  <div className="flex items-center justify-between text-dark-secondary">
                    <span className="font-medium flex items-center gap-1 text-[11px]">
                      {typoDeviceTab === 'desktop' ? (
                        <>
                          <Monitor className="w-3 h-3 text-blue-500" />
                          <span>ขนาดราคา (Desktop)</span>
                        </>
                      ) : (
                        <>
                          <Smartphone className="w-3 h-3 text-primary-500" />
                          <span>ขนาดราคา (Mobile)</span>
                        </>
                      )}
                    </span>
                    <span className="font-mono font-bold text-dark-primary">
                      {typoDeviceTab === 'desktop'
                        ? (styles.priceFontSize || 16)
                        : (styles.priceFontSizeMobile || styles.priceFontSize || 16)}
                      px
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const prop =
                          typoDeviceTab === 'desktop' ? 'priceFontSize' : 'priceFontSizeMobile';
                        const currentVal =
                          (styles[prop] as number) || (styles.priceFontSize as number) || 16;
                        handleStyleChange(prop, Math.max(10, currentVal - 1));
                      }}
                      className="w-7 h-7 rounded-lg bg-white border border-border hover:bg-zinc-100 flex items-center justify-center text-dark-primary"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min="11"
                      max="32"
                      value={
                        typoDeviceTab === 'desktop'
                          ? (styles.priceFontSize || 16)
                          : (styles.priceFontSizeMobile || styles.priceFontSize || 16)
                      }
                      onChange={(e) => {
                        const prop =
                          typoDeviceTab === 'desktop' ? 'priceFontSize' : 'priceFontSizeMobile';
                        handleStyleChange(prop, parseInt(e.target.value));
                      }}
                      className="flex-1 accent-primary-500 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const prop =
                          typoDeviceTab === 'desktop' ? 'priceFontSize' : 'priceFontSizeMobile';
                        const currentVal =
                          (styles[prop] as number) || (styles.priceFontSize as number) || 16;
                        handleStyleChange(prop, Math.min(40, currentVal + 1));
                      }}
                      className="w-7 h-7 rounded-lg bg-white border border-border hover:bg-zinc-100 flex items-center justify-center text-dark-primary"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Font Weight */}
            <div className="space-y-1">
              <label className="text-dark-secondary">Font Weight</label>
              <select
                value={styles.fontWeight || 400}
                onChange={(e) => handleStyleChange('fontWeight', parseInt(e.target.value))}
                className="w-full p-2 bg-zinc-50 border border-border rounded-xl focus:outline-none"
              >
                <option value={300}>Light (300)</option>
                <option value={400}>Regular (400)</option>
                <option value={500}>Medium (500)</option>
                <option value={600}>Semi Bold (600)</option>
                <option value={700}>Bold (700)</option>
                <option value={800}>Extra Bold (800)</option>
              </select>
            </div>

            {/* Alignment */}
            <div className="space-y-1">
              <label className="text-dark-secondary">Text Alignment</label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 rounded-xl">
                {(['left', 'center', 'right'] as const).map((align) => {
                  const Icon =
                    align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : AlignRight;
                  return (
                    <button
                      key={align}
                      type="button"
                      onClick={() => handleStyleChange('textAlign', align)}
                      className={`py-1.5 flex items-center justify-center rounded-lg transition-colors ${
                        (styles.textAlign || 'left') === align
                          ? 'bg-white shadow-xs text-primary-600 font-semibold'
                          : 'text-dark-secondary hover:text-dark-primary'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Text Color */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-dark-secondary">
                <span>Color</span>
                <span className="font-mono">{styles.color || '#18181B'}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={styles.color || '#18181B'}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-border p-0.5 bg-white"
                />
                <div className="flex items-center gap-1.5 flex-1 overflow-x-auto pb-1 scrollbar-none">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleStyleChange('color', c)}
                      className="w-5 h-5 rounded-full border border-border flex-shrink-0 transition-transform hover:scale-110"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Line Height & Letter Spacing */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-dark-secondary block mb-1">Line Height</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="2.5"
                  value={styles.lineHeight ?? 1.4}
                  onChange={(e) => handleStyleChange('lineHeight', parseFloat(e.target.value))}
                  className="w-full p-2 bg-zinc-50 border border-border rounded-xl focus:outline-none"
                />
              </div>
              <div>
                <label className="text-dark-secondary block mb-1">Letter Spacing (px)</label>
                <input
                  type="number"
                  step="0.5"
                  min="-2"
                  max="6"
                  value={styles.letterSpacing ?? 0}
                  onChange={(e) => handleStyleChange('letterSpacing', parseFloat(e.target.value))}
                  className="w-full p-2 bg-zinc-50 border border-border rounded-xl focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* SPACING CONTROLS (Margin & Padding) */}
        <div className="space-y-4">
          <label className="font-bold text-dark-primary uppercase tracking-wider text-[11px] block">
            Spacing & Layout
          </label>

          {/* Margin */}
          <div className="p-3 bg-zinc-50 border border-border rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-dark-secondary">
              <span className="font-semibold text-dark-primary">Margin</span>
              <button
                type="button"
                onClick={() => setIsLinkMargin(!isLinkMargin)}
                className={`p-1 rounded ${isLinkMargin ? 'bg-primary-50 text-primary-600' : 'text-dark-muted'}`}
                title="Link all sides"
              >
                {isLinkMargin ? <Link2 className="w-3.5 h-3.5" /> : <Unlink2 className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-dark-secondary">Top</span>
                <input
                  type="number"
                  value={styles.margin?.top ?? 0}
                  onChange={(e) => handleMarginChange('top', parseInt(e.target.value) || 0)}
                  className="w-full p-1.5 bg-white border border-border rounded-lg text-center"
                />
              </div>
              <div>
                <span className="text-[10px] text-dark-secondary">Bottom</span>
                <input
                  type="number"
                  value={styles.margin?.bottom ?? 16}
                  onChange={(e) => handleMarginChange('bottom', parseInt(e.target.value) || 0)}
                  className="w-full p-1.5 bg-white border border-border rounded-lg text-center"
                />
              </div>
            </div>
          </div>

          {/* Padding */}
          <div className="p-3 bg-zinc-50 border border-border rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-dark-secondary">
              <span className="font-semibold text-dark-primary">Padding</span>
              <button
                type="button"
                onClick={() => setIsLinkPadding(!isLinkPadding)}
                className={`p-1 rounded ${isLinkPadding ? 'bg-primary-50 text-primary-600' : 'text-dark-muted'}`}
                title="Link all sides"
              >
                {isLinkPadding ? <Link2 className="w-3.5 h-3.5" /> : <Unlink2 className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-dark-secondary">Horizontal (L/R)</span>
                <input
                  type="number"
                  value={styles.padding?.left ?? 16}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    handlePaddingChange('left', val);
                    handlePaddingChange('right', val);
                  }}
                  className="w-full p-1.5 bg-white border border-border rounded-lg text-center"
                />
              </div>
              <div>
                <span className="text-[10px] text-dark-secondary">Vertical (T/B)</span>
                <input
                  type="number"
                  value={styles.padding?.top ?? 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    handlePaddingChange('top', val);
                    handlePaddingChange('bottom', val);
                  }}
                  className="w-full p-1.5 bg-white border border-border rounded-lg text-center"
                />
              </div>
            </div>
          </div>

          {/* Gap (for product lists) */}
          {type === 'product_list' && (
            <div className="space-y-1">
              <div className="flex justify-between text-dark-secondary">
                <span>Gap ระหว่างรายการ</span>
                <span>{styles.gap ?? 16}px</span>
              </div>
              <input
                type="range"
                min="4"
                max="36"
                value={styles.gap ?? 16}
                onChange={(e) => handleStyleChange('gap', parseInt(e.target.value))}
                className="w-full accent-primary-500 cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

          {/* Upload Modal */}
          {selectedSection && (
            <ImageUploadModal
              isOpen={isImageModalOpen}
              onClose={() => setIsImageModalOpen(false)}
              specType={type === 'logo' ? 'logo' : (styles.aspectRatio === '16:9' ? 'banner' : 'square')}
              onImageSelected={(dataUrl) => {
                updateSectionContent(selectedSection.id, { url: dataUrl });
              }}
            />
          )}

          {/* Food Select Modal */}
          {selectedSection && (
            <FoodSelectModal
              isOpen={isFoodSelectOpen}
              onClose={() => setIsFoodSelectOpen(false)}
              products={products}
              categories={categories}
              selectedProductIds={content.productIds || []}
              onSave={(ids) => {
                updateSectionContent(selectedSection.id, { productIds: ids });
              }}
            />
          )}
        </>
      )}
    </div>
  );
};
