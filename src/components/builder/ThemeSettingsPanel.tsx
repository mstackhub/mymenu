'use client';

import React, { useState } from 'react';
import {
  Palette,
  Check,
  Maximize2,
  Image as ImageIcon,
  Sun,
  Coffee,
  Flame,
  Layout,
  Layers,
  Type,
} from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { THEME_PRESETS, ThemePreset } from '@/lib/theme-presets';
import { AVAILABLE_FONTS, FontOption } from '@/lib/fonts';
import { MenuTheme } from '@/types';

export const ThemeSettingsPanel: React.FC = () => {
  const { draftMenu, updateMenuTheme } = useStore();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [fontCategory, setFontCategory] = useState<string>('all');

  const theme: MenuTheme = draftMenu.theme || {
    presetId: 'minimal-white',
    backgroundType: 'color',
    pageBgColor: '#FFFFFF',
    cardBgColor: '#FFFFFF',
    cardBorderColor: '#E4E4E7',
    textColor: '#18181B',
    textMutedColor: '#71717A',
    accentColor: '#FF5A36',
    priceColor: '#FF5A36',
    isDark: false,
    contentMaxWidth: 'wide',
  };

  const handleSelectPreset = (preset: ThemePreset) => {
    updateMenuTheme({
      presetId: preset.id,
      backgroundType: preset.backgroundType,
      pageBgColor: preset.pageBgColor,
      pageBgGradient: preset.pageBgGradient,
      pageBgPattern: preset.pageBgPattern,
      pageBgImage: preset.pageBgImage,
      cardBgColor: preset.cardBgColor,
      cardBorderColor: preset.cardBorderColor,
      textColor: preset.textColor,
      textMutedColor: preset.textMutedColor,
      accentColor: preset.accentColor,
      priceColor: preset.priceColor,
      fontFamily: preset.fontFamily || theme.fontFamily || "'Sarabun', sans-serif",
      isDark: false,
    });
  };

  const filteredPresets = filterCategory === 'all'
    ? THEME_PRESETS
    : THEME_PRESETS.filter((p) => p.category === filterCategory);

  return (
    <div className="space-y-6 select-none">
      {/* Header Info */}
      <div className="p-3 bg-orange-50 border border-orange-200/70 rounded-2xl">
        <p className="text-xs font-bold text-dark-primary">Template พื้นหลัง & ธีมเมนู</p>
        <p className="text-[11px] text-dark-secondary mt-0.5 leading-relaxed">
          เลือกเทมเพลตสำเร็จรูป หรือปรับแต่งพื้นหลังและโทนสีของเมนูอาหารทั้งหน้าได้ทันที
        </p>
      </div>

      {/* Preset Categories Switcher */}
      <div className="space-y-2">
        <label className="font-bold text-dark-primary uppercase tracking-wider text-[11px] block">
          หมวดหมู่เทมเพลต (Template Presets)
        </label>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'minimal', label: '🤍 คลีน & มินิมอล' },
            { id: 'warm', label: '🪵 ไม้ & อบอุ่น' },
            { id: 'cafe', label: '🍵 คาเฟ่' },
            { id: 'gradient', label: '🌅 ไล่เฉดสี' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterCategory(tab.id)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
                filterCategory === tab.id
                  ? 'bg-zinc-900 text-white shadow-2xs font-semibold'
                  : 'bg-zinc-100 text-dark-secondary hover:bg-zinc-200 hover:text-dark-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
        {filteredPresets.map((preset) => {
          const isSelected = theme.presetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`text-left p-2.5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between group ${
                isSelected
                  ? 'border-primary-500 bg-white ring-2 ring-primary-500/20 shadow-xs'
                  : 'border-border bg-zinc-50 hover:bg-white hover:border-zinc-300'
              }`}
            >
              {/* Preset Visual Swatch */}
              <div
                className="w-full h-14 rounded-xl border border-black/10 overflow-hidden relative mb-2 shadow-2xs flex flex-col justify-between p-1.5"
                style={{
                  background: preset.pageBgGradient || preset.previewBg,
                  backgroundColor: preset.pageBgColor,
                }}
              >
                {/* Mini card simulation */}
                <div
                  className="w-full rounded-md px-1.5 py-1 shadow-2xs flex items-center justify-between border"
                  style={{
                    backgroundColor: preset.cardBgColor,
                    borderColor: preset.cardBorderColor,
                  }}
                >
                  <div
                    className="w-8 h-1.5 rounded-full"
                    style={{ backgroundColor: preset.textColor }}
                  />
                  <div
                    className="w-4 h-1.5 rounded-full"
                    style={{ backgroundColor: preset.priceColor }}
                  />
                </div>

                <div className="flex items-center justify-end text-[8px] font-bold px-0.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: preset.accentColor }}
                  />
                </div>
              </div>

              {/* Preset Info */}
              <div>
                <p className="font-bold text-[11px] text-dark-primary truncate">
                  {preset.nameTh}
                </p>
                <p className="text-[10px] text-dark-muted truncate mt-0.5">
                  {preset.name}
                </p>
              </div>

              {/* Active Badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-xs">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* CUSTOM BACKGROUND CONTROLS */}
      <div className="space-y-3 pt-4 border-t border-border">
        <label className="font-bold text-dark-primary uppercase tracking-wider text-[11px] block">
          ปรับแต่งพื้นหลังแบบกำหนดเอง (Custom Background)
        </label>

        {/* Background Type Selector */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 rounded-xl">
          {[
            { id: 'color', label: 'สีพื้น' },
            { id: 'gradient', label: 'ไล่เฉด' },
            { id: 'image', label: 'รูปภาพ' },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => updateMenuTheme({ backgroundType: type.id as any })}
              className={`py-1.5 rounded-lg font-medium text-[10px] transition-all ${
                theme.backgroundType === type.id
                  ? 'bg-white text-dark-primary shadow-2xs font-semibold'
                  : 'text-dark-secondary hover:text-dark-primary'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Color Palette */}
        {theme.backgroundType === 'color' && (
          <div className="space-y-2 p-3 bg-zinc-50 rounded-2xl border border-border">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-dark-secondary">สีพื้นหลัง (Page Color)</span>
              <span className="font-mono text-dark-primary font-semibold">
                {theme.pageBgColor || '#FFFFFF'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.pageBgColor || '#FFFFFF'}
                onChange={(e) => updateMenuTheme({ pageBgColor: e.target.value, presetId: 'custom' })}
                className="w-8 h-8 rounded-lg cursor-pointer border border-border bg-white"
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  '#FFFFFF',
                  '#FBF9F5',
                  '#F3F4F6',
                  '#EEF5EE',
                  '#FFF7ED',
                  '#FFF1F3',
                  '#FDF8F3',
                  '#F5F5F7',
                ].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => updateMenuTheme({ pageBgColor: c, presetId: 'custom' })}
                    className="w-5 h-5 rounded-full border border-zinc-300 transition-transform hover:scale-110 shadow-2xs"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Gradient Selection */}
        {theme.backgroundType === 'gradient' && (
          <div className="space-y-2 p-3 bg-zinc-50 rounded-2xl border border-border">
            <span className="text-dark-secondary text-[11px] block">เลือกสไตล์การไล่เฉดสี</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Warm Peach', grad: 'linear-gradient(180deg, #FFF7ED 0%, #FEF2F2 100%)' },
                { name: 'Matcha Soft', grad: 'linear-gradient(180deg, #F4F8F4 0%, #E6EFE6 100%)' },
                { name: 'Sunset Glow', grad: 'linear-gradient(180deg, #FFF7ED 0%, #FEF2F2 50%, #FFF1F2 100%)' },
                { name: 'Warm Wood', grad: 'linear-gradient(180deg, #FBF6EF 0%, #F3E8DB 100%)' },
                { name: 'Sakura Sweet', grad: 'linear-gradient(180deg, #FFF7F8 0%, #FFE8EB 100%)' },
                { name: 'Clean Soft', grad: 'linear-gradient(180deg, #FFFFFF 0%, #F4F4F5 100%)' },
              ].map((g) => (
                <button
                  key={g.name}
                  type="button"
                  onClick={() => updateMenuTheme({ pageBgGradient: g.grad, backgroundType: 'gradient', presetId: 'custom' })}
                  className="p-2 rounded-xl border border-border text-left hover:border-primary-500 transition-all text-[10px] font-semibold flex items-center gap-2"
                  style={{ background: g.grad }}
                >
                  <span className="bg-white/80 backdrop-blur-xs px-1.5 py-0.5 rounded text-dark-primary shadow-2xs truncate">
                    {g.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Image Wallpaper */}
        {theme.backgroundType === 'image' && (
          <div className="space-y-2 p-3 bg-zinc-50 rounded-2xl border border-border">
            <label className="text-dark-secondary text-[11px] block">ลิงก์รูปภาพพื้นหลัง (URL)</label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={theme.pageBgImage || ''}
              onChange={(e) => updateMenuTheme({ pageBgImage: e.target.value, backgroundType: 'image', presetId: 'custom' })}
              className="w-full p-2 bg-white border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500"
            />
          </div>
        )}
      </div>

      {/* FONT FAMILY & TYPOGRAPHY SETTINGS */}
      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <label className="font-bold text-dark-primary uppercase tracking-wider text-[11px] block flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-primary-500" />
              <span>ฟอนต์ตัวหนังสือเมนู (Font Family)</span>
            </label>
            <p className="text-[10px] text-dark-muted mt-0.5">
              เลือกรูปแบบตัวอักษรภาษาไทย-อังกฤษ สำหรับเมนูอาหารทั้งหน้า
            </p>
          </div>
          <span className="text-[10px] font-semibold bg-zinc-100 text-dark-secondary px-2 py-0.5 rounded-md border border-border/80">
            {AVAILABLE_FONTS.find((f) => f.family === (theme.fontFamily || "'Sarabun', sans-serif"))?.name || 'Sarabun'}
          </span>
        </div>

        {/* Font Category Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'Modern', label: '⚡ โมเดิร์น' },
            { id: 'Clean', label: '🤍 คลีน & อ่านง่าย' },
            { id: 'Friendly', label: '🍰 อบอุ่น/น่ารัก' },
            { id: 'Premium', label: '👑 พรีเมียม' },
            { id: 'Street', label: '🔥 เท่/สตรีท' },
            { id: 'Decorative', label: '✨ ไทยวิจิตร' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFontCategory(tab.id)}
              className={`px-2 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
                fontCategory === tab.id
                  ? 'bg-zinc-900 text-white shadow-2xs font-semibold'
                  : 'bg-zinc-100 text-dark-secondary hover:bg-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Font Selection Cards Grid */}
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {AVAILABLE_FONTS.filter((f) => fontCategory === 'all' || f.category === fontCategory).map((font) => {
            const isSelected = (theme.fontFamily || "'Sarabun', sans-serif") === font.family;
            return (
              <button
                key={font.id}
                type="button"
                onClick={() => updateMenuTheme({ fontFamily: font.family })}
                className={`w-full text-left p-3 rounded-2xl border transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'border-primary-500 bg-orange-50/40 ring-1 ring-primary-500/30 shadow-xs'
                    : 'border-border bg-white hover:bg-zinc-50/80 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-dark-primary">{font.name}</span>
                    <span className="text-[10px] text-dark-muted font-normal">({font.nameTh})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-medium bg-zinc-100 text-dark-secondary px-1.5 py-0.5 rounded">
                      {font.tag}
                    </span>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-2xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Real-time Font Preview Sentence */}
                <p
                  className="text-xs text-dark-secondary mt-1.5 tracking-normal leading-relaxed truncate"
                  style={{ fontFamily: font.family }}
                >
                  {font.previewText}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* RESPONSIVE LAYOUT & CONTAINER WIDTH */}
      <div className="space-y-3 pt-4 border-t border-border">
        <label className="font-bold text-dark-primary uppercase tracking-wider text-[11px] block">
          ความกว้างหน้าเว็บลูกค้า (Responsive Container)
        </label>
        <p className="text-[10px] text-dark-muted">
          กำหนดขนาดความกว้างสูงสุดเมื่อลูกค้าเปิดดูบนคอมพิวเตอร์ / แท็บเล็ต
        </p>

        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'compact', label: '📱 มือถือ (480px)', desc: 'Mobile App View' },
            { id: 'standard', label: '📱 แท็บเล็ต (720px)', desc: 'Tablet Comfort' },
            { id: 'wide', label: '💻 Desktop (1024px)', desc: 'Standard (แนะนำ)' },
            { id: 'full', label: '🖥️ กว้างพิเศษ (1200px)', desc: 'Full Screen' },
          ].map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => updateMenuTheme({ contentMaxWidth: w.id as any })}
              className={`p-2.5 rounded-2xl border text-left transition-all ${
                (theme.contentMaxWidth || 'wide') === w.id
                  ? 'border-primary-500 bg-orange-50/50 ring-1 ring-primary-500/30'
                  : 'border-border bg-white hover:bg-zinc-50'
              }`}
            >
              <p className="font-bold text-[11px] text-dark-primary">{w.label}</p>
              <p className="text-[10px] text-dark-muted mt-0.5">{w.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
