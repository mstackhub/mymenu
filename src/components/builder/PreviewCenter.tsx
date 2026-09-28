'use client';

import React, { useState } from 'react';
import {
  Smartphone,
  Tablet,
  Monitor,
  Save,
  Send,
  Eye,
  Check,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Info,
  Maximize2,
  X,
} from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { MenuSection, Product, OptionGroup, MenuTheme } from '@/types';
import { PublishModal } from '@/components/ui/PublishModal';

interface PreviewCenterProps {
  isPublicView?: boolean;
  deviceMode?: 'mobile' | 'tablet' | 'desktop';
  hideHeader?: boolean;
}

export const PreviewCenter: React.FC<PreviewCenterProps> = ({
  isPublicView = false,
  deviceMode: deviceModeProp,
  hideHeader = false,
}) => {
  const {
    draftMenu,
    publishedMenu,
    store,
    products,
    categories,
    selectedSectionId,
    setSelectedSectionId,
    saveDraftMenu,
    publishMenu,
  } = useStore();

  const [internalDeviceMode, setInternalDeviceMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const deviceMode = deviceModeProp || internalDeviceMode;
  const setDeviceMode = setInternalDeviceMode;
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title?: string } | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');

  const menu = isPublicView ? publishedMenu : draftMenu;
  const sections = [...(menu.sections || [])].sort((a, b) => a.sort_order - b.sort_order);

  const menuTheme: MenuTheme = menu.theme || {
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

  const getBackgroundStyle = (): React.CSSProperties => {
    if (menuTheme.backgroundType === 'gradient' && menuTheme.pageBgGradient) {
      return { background: menuTheme.pageBgGradient };
    }
    if (menuTheme.backgroundType === 'image' && menuTheme.pageBgImage) {
      return {
        backgroundImage: `url(${menuTheme.pageBgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    if (menuTheme.backgroundType === 'pattern') {
      if (menuTheme.pageBgPattern === 'dots') {
        return {
          backgroundColor: menuTheme.pageBgColor || '#F8FAFC',
          backgroundImage: 'radial-gradient(#CBD5E1 1.2px, transparent 1.2px)',
          backgroundSize: '16px 16px',
        };
      }
      if (menuTheme.pageBgPattern === 'grid') {
        return {
          backgroundColor: menuTheme.pageBgColor || '#F8FAFC',
          backgroundImage: 'linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        };
      }
    }
    return {
      backgroundColor: menuTheme.pageBgColor || '#FFFFFF',
      fontFamily: menuTheme.fontFamily || "'Sarabun', sans-serif",
    };
  };

  const handleSaveDraft = () => {
    saveDraftMenu();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handlePublish = () => {
    publishMenu();
    setIsPublishModalOpen(true);
  };

  // Helper to render section elements
  const renderSectionElement = (section: MenuSection) => {
    const { type, content, styles = {} } = section;
    const isSelected = !isPublicView && selectedSectionId === section.id;

    // Outer styling container (margins, alignment)
    const containerStyle: React.CSSProperties = {
      marginTop: `${styles.margin?.top ?? 0}px`,
      marginRight: `${styles.margin?.right ?? 0}px`,
      marginBottom: `${styles.margin?.bottom ?? 16}px`,
      marginLeft: `${styles.margin?.left ?? 0}px`,
      paddingTop: `${styles.padding?.top ?? 0}px`,
      paddingRight: `${styles.padding?.right ?? (styles.padding?.left ?? 16)}px`,
      paddingBottom: `${styles.padding?.bottom ?? (styles.padding?.top ?? 0)}px`,
      paddingLeft: `${styles.padding?.left ?? 16}px`,
    };

    const isDesktop = deviceMode === 'desktop';
    const effectiveFontSize = isDesktop
      ? (styles.fontSize || styles.fontSizeMobile)
      : (styles.fontSizeMobile || styles.fontSize);
    const effectiveProdNameFontSize = isDesktop
      ? (styles.productNameFontSize || styles.productNameFontSizeMobile || 16)
      : (styles.productNameFontSizeMobile || styles.productNameFontSize || 15);
    const effectivePriceFontSize = isDesktop
      ? (styles.priceFontSize || styles.priceFontSizeMobile || 17)
      : (styles.priceFontSizeMobile || styles.priceFontSize || 16);

    // Typography common styles
    const typoStyle: React.CSSProperties = {
      fontFamily: styles.fontFamily || menuTheme.fontFamily || "'Sarabun', sans-serif",
      fontSize: effectiveFontSize ? `${effectiveFontSize}px` : undefined,
      fontWeight: styles.fontWeight || 400,
      color: styles.color || menuTheme.textColor || '#18181B',
      textAlign: styles.textAlign || 'left',
      lineHeight: styles.lineHeight || 1.4,
      letterSpacing: styles.letterSpacing !== undefined ? `${styles.letterSpacing}px` : undefined,
    };

    return (
      <div
        key={section.id}
        onClick={(e) => {
          if (!isPublicView) {
            e.stopPropagation();
            setSelectedSectionId(section.id);
          }
        }}
        style={{
          ...containerStyle,
          fontFamily: styles.fontFamily || menuTheme.fontFamily || "'Sarabun', sans-serif",
        }}
        className={`relative transition-all ${
          !isPublicView
            ? isSelected
              ? 'builder-section-selected'
              : 'builder-section-hover'
            : ''
        }`}
      >
        {/* Element label on hover in builder mode */}
        {!isPublicView && isSelected && (
          <div className="absolute -top-3.5 right-0 bg-primary-500 text-white text-[9px] font-semibold px-1.5 py-0.2 shadow-xs uppercase tracking-wider z-10 pointer-events-none">
            {type.replace('_', ' ')}
          </div>
        )}

        {/* 1. STORE NAME */}
        {type === 'store_name' && (
          <h1 style={typoStyle} className="font-display">
            {content.text || store.name || 'Somtum House'}
          </h1>
        )}

        {/* 2. LOGO */}
        {type === 'logo' && (
          <div
            className={`flex ${
              styles.alignment === 'left'
                ? 'justify-start'
                : styles.alignment === 'right'
                ? 'justify-end'
                : 'justify-center'
            }`}
          >
            <img
              src={content.url || store.logo_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&fit=crop'}
              alt={store.name}
              style={{
                width: styles.width ? `${styles.width}px` : '80px',
                height: styles.width ? `${styles.width}px` : '80px',
                borderRadius: styles.borderRadius !== undefined ? `${styles.borderRadius}px` : '9999px',
              }}
              className="object-cover shadow-sm border border-border"
            />
          </div>
        )}

        {/* 3. DESCRIPTION */}
        {type === 'description' && (
          <p style={typoStyle} className="text-sm">
            {content.text || store.description || 'ยินดีต้อนรับสู่ร้านของเรา อาหารอร่อย สด สะอาด'}
          </p>
        )}

        {/* 4. IMAGE */}
        {type === 'image' && (
          <div
            className={`flex ${
              styles.alignment === 'left'
                ? 'justify-start'
                : styles.alignment === 'right'
                ? 'justify-end'
                : 'justify-center'
            }`}
          >
            <div
              className={`w-full overflow-hidden shadow-xs border border-border ${
                styles.aspectRatio === '1:1'
                  ? 'aspect-square'
                  : styles.aspectRatio === '4:5'
                  ? 'aspect-[4/5]'
                  : styles.aspectRatio === '16:9'
                  ? 'aspect-video'
                  : ''
              }`}
              style={{
                borderRadius: styles.borderRadius !== undefined ? `${styles.borderRadius}px` : '12px',
              }}
            >
              <img
                src={content.url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&fit=crop'}
                alt={content.alt || 'Menu Banner'}
                style={{
                  objectFit: styles.objectFit || 'cover',
                }}
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {/* 5. TEXT */}
        {type === 'text' && (
          <div style={typoStyle}>
            {content.text || 'หัวข้อข้อความเมนู'}
          </div>
        )}

        {/* 6. CATEGORY SLIDER */}
        {type === 'category_slider' && (
          <div className="w-full overflow-x-auto pb-1 scrollbar-none select-none">
            <div
              className={`flex items-center gap-2 min-w-max ${
                styles.alignment === 'left'
                  ? 'mr-auto justify-start'
                  : styles.alignment === 'right'
                  ? 'ml-auto justify-end'
                  : 'mx-auto justify-center'
              }`}
            >
              {content.showAll !== false && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveCategoryId('all');
                  }}
                  className={`px-3.5 py-1.5 font-medium text-xs whitespace-nowrap transition-all ${
                    styles.tabStyle === 'solid'
                      ? 'rounded-none'
                      : styles.tabStyle === 'bordered'
                      ? 'rounded-none border'
                      : styles.tabStyle === 'underline'
                      ? 'rounded-none border-b-2'
                      : 'rounded-full'
                  }`}
                  style={{
                    backgroundColor:
                      activeCategoryId === 'all'
                        ? styles.activeTabBgColor || '#FF5A36'
                        : styles.tabStyle === 'underline'
                        ? 'transparent'
                        : styles.inactiveTabBgColor || '#F4F4F5',
                    color:
                      activeCategoryId === 'all'
                        ? styles.activeTabTextColor || '#FFFFFF'
                        : styles.inactiveTabTextColor || '#52525B',
                    borderColor:
                      activeCategoryId === 'all'
                        ? styles.activeTabBgColor || '#FF5A36'
                        : '#E4E4E7',
                  }}
                >
                  {content.allLabel || 'ทั้งหมด'}
                </button>
              )}
              {categories.map((cat) => {
                const isActive = activeCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCategoryId(cat.id);
                    }}
                    className={`px-3.5 py-1.5 font-medium text-xs whitespace-nowrap transition-all ${
                      styles.tabStyle === 'solid'
                        ? 'rounded-none'
                        : styles.tabStyle === 'bordered'
                        ? 'rounded-none border'
                        : styles.tabStyle === 'underline'
                        ? 'rounded-none border-b-2'
                        : 'rounded-full'
                    }`}
                    style={{
                      backgroundColor:
                        isActive
                          ? styles.activeTabBgColor || '#FF5A36'
                          : styles.tabStyle === 'underline'
                          ? 'transparent'
                          : styles.inactiveTabBgColor || '#F4F4F5',
                      color:
                        isActive
                          ? styles.activeTabTextColor || '#FFFFFF'
                          : styles.inactiveTabTextColor || '#52525B',
                      borderColor:
                        isActive
                          ? styles.activeTabBgColor || '#FF5A36'
                          : '#E4E4E7',
                    }}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. FOOD LIST */}
        {type === 'product_list' && (() => {
          let displayProducts: Product[] = [];
          if (content.selectionMode === 'manual' && Array.isArray(content.productIds) && content.productIds.length > 0) {
            displayProducts = content.productIds
              .map((prodId: string) => products.find((p) => p.id === prodId && p.status === 'active'))
              .filter(Boolean) as Product[];
          } else if (content.selectionMode === 'category' && content.categoryId && content.categoryId !== 'all') {
            displayProducts = products.filter((p) => p.status === 'active' && p.category_id === content.categoryId);
          } else {
            // Auto Mode: All active products in store (Automatically includes newly added products!)
            displayProducts = products.filter((p) => p.status === 'active');
          }

          // Filter by Category Slider active tab
          if (activeCategoryId !== 'all') {
            displayProducts = displayProducts.filter((p) => p.category_id === activeCategoryId);
          }

          const displayMode = content.display || 'image-text-price';

          return (
            <div
              className={deviceMode === 'mobile' ? 'flex flex-col' : 'grid grid-cols-2'}
              style={{
                gap: styles.gap !== undefined ? `${styles.gap}px` : '16px',
              }}
            >
              {displayProducts.length === 0 ? (
                <div className="col-span-full p-6 border border-dashed border-zinc-300 rounded-none text-center text-dark-secondary text-xs bg-zinc-50/50">
                  {products.length === 0
                    ? 'ยังไม่มีรายการอาหารในระบบ (เพิ่มรายการอาหารได้ที่เมนู "รายการอาหาร")'
                    : 'ไม่พบรายการอาหารในหมวดหมู่นี้'}
                </div>
              ) : (
                displayProducts.map((prod) => {
                  // Display Mode: Image + Text + Price (Card / Horizontal)
                  if (displayMode === 'image-text-price') {
                    return (
                      <div
                        key={prod.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProductForDetail(prod);
                        }}
                        className="group border flex gap-3.5 hover:shadow-xs transition-all cursor-pointer items-center"
                        style={{
                          backgroundColor: menuTheme.cardBgColor || '#FFFFFF',
                          borderColor: menuTheme.cardBorderColor || '#E4E4E7',
                          borderRadius: styles.borderRadius !== undefined ? `${styles.borderRadius}px` : '12px',
                          padding: styles.cardPadding !== undefined ? `${styles.cardPadding}px` : '12px',
                          fontFamily: styles.fontFamily || menuTheme.fontFamily || "'Sarabun', sans-serif",
                        }}
                      >
                        {/* Product Image */}
                        <div
                          className={`relative w-20 h-20 flex-shrink-0 overflow-hidden bg-zinc-100 ${
                            styles.imageRatio === '4:5'
                              ? 'aspect-[4/5] h-24'
                              : styles.imageRatio === '16:9'
                              ? 'aspect-video w-24'
                              : 'aspect-square'
                          }`}
                          style={{
                            borderRadius: styles.imageBorderRadius !== undefined
                              ? (styles.imageBorderRadius === 999 ? '9999px' : `${styles.imageBorderRadius}px`)
                              : styles.borderRadius !== undefined
                              ? `${Math.max(0, styles.borderRadius - 2)}px`
                              : '8px',
                          }}
                        >
                          <img
                            src={prod.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&fit=crop'}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Product Content */}
                        <div
                          className="flex-1 min-w-0 flex flex-col justify-between py-0.5"
                          style={{
                            textAlign: styles.textAlign || 'left',
                            alignItems: styles.textAlign === 'center' ? 'center' : styles.textAlign === 'right' ? 'flex-end' : 'stretch',
                          }}
                        >
                          <div style={{ width: '100%', textAlign: styles.textAlign || 'left' }}>
                            <h4
                              className="truncate"
                              style={{
                                fontFamily: styles.fontFamily || menuTheme.fontFamily || undefined,
                                fontSize: `${effectiveProdNameFontSize}px`,
                                fontWeight: styles.fontWeight || 600,
                                color: styles.color || styles.productNameColor || menuTheme.textColor || '#18181B',
                                lineHeight: styles.lineHeight || 1.3,
                                letterSpacing: styles.letterSpacing !== undefined ? `${styles.letterSpacing}px` : undefined,
                                textAlign: styles.textAlign || 'left',
                              }}
                            >
                              {prod.name}
                            </h4>
                            {prod.description && (
                              <p
                                className="text-[11px] mt-0.5 line-clamp-1 leading-snug"
                                style={{
                                  fontFamily: styles.fontFamily || menuTheme.fontFamily || undefined,
                                  color: menuTheme.textMutedColor || '#71717A',
                                  textAlign: styles.textAlign || 'left',
                                }}
                              >
                                {prod.description}
                              </p>
                            )}
                            {prod.option_groups && prod.option_groups.length > 0 && (
                              <p
                                className="text-[11px] mt-0.5"
                                style={{
                                  fontFamily: styles.fontFamily || menuTheme.fontFamily || undefined,
                                  color: menuTheme.textMutedColor || '#71717A',
                                  textAlign: styles.textAlign || 'left',
                                }}
                              >
                                {prod.option_groups.map((g) => g.name).join(' • ')}
                              </p>
                            )}
                          </div>

                          {/* Price Row */}
                          <div
                            className="flex items-baseline gap-2 mt-2"
                            style={{
                              justifyContent: styles.textAlign === 'center' ? 'center' : styles.textAlign === 'right' ? 'flex-end' : 'flex-start',
                              width: '100%',
                            }}
                          >
                            <span
                              className="font-bold"
                              style={{
                                fontFamily: styles.fontFamily || menuTheme.fontFamily || undefined,
                                fontSize: `${effectivePriceFontSize}px`,
                                color: styles.priceColor || menuTheme.priceColor || '#FF5A36',
                              }}
                            >
                              ฿{prod.sale_price}
                            </span>
                            {prod.regular_price && (
                              <span
                                className="text-xs line-through"
                                style={{
                                  fontFamily: styles.fontFamily || menuTheme.fontFamily || undefined,
                                  color: styles.regularPriceColor || menuTheme.textMutedColor || '#A1A1AA',
                                }}
                              >
                                ฿{prod.regular_price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Display Mode: Text + Price (Clean minimal restaurant style)
                  return (
                    <div
                      key={prod.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProductForDetail(prod);
                      }}
                      className="flex items-baseline justify-between py-2.5 border-b hover:opacity-85 px-2 rounded-none transition-colors cursor-pointer group"
                      style={{
                        borderColor: menuTheme.cardBorderColor || '#E4E4E7',
                        textAlign: styles.textAlign || 'left',
                      }}
                    >
                      <div className="pr-4 flex-1">
                        <span
                          className="group-hover:text-primary-600 transition-colors block"
                          style={{
                            fontFamily: styles.fontFamily || menuTheme.fontFamily || undefined,
                            fontSize: `${effectiveProdNameFontSize}px`,
                            fontWeight: styles.fontWeight || 500,
                            color: styles.color || styles.productNameColor || menuTheme.textColor || '#27272A',
                            lineHeight: styles.lineHeight || 1.3,
                            letterSpacing: styles.letterSpacing !== undefined ? `${styles.letterSpacing}px` : undefined,
                            textAlign: styles.textAlign || 'left',
                          }}
                        >
                          {prod.name}
                        </span>
                        {prod.description && (
                          <p
                            className="text-[11px] block mt-0.5 line-clamp-1 leading-snug"
                            style={{
                              fontFamily: styles.fontFamily || menuTheme.fontFamily || undefined,
                              color: menuTheme.textMutedColor || '#71717A',
                              textAlign: styles.textAlign || 'left',
                            }}
                          >
                            {prod.description}
                          </p>
                        )}
                        {prod.option_groups && prod.option_groups.length > 0 && (
                          <span
                            className="text-[10px] block mt-0.5"
                            style={{
                              fontFamily: styles.fontFamily || menuTheme.fontFamily || undefined,
                              color: menuTheme.textMutedColor || '#71717A',
                              textAlign: styles.textAlign || 'left',
                            }}
                          >
                            {prod.option_groups.map((g) => g.name).join(', ')}
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-2 flex-shrink-0">
                        <span
                          className="font-bold"
                          style={{
                            fontFamily: styles.fontFamily || menuTheme.fontFamily || undefined,
                            fontSize: `${effectivePriceFontSize}px`,
                            color: styles.priceColor || menuTheme.priceColor || '#18181B',
                          }}
                        >
                          ฿{prod.sale_price}
                        </span>
                        {prod.regular_price && (
                          <span
                            className="text-xs line-through"
                            style={{
                              fontFamily: styles.fontFamily || menuTheme.fontFamily || undefined,
                              color: styles.regularPriceColor || '#A1A1AA',
                            }}
                          >
                            ฿{prod.regular_price}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          );
        })()}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-100/70 overflow-hidden min-w-0">
      {/* Top Builder Control Bar (Only in Builder Mode when not hidden by parent layout) */}
      {!isPublicView && !hideHeader && (
        <div className="h-14 bg-white border-b border-border px-3.5 sm:px-5 flex items-center justify-between z-20 flex-shrink-0 sticky top-0 gap-2 overflow-x-auto select-none">
          {/* Status & Store Tag */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-bold text-dark-primary font-display hidden xl:inline">
              Menu Canvas
            </span>
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
              <span>{draftMenu.status === 'published' ? 'Published' : 'Drafting'}</span>
            </span>
          </div>

          {/* Viewport Switcher */}
          <div className="flex items-center gap-0.5 bg-zinc-100 p-1 rounded-xl border border-border flex-shrink-0">
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
                deviceMode === 'mobile'
                  ? 'bg-white text-primary-600 shadow-xs font-semibold'
                  : 'text-dark-secondary hover:text-dark-primary'
              }`}
              title="Mobile View (390px)"
            >
              <Smartphone className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Mobile</span>
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
                deviceMode === 'tablet'
                  ? 'bg-white text-primary-600 shadow-xs font-semibold'
                  : 'text-dark-secondary hover:text-dark-primary'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Tablet</span>
            </button>
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
                deviceMode === 'desktop'
                  ? 'bg-white text-primary-600 shadow-xs font-semibold'
                  : 'text-dark-secondary hover:text-dark-primary'
              }`}
              title="Desktop View (1200px)"
            >
              <Monitor className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Desktop</span>
            </button>
          </div>

          {/* Action Buttons: View Live, Save Draft & Publish */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={`/m/${store.slug}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
              title="เปิดดูหน้าเว็บจริงของลูกค้า (New Tab)"
            >
              <ExternalLink className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
              <span>ดูหน้าเว็บจริง</span>
            </a>

            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-3 py-1.5 bg-white border border-border hover:bg-zinc-50 text-dark-primary text-xs font-medium rounded-xl transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
            >
              {saveToast ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="text-emerald-600 font-semibold">Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-dark-secondary flex-shrink-0" />
                  <span>บันทึก Draft</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePublish}
              className="px-3.5 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Publish เมนู</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Canvas Scroll Area */}
      <div
        onClick={() => !isPublicView && setSelectedSectionId(null)}
        className="flex-1 overflow-y-auto p-2 sm:p-6 flex justify-center items-start min-h-0"
      >
        {/* Viewport Frame Container */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`bg-white transition-all duration-300 shadow-xl ${
            deviceMode === 'mobile'
              ? 'w-full max-w-[390px] min-h-[700px] rounded-[28px] sm:rounded-[40px] border-4 sm:border-[8px] border-zinc-900 overflow-hidden relative'
              : deviceMode === 'tablet'
              ? 'w-full max-w-[768px] min-h-[850px] rounded-2xl border border-border overflow-hidden'
              : 'w-full max-w-[1100px] min-h-[900px] rounded-2xl border border-border overflow-hidden'
          }`}
        >
          {/* Mobile Status Bar Header simulation */}
          {deviceMode === 'mobile' && (
            <div className="w-full bg-zinc-900 text-white pt-2.5 pb-2 px-6 flex items-center justify-between text-[11px] font-semibold tracking-wider select-none">
              <span>9:41</span>
              <div className="w-24 h-4 bg-zinc-800 rounded-full mx-auto" />
              <div className="flex items-center gap-1 text-[10px]">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* Rendered Menu Document */}
          <div className="min-h-full pb-16 transition-colors" style={getBackgroundStyle()}>
            {sections.length === 0 ? (
              <div className="py-24 text-center text-dark-muted px-4">
                <p className="font-semibold text-sm">ยังไม่มี Section ใดๆ ในเมนูนี้</p>
                <p className="text-xs mt-1">คลิกเลือก Element จากแถบซ้ายมือเพื่อเริ่มสร้างเมนู</p>
              </div>
            ) : (
              sections.map(renderSectionElement)
            )}
          </div>
        </div>
      </div>

      {/* Product Detail & Options Modal */}
      {selectedProductForDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedProductForDetail(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-border flex flex-col max-h-[85vh]"
          >
            <div
              className="relative w-full h-44 sm:h-52 bg-zinc-100 flex-shrink-0 overflow-hidden cursor-pointer group select-none"
              onClick={() => {
                if (selectedProductForDetail) {
                  setLightboxImage({
                    url: selectedProductForDetail.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&fit=crop',
                    title: selectedProductForDetail.name,
                  });
                }
              }}
              title="แตะเพื่อดูรูปภาพขนาดเต็ม"
            >
              <img
                src={selectedProductForDetail.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&fit=crop'}
                alt={selectedProductForDetail.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors pointer-events-none" />

              {/* Zoom Indicator Badge */}
              <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity pointer-events-none shadow-sm">
                <Maximize2 className="w-3 h-3 text-white" />
                <span>แตะเพื่อดูรูปเต็ม</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProductForDetail(null);
                }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors shadow-sm z-10"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <h3 className="text-xl font-bold text-dark-primary font-display">
                  {selectedProductForDetail.name}
                </h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-lg font-bold text-primary-500 font-display">
                    ฿{selectedProductForDetail.sale_price}
                  </span>
                  {selectedProductForDetail.regular_price && (
                    <span className="text-xs text-dark-muted line-through">
                      ฿{selectedProductForDetail.regular_price}
                    </span>
                  )}
                </div>
                {selectedProductForDetail.description && (
                  <p className="text-xs text-dark-secondary leading-relaxed mt-2.5 bg-zinc-50 p-3 rounded-2xl border border-border/70">
                    {selectedProductForDetail.description}
                  </p>
                )}
              </div>

              {/* Dynamic Option Groups Display */}
              {selectedProductForDetail.option_groups && selectedProductForDetail.option_groups.length > 0 && (
                <div className="space-y-4 pt-3 border-t border-border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-dark-secondary">
                    ตัวเลือกเมนูอาหาร (Options)
                  </h4>
                  {selectedProductForDetail.option_groups.map((group) => (
                    <div key={group.id} className="p-3 bg-zinc-50 rounded-2xl border border-border/80">
                      <p className="text-xs font-bold text-dark-primary mb-2">{group.name}</p>
                      <div className="space-y-1.5">
                        {group.options.map((opt) => (
                          <div
                            key={opt.id}
                            className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white border border-border/60"
                          >
                            <span className="text-dark-primary">{opt.name}</span>
                            <span className="font-semibold text-primary-600">
                              {opt.additional_price > 0 ? `+฿${opt.additional_price}` : 'ฟรี'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border bg-soft/50 text-center">
              <button
                onClick={() => setSelectedProductForDetail(null)}
                className="w-full py-2.5 bg-dark-primary hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Fullscreen Image Viewer Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-fade-in select-none"
          onClick={() => setLightboxImage(null)}
        >
          {/* Top Bar */}
          <div
            className="w-full max-w-2xl flex items-center justify-between text-white mb-3 px-2"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="font-semibold text-sm sm:text-base truncate pr-4 text-zinc-100">
              {lightboxImage.title || 'รูปภาพเมนู'}
            </span>
            <button
              onClick={() => setLightboxImage(null)}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 text-white flex items-center justify-center transition-all flex-shrink-0"
              title="ปิด"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Large Image */}
          <div
            className="relative max-w-3xl max-h-[80vh] flex items-center justify-center overflow-hidden rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title || 'รูปภาพอาหาร'}
              className="max-h-[80vh] max-w-[92vw] w-auto h-auto object-contain rounded-2xl shadow-2xl"
            />
          </div>

          {/* Bottom Hint */}
          <p className="text-zinc-400 text-xs mt-3 select-none">แตะบริเวณใดก็ได้เพื่อปิด</p>
        </div>
      )}

      {/* Publish Modal */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        store={store}
      />
    </div>
  );
};
