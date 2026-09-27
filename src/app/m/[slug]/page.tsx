'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Utensils,
  Search,
  ChevronRight,
  Sparkles,
  Info,
  X,
  Share2,
  Check,
  Plus,
  Minus,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { MenuSection, Product, OptionGroup, ProductOption, MenuTheme } from '@/types';
import { CustomerNoteChat, NoteItem, NoteItemOption } from '@/components/menu/CustomerNoteChat';

export default function PublicMenuPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { publishedMenu: localMenu, store: localStore, products: localProducts, categories: localCategories } = useStore();

  const [store, setStore] = useState(localStore);
  const [publishedMenu, setPublishedMenu] = useState(localMenu);
  const [products, setProducts] = useState(localProducts);
  const [categories, setCategories] = useState(localCategories);

  useEffect(() => {
    setStore(localStore);
    setPublishedMenu(localMenu);
    setProducts(localProducts);
    setCategories(localCategories);
  }, [localStore, localMenu, localProducts, localCategories]);

  useEffect(() => {
    if (!slug) return;
    const fetchOnline = async () => {
      try {
        const res = await fetch(`/api/menu/${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            if (data.store) setStore(data.store);
            if (data.menu) setPublishedMenu(data.menu);
            if (data.products?.length) setProducts(data.products);
            if (data.categories?.length) setCategories(data.categories);
          }
        }
      } catch (e) {
        console.warn('Could not fetch public menu from cloud API:', e);
      }
    };
    fetchOnline();
  }, [slug]);

  const menuTheme: MenuTheme = publishedMenu.theme || {
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

  const getMaxWidthClass = () => {
    switch (menuTheme.contentMaxWidth) {
      case 'compact':
        return 'max-w-md';
      case 'standard':
        return 'max-w-2xl';
      case 'full':
        return 'max-w-6xl';
      case 'wide':
      default:
        return 'max-w-4xl';
    }
  };

  const getPageBackgroundStyle = (): React.CSSProperties => {
    if (menuTheme.backgroundType === 'gradient' && menuTheme.pageBgGradient) {
      return { background: menuTheme.pageBgGradient };
    }
    if (menuTheme.backgroundType === 'image' && menuTheme.pageBgImage) {
      return {
        backgroundImage: `url(${menuTheme.pageBgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
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
    };
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');

  // Customer Note / Chat state
  const [notedItems, setNotedItems] = useState<NoteItem[]>([]);
  const [isNoteChatOpen, setIsNoteChatOpen] = useState(false);
  const [addToast, setAddToast] = useState<string | null>(null);

  // Modal Selection States
  const [modalOptionSelections, setModalOptionSelections] = useState<Record<string, string>>({});
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [modalNote, setModalNote] = useState<string>('');

  // Load saved notes from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`mymenu_note_${slug || store.slug}`);
      if (saved) {
        setNotedItems(JSON.parse(saved));
      }
    } catch (e) {}
  }, [slug, store.slug]);

  // Save notes to LocalStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(`mymenu_note_${slug || store.slug}`, JSON.stringify(notedItems));
    } catch (e) {}
  }, [notedItems, slug, store.slug]);

  // When selectedProduct opens, initialize default option selections
  useEffect(() => {
    if (selectedProduct) {
      setModalQuantity(1);
      setModalNote('');
      const initialSelections: Record<string, string> = {};
      if (selectedProduct.option_groups) {
        selectedProduct.option_groups.forEach((group) => {
          if (group.options && group.options.length > 0) {
            initialSelections[group.id] = group.options[0].id;
          }
        });
      }
      setModalOptionSelections(initialSelections);
    }
  }, [selectedProduct]);

  // Calculate current modal unit price
  const calculateModalUnitPrice = (): number => {
    if (!selectedProduct) return 0;
    let price = selectedProduct.sale_price;
    if (selectedProduct.option_groups) {
      selectedProduct.option_groups.forEach((group) => {
        const selectedOptId = modalOptionSelections[group.id];
        if (selectedOptId) {
          const opt = group.options.find((o) => o.id === selectedOptId);
          if (opt && opt.additional_price) {
            price += opt.additional_price;
          }
        }
      });
    }
    return price;
  };

  // Add Item to Customer Notes
  const handleAddNoteItem = () => {
    if (!selectedProduct) return;

    const unitPrice = calculateModalUnitPrice();
    const chosenOptions: NoteItemOption[] = [];

    if (selectedProduct.option_groups) {
      selectedProduct.option_groups.forEach((group) => {
        const selectedOptId = modalOptionSelections[group.id];
        if (selectedOptId) {
          const opt = group.options.find((o) => o.id === selectedOptId);
          if (opt) {
            chosenOptions.push({
              groupName: group.name,
              optionName: opt.name,
              additionalPrice: opt.additional_price || 0,
            });
          }
        }
      });
    }

    const newItemId = 'note-' + Date.now();
    const newNoteItem: NoteItem = {
      id: newItemId,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      basePrice: selectedProduct.sale_price,
      selectedOptions: chosenOptions,
      unitPrice,
      quantity: modalQuantity,
      note: modalNote.trim() || undefined,
    };

    setNotedItems((prev) => [newNoteItem, ...prev]);
    setSelectedProduct(null);
    setAddToast(`จด "${selectedProduct.name}" (${modalQuantity} รายการ) เรียบร้อย!`);
    setTimeout(() => setAddToast(null), 2500);
  };

  // Quick note item from list with default options
  const handleQuickAddNote = (prod: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultOptions: NoteItemOption[] = [];
    let unitPrice = prod.sale_price;

    if (prod.option_groups && prod.option_groups.length > 0) {
      prod.option_groups.forEach((group) => {
        if (group.options && group.options.length > 0) {
          const firstOpt = group.options[0];
          defaultOptions.push({
            groupName: group.name,
            optionName: firstOpt.name,
            additionalPrice: firstOpt.additional_price || 0,
          });
          unitPrice += firstOpt.additional_price || 0;
        }
      });
    }

    const newItem: NoteItem = {
      id: 'note-' + Date.now(),
      productId: prod.id,
      productName: prod.name,
      basePrice: prod.sale_price,
      selectedOptions: defaultOptions,
      unitPrice,
      quantity: 1,
    };

    setNotedItems((prev) => [newItem, ...prev]);
    setAddToast(`จด "${prod.name}" เรียบร้อย!`);
    setTimeout(() => setAddToast(null), 2000);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setNotedItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as NoteItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setNotedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateItemNote = (id: string, note: string) => {
    setNotedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note } : item))
    );
  };

  const handleAddCustomItem = (name: string, note?: string) => {
    if (!name.trim()) return;
    const newItem: NoteItem = {
      id: 'custom-' + Date.now(),
      productId: 'custom-' + Date.now(),
      productName: name.trim(),
      basePrice: 0,
      selectedOptions: [],
      unitPrice: 0,
      quantity: 1,
      note: note || undefined,
    };
    setNotedItems((prev) => [newItem, ...prev]);
    setAddToast(`จด "${name.trim()}" เรียบร้อย!`);
    setTimeout(() => setAddToast(null), 2000);
  };

  const handleClearAllNotes = () => {
    if (window.confirm('คุณต้องการล้างรายการที่จดไว้ทั้งหมดหรือไม่?')) {
      setNotedItems([]);
    }
  };

  // Filter sections
  const sections = [...(publishedMenu.sections || [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        navigator.share({
          title: store.name,
          text: `ดูเมนูอาหารออนไลน์ของร้าน ${store.name}`,
          url: window.location.href,
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    }
  };

  const renderSection = (section: MenuSection) => {
    const { type, content, styles = {} } = section;

    const containerStyle: React.CSSProperties = {
      marginTop: styles.margin?.top !== undefined ? `${styles.margin.top}px` : undefined,
      marginRight: styles.margin?.right !== undefined ? `${styles.margin.right}px` : undefined,
      marginBottom: styles.margin?.bottom !== undefined ? `${styles.margin.bottom}px` : '16px',
      marginLeft: styles.margin?.left !== undefined ? `${styles.margin.left}px` : undefined,
      paddingTop: styles.padding?.top !== undefined ? `${styles.padding.top}px` : undefined,
      paddingRight: styles.padding?.right !== undefined ? `${styles.padding.right}px` : '16px',
      paddingBottom: styles.padding?.bottom !== undefined ? `${styles.padding.bottom}px` : undefined,
      paddingLeft: styles.padding?.left !== undefined ? `${styles.padding.left}px` : '16px',
    };

    const sectionIdSafe = `sec-${section.id.replace(/[^a-zA-Z0-9_-]/g, '')}`;

    const typoStyle: React.CSSProperties = {
      fontWeight: styles.fontWeight || 400,
      color: styles.color || menuTheme.textColor || '#18181B',
      textAlign: styles.textAlign || 'left',
      lineHeight: styles.lineHeight || 1.4,
      letterSpacing: styles.letterSpacing !== undefined ? `${styles.letterSpacing}px` : undefined,
    };

    return (
      <div key={section.id} style={containerStyle}>
        <style>{`
          .${sectionIdSafe}-typo {
            font-size: ${styles.fontSizeMobile || styles.fontSize || 16}px;
          }
          @media (min-width: 640px) {
            .${sectionIdSafe}-typo {
              font-size: ${styles.fontSize || styles.fontSizeMobile || 16}px;
            }
          }
          .${sectionIdSafe}-pname {
            font-size: ${styles.productNameFontSizeMobile || styles.productNameFontSize || 15}px;
          }
          @media (min-width: 640px) {
            .${sectionIdSafe}-pname {
              font-size: ${styles.productNameFontSize || styles.productNameFontSizeMobile || 16}px;
            }
          }
          .${sectionIdSafe}-price {
            font-size: ${styles.priceFontSizeMobile || styles.priceFontSize || 16}px;
          }
          @media (min-width: 640px) {
            .${sectionIdSafe}-price {
              font-size: ${styles.priceFontSize || styles.priceFontSizeMobile || 17}px;
            }
          }
        `}</style>

        {/* 1. STORE NAME */}
        {type === 'store_name' && (
          <h1 style={typoStyle} className={`font-display ${sectionIdSafe}-typo`}>
            {content.text || store.name}
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
          <p style={typoStyle} className={sectionIdSafe + '-typo'}>
            {content.text || store.description}
          </p>
        )}

        {/* 4. IMAGE / BANNER */}
        {type === 'image' && (
          <div
            className={`overflow-hidden ${
              styles.alignment === 'left'
                ? 'mr-auto'
                : styles.alignment === 'right'
                ? 'ml-auto'
                : 'mx-auto'
            }`}
            style={{
              borderRadius: styles.borderRadius !== undefined ? `${styles.borderRadius}px` : '12px',
              width: typeof styles.width === 'number' ? `${styles.width}px` : styles.width || '100%',
            }}
          >
            <div
              className={`relative w-full ${
                styles.aspectRatio === '1:1'
                  ? 'aspect-square'
                  : styles.aspectRatio === '4:5'
                  ? 'aspect-[4/5]'
                  : styles.aspectRatio === '16:9'
                  ? 'aspect-video'
                  : ''
              }`}
            >
              <img
                src={content.url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&auto=format&fit=crop&q=80'}
                alt={content.alt || 'Banner'}
                style={{
                  objectFit: styles.objectFit || 'cover',
                }}
                className="w-full h-full"
                loading="lazy"
              />
            </div>
          </div>
        )}

        {/* 5. TEXT / SECTION HEADER */}
        {type === 'text' && (
          <div style={typoStyle} className={`font-display ${sectionIdSafe}-typo`}>
            {content.text}
          </div>
        )}

        {/* 6. CATEGORY SLIDER */}
        {type === 'category_slider' && (
          <div
            className="w-full overflow-x-auto pb-1 scrollbar-none scroll-smooth select-none"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
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
                  onClick={() => setActiveCategoryId('all')}
                  className={`px-4 py-2 font-medium text-xs whitespace-nowrap transition-all ${
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
                        ? styles.activeTabBgColor || menuTheme.accentColor || '#FF5A36'
                        : styles.tabStyle === 'underline'
                        ? 'transparent'
                        : styles.inactiveTabBgColor || (menuTheme.isDark ? '#27272A' : '#F4F4F5'),
                    color:
                      activeCategoryId === 'all'
                        ? styles.activeTabTextColor || '#FFFFFF'
                        : styles.inactiveTabTextColor || menuTheme.textMutedColor || '#52525B',
                    borderColor:
                      activeCategoryId === 'all'
                        ? styles.activeTabBgColor || menuTheme.accentColor || '#FF5A36'
                        : menuTheme.cardBorderColor || '#E4E4E7',
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
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`px-4 py-2 font-medium text-xs whitespace-nowrap transition-all ${
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
                          ? styles.activeTabBgColor || menuTheme.accentColor || '#FF5A36'
                          : styles.tabStyle === 'underline'
                          ? 'transparent'
                          : styles.inactiveTabBgColor || (menuTheme.isDark ? '#27272A' : '#F4F4F5'),
                      color:
                        isActive
                          ? styles.activeTabTextColor || '#FFFFFF'
                          : styles.inactiveTabTextColor || menuTheme.textMutedColor || '#52525B',
                      borderColor:
                        isActive
                          ? styles.activeTabBgColor || menuTheme.accentColor || '#FF5A36'
                          : menuTheme.cardBorderColor || '#E4E4E7',
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
            // Auto Mode: All active products
            displayProducts = products.filter((p) => p.status === 'active');
          }

          if (activeCategoryId !== 'all') {
            displayProducts = displayProducts.filter((p) => p.category_id === activeCategoryId);
          }

          if (searchQuery) {
            displayProducts = displayProducts.filter((p) =>
              p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }

          const displayMode = content.display || 'image-text-price';

          return (
            <div
              className="grid grid-cols-1 sm:grid-cols-2"
              style={{
                gap: styles.gap !== undefined ? `${styles.gap}px` : '16px',
              }}
            >
              {displayProducts.map((prod) => {
                // Display Style: Image + Text + Price
                if (displayMode === 'image-text-price') {
                  return (
                    <div
                      key={prod.id}
                      onClick={() => setSelectedProduct(prod)}
                      className="rounded-none border p-3 flex gap-3.5 hover:shadow-xs active:scale-[0.99] transition-all cursor-pointer items-center group relative"
                      style={{
                        backgroundColor: menuTheme.cardBgColor || '#FFFFFF',
                        borderColor: menuTheme.cardBorderColor || '#E4E4E7',
                        borderRadius: styles.borderRadius ? `${styles.borderRadius}px` : '0px',
                      }}
                    >
                      <div
                        className={`relative w-20 h-20 flex-shrink-0 overflow-hidden bg-zinc-100 rounded-none ${
                          styles.imageRatio === '4:5'
                            ? 'aspect-[4/5] h-24'
                            : styles.imageRatio === '16:9'
                            ? 'aspect-video w-24'
                            : 'aspect-square'
                        }`}
                      >
                        <img
                          src={prod.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&fit=crop'}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <h4
                            className={`font-semibold truncate font-display ${sectionIdSafe}-pname`}
                            style={{
                              color: styles.productNameColor || menuTheme.textColor || '#18181B',
                            }}
                          >
                            {prod.name}
                          </h4>
                          {prod.option_groups && prod.option_groups.length > 0 && (
                            <p
                              className="text-[11px] mt-0.5 truncate"
                              style={{ color: menuTheme.textMutedColor || '#71717A' }}
                            >
                              {prod.option_groups.map((g) => g.name).join(' • ')}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-baseline gap-2">
                            <span
                              className={`font-bold font-display ${sectionIdSafe}-price`}
                              style={{
                                color: styles.priceColor || menuTheme.priceColor || '#FF5A36',
                              }}
                            >
                              ฿{prod.sale_price}
                            </span>
                            {prod.regular_price && (
                              <span
                                className="text-xs line-through"
                                style={{
                                  color: styles.regularPriceColor || menuTheme.textMutedColor || '#A1A1AA',
                                }}
                              >
                                ฿{prod.regular_price}
                              </span>
                            )}
                          </div>

                          {/* Quick Note Add Button */}
                          <button
                            type="button"
                            onClick={(e) => handleQuickAddNote(prod, e)}
                            className="w-7 h-7 bg-orange-50 hover:bg-primary-500 text-primary-600 hover:text-white rounded-lg flex items-center justify-center transition-all border border-orange-200/80 shadow-2xs"
                            title="จดเมนูนี้"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Display Style: Text + Price
                return (
                  <div
                    key={prod.id}
                    onClick={() => setSelectedProduct(prod)}
                    className="flex items-baseline justify-between py-2.5 border-b hover:opacity-85 px-2 rounded-none transition-colors cursor-pointer group"
                    style={{
                      borderColor: menuTheme.cardBorderColor || '#E4E4E7',
                    }}
                  >
                    <div className="pr-4 flex-1">
                      <span
                        className={`font-semibold group-hover:text-primary-600 transition-colors block ${sectionIdSafe}-pname`}
                        style={{
                          color: styles.productNameColor || menuTheme.textColor || '#18181B',
                        }}
                      >
                        {prod.name}
                      </span>
                      {prod.option_groups && prod.option_groups.length > 0 && (
                        <span
                          className="text-[11px] block mt-0.5"
                          style={{ color: menuTheme.textMutedColor || '#71717A' }}
                        >
                          {prod.option_groups.map((g) => g.name).join(', ')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`font-bold font-display ${sectionIdSafe}-price`}
                          style={{
                            color: styles.priceColor || menuTheme.priceColor || '#18181B',
                          }}
                        >
                          ฿{prod.sale_price}
                        </span>
                        {prod.regular_price && (
                          <span
                            className="text-xs line-through"
                            style={{
                              color: styles.regularPriceColor || menuTheme.textMutedColor || '#A1A1AA',
                            }}
                          >
                            ฿{prod.regular_price}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleQuickAddNote(prod, e)}
                        className="w-6 h-6 bg-zinc-100 hover:bg-primary-500 text-dark-secondary hover:text-white rounded flex items-center justify-center transition-all"
                        title="จดเมนูนี้"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    );
  };

  const modalUnitPrice = calculateModalUnitPrice();
  const modalTotalPrice = modalUnitPrice * modalQuantity;

  return (
    <div
      className="min-h-screen flex flex-col items-center font-sans antialiased transition-colors"
      style={{
        ...getPageBackgroundStyle(),
        color: menuTheme.textColor || '#18181B',
      }}
    >
      {/* Top Floating Search & Share Header */}
      <div
        className={`sticky top-0 z-30 w-full ${getMaxWidthClass()} backdrop-blur-md border-b px-4 py-2.5 flex items-center gap-2 transition-all`}
        style={{
          backgroundColor: menuTheme.isDark ? 'rgba(18, 18, 20, 0.92)' : 'rgba(255, 255, 255, 0.92)',
          borderColor: menuTheme.cardBorderColor || '#E4E4E7',
        }}
      >
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
          <input
            type="text"
            placeholder={`ค้นหาเมนูใน ${store.name}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all border"
            style={{
              backgroundColor: menuTheme.isDark ? '#27272A' : '#F4F4F5',
              color: menuTheme.textColor || '#18181B',
              borderColor: menuTheme.cardBorderColor || '#E4E4E7',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dark-muted hover:text-dark-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={handleShare}
          className="p-2 rounded-xl hover:opacity-80 border transition-colors flex-shrink-0"
          style={{
            borderColor: menuTheme.cardBorderColor || '#E4E4E7',
            backgroundColor: menuTheme.cardBgColor || '#FFFFFF',
            color: menuTheme.textColor || '#18181B',
          }}
          title="แชร์ลิงก์เมนู"
        >
          {copiedLink ? (
            <Check className="w-4 h-4 text-emerald-500" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Main Container */}
      <main
        className={`w-full ${getMaxWidthClass()} min-h-screen shadow-sm pb-28 transition-colors`}
        style={{
          backgroundColor: menuTheme.pageBgColor || '#FFFFFF',
          ...getPageBackgroundStyle(),
        }}
      >
        {sections.length === 0 ? (
          <div className="py-24 text-center text-dark-muted px-4">
            <Utensils className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
            <p className="font-semibold text-sm">ยังไม่มีรายการเมนูที่เปิดให้บริการ</p>
          </div>
        ) : (
          sections.map(renderSection)
        )}
      </main>

      {/* Toast Notification */}
      {addToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white px-4 py-2.5 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-2 animate-fade-in border border-zinc-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{addToast}</span>
        </div>
      )}

      {/* Interactive Product Detail & Options Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-border flex flex-col max-h-[92vh]"
          >
            {/* 1:1 Aspect Ratio Square Image */}
            <div className="relative aspect-square w-full max-h-[360px] bg-zinc-100 flex-shrink-0">
              <img
                src={selectedProduct.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&fit=crop'}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content & Options */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <h3 className="text-xl font-bold text-dark-primary font-display">
                  {selectedProduct.name}
                </h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold text-primary-500 font-display">
                    ฿{selectedProduct.sale_price}
                  </span>
                  {selectedProduct.regular_price && (
                    <span className="text-sm text-dark-muted line-through">
                      ฿{selectedProduct.regular_price}
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic Option Groups Selection */}
              {selectedProduct.option_groups && selectedProduct.option_groups.length > 0 && (
                <div className="space-y-4 pt-3 border-t border-border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-dark-secondary">
                    เลือกรายละเอียดเมนูอาหาร
                  </h4>
                  {selectedProduct.option_groups.map((group) => (
                    <div key={group.id} className="p-3.5 bg-zinc-50 rounded-2xl border border-border/80 space-y-2">
                      <p className="text-xs font-bold text-dark-primary flex items-center justify-between">
                        <span>{group.name}</span>
                        <span className="text-[10px] text-primary-600 bg-orange-50 px-1.5 py-0.2 rounded font-normal">
                          เลือก 1 ข้อ
                        </span>
                      </p>
                      <div className="space-y-1.5">
                        {group.options.map((opt) => {
                          const isSelected = modalOptionSelections[group.id] === opt.id;
                          return (
                            <label
                              key={opt.id}
                              onClick={() =>
                                setModalOptionSelections((prev) => ({ ...prev, [group.id]: opt.id }))
                              }
                              className={`flex items-center justify-between text-xs py-2 px-3 rounded-xl border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-orange-50/80 border-primary-500 text-primary-800 font-semibold shadow-2xs'
                                  : 'bg-white border-border text-dark-secondary hover:bg-zinc-100'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                    isSelected
                                      ? 'border-primary-500 bg-primary-500 text-white'
                                      : 'border-zinc-300 bg-white'
                                  }`}
                                >
                                  {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                </div>
                                <span>{opt.name}</span>
                              </div>
                              <span
                                className={`font-mono text-[11px] ${
                                  opt.additional_price > 0 ? 'text-primary-600 font-bold' : 'text-zinc-400'
                                }`}
                              >
                                {opt.additional_price > 0 ? `+฿${opt.additional_price}` : 'ฟรี'}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Special Note / Request */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-semibold text-dark-secondary">
                  หมายเหตุเพิ่มเติม (ถ้ามี)
                </label>
                <input
                  type="text"
                  placeholder="เช่น ไม่ใส่ผัก, เผ็ดน้อยมาก, แยกน้ำ..."
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            {/* Modal Bottom Sticky Bar: Stepper & Add Button */}
            <div className="p-4 border-t border-border bg-white flex items-center gap-3 flex-shrink-0">
              {/* Stepper */}
              <div className="flex items-center gap-2 bg-zinc-100 border border-border rounded-2xl p-1">
                <button
                  type="button"
                  onClick={() => setModalQuantity((prev) => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-xl bg-white text-dark-primary font-bold flex items-center justify-center hover:bg-zinc-200 active:scale-90 shadow-2xs transition-all"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-bold text-sm font-mono text-dark-primary">
                  {modalQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => setModalQuantity((prev) => prev + 1)}
                  className="w-8 h-8 rounded-xl bg-white text-dark-primary font-bold flex items-center justify-center hover:bg-zinc-200 active:scale-90 shadow-2xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add Note Button */}
              <button
                type="button"
                onClick={handleAddNoteItem}
                className="flex-1 py-3 px-4 bg-primary-500 hover:bg-primary-600 active:scale-[0.99] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-between"
              >
                <span>จดเมนูนี้ ({modalQuantity} รายการ)</span>
                <span className="font-mono font-extrabold text-sm">
                  ฿{modalTotalPrice.toLocaleString()}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat / Note Drawer (Bottom-Right) */}
      <CustomerNoteChat
        store={store}
        notedItems={notedItems}
        onUpdateQuantity={handleUpdateQuantity}
        onUpdateNote={handleUpdateItemNote}
        onAddCustomItem={handleAddCustomItem}
        onRemoveItem={handleRemoveItem}
        onClearAll={handleClearAllNotes}
        isOpen={isNoteChatOpen}
        onToggleOpen={() => setIsNoteChatOpen(!isNoteChatOpen)}
      />
    </div>
  );
}
