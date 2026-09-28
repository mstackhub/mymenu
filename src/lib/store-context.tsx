'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Store,
  Category,
  Product,
  Menu,
  MenuSection,
  MenuTheme,
  SectionType,
  SectionStyles,
  OptionGroup,
  ProductOption,
} from '@/types';
import {
  DEFAULT_STORE,
  DEFAULT_CATEGORIES,
  DEFAULT_PRODUCTS,
  DEFAULT_MENU,
  DEFAULT_MENU_SECTIONS,
} from '@/lib/default-data';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  store_id?: string;
}

interface StoreContextType {
  // Auth
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  signup: (email: string, pass: string, name: string, storeName?: string) => Promise<boolean>;

  // Store
  store: Store;
  updateStore: (data: Partial<Store>) => void;
  generateSlug: (name: string) => string;

  // Categories
  categories: Category[];
  addCategory: (name: string) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (newOrder: Category[]) => void;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  reorderProducts: (newOrder: Product[]) => void;

  // Menu & Builder
  draftMenu: Menu;
  publishedMenu: Menu;
  selectedSectionId: string | null;
  setSelectedSectionId: (id: string | null) => void;
  addSection: (type: SectionType) => void;
  updateSection: (id: string, updates: Partial<MenuSection>) => void;
  updateSectionStyles: (id: string, styles: Partial<SectionStyles>) => void;
  updateSectionContent: (id: string, content: any) => void;
  deleteSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  reorderSections: (newSections: MenuSection[]) => void;
  saveDraftMenu: () => void;
  publishMenu: () => void;
  updateMenuTheme: (theme: Partial<MenuTheme>) => void;
  
  // Helpers
  getPublicMenuBySlug: (slug: string) => { menu: Menu; store: Store; products: Product[]; categories: Category[] } | null;
  resetToDefault: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY_STORE = 'mymenu_store_v1';
const STORAGE_KEY_CATEGORIES = 'mymenu_categories_v1';
const STORAGE_KEY_PRODUCTS = 'mymenu_products_v1';
const STORAGE_KEY_DRAFT_MENU = 'mymenu_draft_menu_v1';
const STORAGE_KEY_PUBLISHED_MENU = 'mymenu_published_menu_v1';
const STORAGE_KEY_USER = 'mymenu_user_v1';

const sanitizeSections = (sections?: MenuSection[]): MenuSection[] => {
  if (!sections || !Array.isArray(sections)) return [];
  const seenIds = new Set<string>();
  return sections.map((sec, idx) => {
    let id = sec.id;
    if (!id || seenIds.has(id)) {
      id = `sec-${idx + 1}-${Math.random().toString(36).substring(2, 6)}`;
    }
    seenIds.add(id);
    return {
      ...sec,
      id,
      sort_order: sec.sort_order ?? (idx + 1),
    };
  });
};

const sanitizeTheme = (theme?: MenuTheme): MenuTheme | undefined => {
  if (!theme) return undefined;
  const removedPresets = ['midnight-luxury', 'charcoal-slate', 'dark-gold', 'deep-ocean', 'modern-dots', 'modern-grid'];
  if (theme.isDark || theme.backgroundType === 'pattern' || (theme.presetId && removedPresets.includes(theme.presetId))) {
    return {
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
      contentMaxWidth: theme.contentMaxWidth || 'wide',
    };
  }
  return { ...theme, isDark: false };
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [store, setStore] = useState<Store>(DEFAULT_STORE);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [draftMenu, setDraftMenu] = useState<Menu>(DEFAULT_MENU);
  const [publishedMenu, setPublishedMenu] = useState<Menu>(DEFAULT_MENU);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>('sec-01');

  // Helper to sync to Turso DB
  const syncToTurso = async (dataOverride?: {
    store?: Store;
    categories?: Category[];
    products?: Product[];
    draftMenu?: Menu;
    publishedMenu?: Menu;
  }) => {
    try {
      const payload = {
        store: dataOverride?.store || store,
        categories: dataOverride?.categories || categories,
        products: dataOverride?.products || products,
        draftMenu: dataOverride?.draftMenu || draftMenu,
        publishedMenu: dataOverride?.publishedMenu || publishedMenu,
      };

      await fetch('/api/db/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn('Failed to sync data to Turso:', e);
    }
  };

  // Load from localStorage or Turso on mount
  useEffect(() => {
    const initAndLoad = async () => {
      let initialStore = DEFAULT_STORE;
      let initialCats = DEFAULT_CATEGORIES;
      let initialProds = DEFAULT_PRODUCTS;
      let initialDraft = DEFAULT_MENU;
      let initialPublished = DEFAULT_MENU;

      try {
        const savedUserStr = localStorage.getItem(STORAGE_KEY_USER);
        let activeUser: UserProfile | null = null;
        if (savedUserStr) {
          try {
            activeUser = JSON.parse(savedUserStr);
            setUser(activeUser);
          } catch (e) {}
        }

        const savedStore = localStorage.getItem(STORAGE_KEY_STORE);
        if (savedStore) {
          initialStore = JSON.parse(savedStore);
          setStore(initialStore);
        }

        const savedCats = localStorage.getItem(STORAGE_KEY_CATEGORIES);
        if (savedCats) {
          initialCats = JSON.parse(savedCats);
          setCategories(initialCats);
        }

        const savedProds = localStorage.getItem(STORAGE_KEY_PRODUCTS);
        if (savedProds) {
          initialProds = JSON.parse(savedProds);
          setProducts(initialProds);
        }

        const savedDraft = localStorage.getItem(STORAGE_KEY_DRAFT_MENU);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed.sections) parsed.sections = sanitizeSections(parsed.sections);
          if (parsed.theme) parsed.theme = sanitizeTheme(parsed.theme);
          initialDraft = parsed;
          setDraftMenu(parsed);
        }

        const savedPublished = localStorage.getItem(STORAGE_KEY_PUBLISHED_MENU);
        if (savedPublished) {
          const parsed = JSON.parse(savedPublished);
          if (parsed.sections) parsed.sections = sanitizeSections(parsed.sections);
          if (parsed.theme) parsed.theme = sanitizeTheme(parsed.theme);
          initialPublished = parsed;
          setPublishedMenu(parsed);
        }

        // Initialize Turso & fetch cloud data
        await fetch('/api/db/init', { method: 'POST' });
        const syncUrl = activeUser ? `/api/db/sync?user_id=${activeUser.id}&store_id=${activeUser.store_id || ''}` : '/api/db/sync';
        const syncRes = await fetch(syncUrl);
        if (syncRes.ok) {
          const dbData = await syncRes.json();
          if (dbData.success && dbData.store) {
            setStore(dbData.store);
            setCategories(dbData.categories || []);
            setProducts(dbData.products || []);
            if (dbData.draftMenu) setDraftMenu(dbData.draftMenu);
            if (dbData.publishedMenu) setPublishedMenu(dbData.publishedMenu);
          } else if (dbData.empty) {
            // Push current state to initialize cloud DB
            syncToTurso({
              store: initialStore,
              categories: initialCats,
              products: initialProds,
              draftMenu: initialDraft,
              publishedMenu: initialPublished,
            });
          }
        }
      } catch (err) {
        console.error('Error loading initial data', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAndLoad();
  }, []);

  // Save changes to localStorage whenever state updates + background sync to Turso
  useEffect(() => {
    if (isLoading) return;
    try {
      localStorage.setItem(STORAGE_KEY_STORE, JSON.stringify(store));
    } catch (e) {}
  }, [store, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch (e) {}
  }, [categories, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch (e) {}
  }, [products, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    try {
      localStorage.setItem(STORAGE_KEY_DRAFT_MENU, JSON.stringify(draftMenu));
    } catch (e) {}
  }, [draftMenu, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    try {
      localStorage.setItem(STORAGE_KEY_PUBLISHED_MENU, JSON.stringify(publishedMenu));
    } catch (e) {}
  }, [publishedMenu, isLoading]);

  // Debounced cloud sync to Turso
  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      syncToTurso();
    }, 1500);
    return () => clearTimeout(timer);
  }, [store, categories, products, draftMenu, publishedMenu, isLoading]);

  // Auth functions
  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        setStore(data.store);
        setCategories(data.categories || []);
        setProducts(data.products || []);
        if (data.draftMenu) setDraftMenu(data.draftMenu);
        if (data.publishedMenu) setPublishedMenu(data.publishedMenu);

        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
        localStorage.setItem(STORAGE_KEY_STORE, JSON.stringify(data.store));
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(data.categories || []));
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(data.products || []));
        if (data.draftMenu) localStorage.setItem(STORAGE_KEY_DRAFT_MENU, JSON.stringify(data.draftMenu));
        if (data.publishedMenu) localStorage.setItem(STORAGE_KEY_PUBLISHED_MENU, JSON.stringify(data.publishedMenu));
        return true;
      } else {
        throw new Error(data.error || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, pass: string, name: string, storeName?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass, name, storeName }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Fresh clean store for new user without fake products
        setUser(data.user);
        setStore(data.store);
        setCategories([]);
        setProducts([]);
        if (data.draftMenu) setDraftMenu(data.draftMenu);
        setPublishedMenu(data.draftMenu);

        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
        localStorage.setItem(STORAGE_KEY_STORE, JSON.stringify(data.store));
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify([]));
        if (data.draftMenu) localStorage.setItem(STORAGE_KEY_DRAFT_MENU, JSON.stringify(data.draftMenu));
        return true;
      } else {
        throw new Error(data.error || 'ไม่สามารถลงทะเบียนได้');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_STORE);
    localStorage.removeItem(STORAGE_KEY_CATEGORIES);
    localStorage.removeItem(STORAGE_KEY_PRODUCTS);
    localStorage.removeItem(STORAGE_KEY_DRAFT_MENU);
    localStorage.removeItem(STORAGE_KEY_PUBLISHED_MENU);
  };

  // Helper to generate slug from store name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'my-store';
  };

  // Store Management
  const updateStore = (data: Partial<Store>) => {
    setStore((prev) => {
      const updated = {
        ...prev,
        ...data,
        updated_at: new Date().toISOString(),
      };
      // If store slug changes, also sync draftMenu and publishedMenu slugs
      if (data.slug && data.slug !== prev.slug) {
        setDraftMenu((dm) => ({ ...dm, slug: data.slug! }));
        setPublishedMenu((pm) => ({ ...pm, slug: data.slug! }));
      }
      return updated;
    });
  };

  // Categories Management
  const addCategory = (name: string) => {
    const newCat: Category = {
      id: 'cat-' + Date.now(),
      store_id: store.id,
      name,
      sort_order: categories.length + 1,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const updateCategory = (id: string, data: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id
          ? { ...cat, ...data, updated_at: new Date().toISOString() }
          : cat
      )
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  const reorderCategories = (newOrder: Category[]) => {
    const updated = newOrder.map((cat, index) => ({
      ...cat,
      sort_order: index + 1,
      updated_at: new Date().toISOString(),
    }));
    setCategories(updated);
  };

  // Products Management
  const addProduct = (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    const newProduct: Product = {
      ...productData,
      id: 'prod-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((prod) =>
        prod.id === id
          ? { ...prod, ...data, updated_at: new Date().toISOString() }
          : prod
      )
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((prod) => prod.id !== id));
  };

  const reorderProducts = (newOrder: Product[]) => {
    const updated = newOrder.map((prod, index) => ({
      ...prod,
      sort_order: index + 1,
      updated_at: new Date().toISOString(),
    }));
    setProducts(updated);
  };

  // Menu Builder Actions
  const addSection = (type: SectionType) => {
    const newId = 'sec-' + Date.now();
    let defaultContent: any = {};
    let defaultStyles: SectionStyles = {
      margin: { top: 0, right: 0, bottom: 16, left: 0 },
      padding: { top: 0, right: 16, bottom: 0, left: 16 },
    };

    switch (type) {
      case 'store_name':
        defaultContent = {};
        defaultStyles = {
          fontSize: 26,
          fontWeight: 700,
          color: '#18181B',
          textAlign: 'center',
          lineHeight: 1.3,
          margin: { top: 8, right: 0, bottom: 4, left: 0 },
          padding: { top: 0, right: 16, bottom: 0, left: 16 },
        };
        break;
      case 'logo':
        defaultContent = {};
        defaultStyles = {
          width: 80,
          alignment: 'center',
          borderRadius: 999,
          margin: { top: 20, right: 0, bottom: 8, left: 0 },
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
        };
        break;
      case 'description':
        defaultContent = {};
        defaultStyles = {
          fontSize: 14,
          fontWeight: 400,
          color: '#71717A',
          textAlign: 'center',
          lineHeight: 1.5,
          margin: { top: 0, right: 0, bottom: 16, left: 0 },
          padding: { top: 0, right: 16, bottom: 0, left: 16 },
        };
        break;
      case 'image':
        defaultContent = {
          url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&auto=format&fit=crop&q=80',
          alt: 'รูปภาพอาหารแบนเนอร์',
        };
        defaultStyles = {
          width: '100%',
          aspectRatio: '16:9',
          objectFit: 'cover',
          borderRadius: 12,
          alignment: 'center',
          margin: { top: 0, right: 0, bottom: 16, left: 0 },
          padding: { top: 0, right: 16, bottom: 0, left: 16 },
        };
        break;
      case 'text':
        defaultContent = {
          text: 'หัวข้อใหม่ / ข้อความประชาสัมพันธ์',
        };
        defaultStyles = {
          fontSize: 20,
          fontWeight: 700,
          color: '#18181B',
          textAlign: 'left',
          lineHeight: 1.4,
          margin: { top: 12, right: 0, bottom: 8, left: 0 },
          padding: { top: 0, right: 16, bottom: 0, left: 16 },
        };
        break;
      case 'product_list':
        // select top 3 products by default
        defaultContent = {
          productIds: products.slice(0, 3).map((p) => p.id),
          display: 'image-text-price',
        };
        defaultStyles = {
          gap: 16,
          productNameFontSize: 16,
          productNameColor: '#18181B',
          priceFontSize: 16,
          priceColor: '#FF5A36',
          regularPriceColor: '#A1A1AA',
          borderRadius: 12,
          imageRatio: '1:1',
          margin: { top: 0, right: 0, bottom: 24, left: 0 },
          padding: { top: 0, right: 16, bottom: 0, left: 16 },
        };
        break;
      case 'category_slider':
        defaultContent = {
          showAll: true,
          allLabel: 'ทั้งหมด',
        };
        defaultStyles = {
          tabStyle: 'pill',
          activeTabBgColor: '#FF5A36',
          activeTabTextColor: '#FFFFFF',
          inactiveTabBgColor: '#F4F4F5',
          inactiveTabTextColor: '#52525B',
          fontSize: 13,
          fontWeight: 600,
          margin: { top: 8, right: 0, bottom: 16, left: 0 },
          padding: { top: 0, right: 16, bottom: 0, left: 16 },
        };
        break;
    }

    const newSection: MenuSection = {
      id: newId,
      menu_id: draftMenu.id,
      type,
      sort_order: (draftMenu.sections?.length || 0) + 1,
      content: defaultContent,
      styles: defaultStyles,
    };

    setDraftMenu((prev) => ({
      ...prev,
      sections: [...(prev.sections || []), newSection],
      updated_at: new Date().toISOString(),
    }));
    setSelectedSectionId(newId);
  };

  const updateSection = (id: string, updates: Partial<MenuSection>) => {
    setDraftMenu((prev) => ({
      ...prev,
      sections: (prev.sections || []).map((sec) =>
        sec.id === id ? { ...sec, ...updates, updated_at: new Date().toISOString() } : sec
      ),
      updated_at: new Date().toISOString(),
    }));
  };

  const updateSectionStyles = (id: string, styles: Partial<SectionStyles>) => {
    setDraftMenu((prev) => ({
      ...prev,
      sections: (prev.sections || []).map((sec) =>
        sec.id === id
          ? {
              ...sec,
              styles: {
                ...sec.styles,
                ...styles,
                margin: styles.margin
                  ? { ...(sec.styles.margin || { top: 0, right: 0, bottom: 0, left: 0 }), ...styles.margin }
                  : sec.styles.margin,
                padding: styles.padding
                  ? { ...(sec.styles.padding || { top: 0, right: 0, bottom: 0, left: 0 }), ...styles.padding }
                  : sec.styles.padding,
              },
              updated_at: new Date().toISOString(),
            }
          : sec
      ),
      updated_at: new Date().toISOString(),
    }));
  };

  const updateSectionContent = (id: string, content: any) => {
    setDraftMenu((prev) => ({
      ...prev,
      sections: (prev.sections || []).map((sec) =>
        sec.id === id
          ? {
              ...sec,
              content: { ...sec.content, ...content },
              updated_at: new Date().toISOString(),
            }
          : sec
      ),
      updated_at: new Date().toISOString(),
    }));
  };

  const deleteSection = (id: string) => {
    setDraftMenu((prev) => {
      const remaining = (prev.sections || []).filter((sec) => sec.id !== id);
      return {
        ...prev,
        sections: remaining,
        updated_at: new Date().toISOString(),
      };
    });
    if (selectedSectionId === id) {
      setSelectedSectionId(null);
    }
  };

  const duplicateSection = (id: string) => {
    const target = draftMenu.sections?.find((s) => s.id === id);
    if (!target) return;
    const newId = 'sec-' + Date.now();
    const duplicated: MenuSection = {
      ...JSON.parse(JSON.stringify(target)),
      id: newId,
      sort_order: (draftMenu.sections?.length || 0) + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setDraftMenu((prev) => ({
      ...prev,
      sections: [...(prev.sections || []), duplicated],
      updated_at: new Date().toISOString(),
    }));
    setSelectedSectionId(newId);
  };

  const reorderSections = (newSections: MenuSection[]) => {
    const updated = newSections.map((sec, index) => ({
      ...sec,
      sort_order: index + 1,
    }));
    setDraftMenu((prev) => ({
      ...prev,
      sections: updated,
      updated_at: new Date().toISOString(),
    }));
  };

  const saveDraftMenu = () => {
    const updated = {
      ...draftMenu,
      status: 'draft' as const,
      updated_at: new Date().toISOString(),
    };
    setDraftMenu(updated);
    localStorage.setItem(STORAGE_KEY_DRAFT_MENU, JSON.stringify(updated));
    syncToTurso({ draftMenu: updated });
  };

  const publishMenu = () => {
    const now = new Date().toISOString();
    const published: Menu = {
      ...JSON.parse(JSON.stringify(draftMenu)),
      status: 'published',
      slug: store.slug,
      published_at: now,
      updated_at: now,
    };
    setPublishedMenu(published);
    setDraftMenu((prev) => ({ ...prev, status: 'published', published_at: now }));
    localStorage.setItem(STORAGE_KEY_PUBLISHED_MENU, JSON.stringify(published));
    localStorage.setItem(STORAGE_KEY_DRAFT_MENU, JSON.stringify(published));
    syncToTurso({ publishedMenu: published, draftMenu: { ...draftMenu, status: 'published', published_at: now } });
  };

  const updateMenuTheme = (themeUpdates: Partial<MenuTheme>) => {
    setDraftMenu((prev) => {
      const currentTheme = prev.theme || {
        backgroundType: 'color',
        pageBgColor: '#FFFFFF',
        contentMaxWidth: 'wide',
      };
      const newTheme: MenuTheme = {
        ...currentTheme,
        ...themeUpdates,
      };
      return {
        ...prev,
        theme: newTheme,
        updated_at: new Date().toISOString(),
      };
    });
  };

  // Get Public Menu by slug
  const getPublicMenuBySlug = (slug: string) => {
    if (publishedMenu.slug === slug || store.slug === slug) {
      return {
        menu: publishedMenu,
        store,
        products,
        categories,
      };
    }
    return null;
  };

  const resetToDefault = () => {
    setStore(DEFAULT_STORE);
    setCategories(DEFAULT_CATEGORIES);
    setProducts(DEFAULT_PRODUCTS);
    setDraftMenu(DEFAULT_MENU);
    setPublishedMenu(DEFAULT_MENU);
    setSelectedSectionId('sec-01');
    localStorage.removeItem(STORAGE_KEY_STORE);
    localStorage.removeItem(STORAGE_KEY_CATEGORIES);
    localStorage.removeItem(STORAGE_KEY_PRODUCTS);
    localStorage.removeItem(STORAGE_KEY_DRAFT_MENU);
    localStorage.removeItem(STORAGE_KEY_PUBLISHED_MENU);
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        signup,
        store,
        updateStore,
        generateSlug,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        reorderCategories,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        reorderProducts,
        draftMenu,
        publishedMenu,
        selectedSectionId,
        setSelectedSectionId,
        addSection,
        updateSection,
        updateSectionStyles,
        updateSectionContent,
        deleteSection,
        duplicateSection,
        reorderSections,
        saveDraftMenu,
        publishMenu,
        updateMenuTheme,
        getPublicMenuBySlug,
        resetToDefault,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
