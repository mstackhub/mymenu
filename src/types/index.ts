export type Status = 'active' | 'inactive';
export type MenuStatus = 'draft' | 'published';

export interface Store {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo_url: string;
  description: string;
  bank_name?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  promptpay_number?: string;
  status: Status;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  store_id: string;
  name: string;
  sort_order: number;
  status: Status;
  created_at: string;
  updated_at: string;
}

export interface ProductOption {
  id: string;
  option_group_id: string;
  name: string;
  additional_price: number;
  sort_order: number;
}

export interface OptionGroup {
  id: string;
  product_id: string;
  name: string;
  sort_order: number;
  options: ProductOption[];
}

export interface Product {
  id: string;
  store_id: string;
  category_id: string;
  name: string;
  description?: string;
  image_url: string;
  sale_price: number;
  regular_price?: number | null;
  status: Status;
  sort_order: number;
  created_at: string;
  updated_at: string;
  option_groups?: OptionGroup[];
}

export type SectionType = 
  | 'store_name'
  | 'logo'
  | 'description'
  | 'image'
  | 'text'
  | 'product_list'
  | 'category_slider';

export interface SpacingValues {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface SectionStyles {
  // Typography
  fontSize?: number; // Desktop / Base font size
  fontSizeMobile?: number; // Mobile font size
  fontWeight?: 300 | 400 | 500 | 600 | 700 | 800;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: number;
  
  // Spacing
  margin?: SpacingValues;
  padding?: SpacingValues;
  gap?: number;
  
  // Element-specific styles
  width?: number | string; // e.g. 100%, 80px, 160px
  aspectRatio?: 'original' | '1:1' | '4:5' | '16:9';
  objectFit?: 'cover' | 'contain';
  borderRadius?: number;
  alignment?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  
  // Category Slider specific styles
  tabStyle?: 'pill' | 'solid' | 'underline' | 'bordered';
  activeTabBgColor?: string;
  activeTabTextColor?: string;
  inactiveTabBgColor?: string;
  inactiveTabTextColor?: string;
  isSticky?: boolean;

  // Product List specific typography & layout
  priceColor?: string;
  priceFontSize?: number;
  priceFontSizeMobile?: number;
  regularPriceColor?: string;
  productNameColor?: string;
  productNameFontSize?: number;
  productNameFontSizeMobile?: number;
  imageRatio?: '1:1' | '4:5' | '16:9';
  imageSize?: number; // size in px for list
  columns?: 1 | 2;
}

export interface StoreNameContent {
  text?: string;
}

export interface LogoContent {
  url?: string;
}

export interface DescriptionContent {
  text?: string;
}

export interface ImageContent {
  url: string;
  alt?: string;
}

export interface TextContent {
  text: string;
}

export interface ProductListContent {
  selectionMode?: 'auto' | 'manual' | 'category';
  categoryId?: string;
  productIds?: string[];
  display?: 'image-text-price' | 'text-price' | 'card-grid';
  categoryTitle?: string;
}

export type SectionContent = Record<string, any>;

export interface MenuSection {
  id: string;
  menu_id: string;
  type: SectionType;
  sort_order: number;
  content: SectionContent;
  styles: SectionStyles;
  created_at?: string;
  updated_at?: string;
}

export interface MenuTheme {
  presetId?: string;
  backgroundType: 'color' | 'gradient' | 'pattern' | 'image';
  pageBgColor?: string;
  pageBgGradient?: string;
  pageBgPattern?: string;
  pageBgImage?: string;
  cardBgColor?: string;
  cardBorderColor?: string;
  textColor?: string;
  textMutedColor?: string;
  accentColor?: string;
  priceColor?: string;
  isDark?: boolean;
  contentMaxWidth?: 'compact' | 'standard' | 'wide' | 'full'; // e.g. 480px, 720px, 1024px, 1200px
}

export interface Menu {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  status: MenuStatus;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  sections?: MenuSection[];
  theme?: MenuTheme;
}

export interface ImageUploadSpec {
  name: string;
  recommendedWidth: number;
  recommendedHeight: number;
  ratioLabel: string;
  aspectRatio: number; // width / height
  maxOriginalSizeMB: number;
  targetMaxCompressedSizeKB: number;
}
