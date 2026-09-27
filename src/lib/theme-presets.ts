export interface ThemePreset {
  id: string;
  name: string;
  nameTh: string;
  category: 'minimal' | 'warm' | 'cafe' | 'gradient';
  description: string;
  previewBg: string; // CSS for preview swatch
  
  // Applied Theme Config
  backgroundType: 'color' | 'gradient' | 'image';
  pageBgColor: string;
  pageBgGradient?: string;
  pageBgPattern?: string;
  pageBgImage?: string;
  
  cardBgColor: string;
  cardBorderColor: string;
  textColor: string;
  textMutedColor: string;
  accentColor: string;
  priceColor: string;
  fontFamily?: string;
  isDark?: boolean;
}

export const THEME_PRESETS: ThemePreset[] = [
  // 1. MINIMAL & CLEAN
  {
    id: 'minimal-white',
    name: 'Pure Minimal White',
    nameTh: 'ขาวมินิมอล คลีน',
    category: 'minimal',
    description: 'ขาวสะอาด สบายตา เหมาะกับทุกประเภทอาหารและเครื่องดื่ม',
    previewBg: '#FFFFFF',
    backgroundType: 'color',
    pageBgColor: '#FFFFFF',
    cardBgColor: '#FFFFFF',
    cardBorderColor: '#E4E4E7',
    textColor: '#18181B',
    textMutedColor: '#71717A',
    accentColor: '#FF5A36',
    priceColor: '#FF5A36',
    isDark: false,
  },
  {
    id: 'warm-linen',
    name: 'Warm Linen & Cream',
    nameTh: 'ครีมอุ่น โฮมเมด',
    category: 'minimal',
    description: 'โทนครีมอบอุ่น นุ่มนวล สไตล์อาหารโฮมเมด เบเกอรี่',
    previewBg: '#FBF9F5',
    backgroundType: 'color',
    pageBgColor: '#F7F4EE',
    cardBgColor: '#FFFFFF',
    cardBorderColor: '#EAE5D9',
    textColor: '#292524',
    textMutedColor: '#78716C',
    accentColor: '#D97706',
    priceColor: '#D97706',
    isDark: false,
  },
  {
    id: 'soft-slate',
    name: 'Soft Slate Minimal',
    nameTh: 'เทาหมอก โมเดิร์น',
    category: 'minimal',
    description: 'สีเทาอ่อนทันสมัย เรียบหรูสไตล์ Scandinavian',
    previewBg: '#F1F3F5',
    backgroundType: 'color',
    pageBgColor: '#F3F4F6',
    cardBgColor: '#FFFFFF',
    cardBorderColor: '#E5E7EB',
    textColor: '#1F2937',
    textMutedColor: '#6B7280',
    accentColor: '#2563EB',
    priceColor: '#1D4ED8',
    isDark: false,
  },

  // 2. WARM RESTAURANT & CAFE
  {
    id: 'warm-wood',
    name: 'Warm Wood & Japanese',
    nameTh: 'ลายไม้อบอุ่น & ญี่ปุ่น',
    category: 'warm',
    description: 'โทนไม้ธรรมชาติ อบอุ่น สไตล์ร้านอาหารญี่ปุ่นและคาเฟ่ไม้',
    previewBg: 'linear-gradient(135deg, #FDF8F3 0%, #F5EBE1 100%)',
    backgroundType: 'gradient',
    pageBgColor: '#F5ECE1',
    pageBgGradient: 'linear-gradient(180deg, #FBF6EF 0%, #F3E8DB 100%)',
    cardBgColor: '#FFFFFF',
    cardBorderColor: '#E6D7C3',
    textColor: '#38281E',
    textMutedColor: '#846D5E',
    accentColor: '#C25E00',
    priceColor: '#B45309',
    isDark: false,
  },
  {
    id: 'matcha-cafe',
    name: 'Matcha Green Cafe',
    nameTh: 'เขียวมัทฉะ คาเฟ่',
    category: 'cafe',
    description: 'โทนเขียวมัทฉะละมุน สดชื่น ผ่อนคลาย เหมาะกับคาเฟ่ ร้านชา ขนมหวาน',
    previewBg: 'linear-gradient(135deg, #F2F7F2 0%, #E3EFE3 100%)',
    backgroundType: 'gradient',
    pageBgColor: '#EEF5EE',
    pageBgGradient: 'linear-gradient(180deg, #F4F8F4 0%, #E6EFE6 100%)',
    cardBgColor: '#FFFFFF',
    cardBorderColor: '#CFE0CF',
    textColor: '#1B3B22',
    textMutedColor: '#5C7A62',
    accentColor: '#2D6A4F',
    priceColor: '#1B7A43',
    isDark: false,
  },
  {
    id: 'street-spice',
    name: 'Street Food & Spice',
    nameTh: 'ส้มอิฐ แซ่บสตรีทฟู้ด',
    category: 'warm',
    description: 'โทนส้มอิฐสดใส กระตุ้นความอยากอาหาร สไตล์ส้มตำ ยำ ปิ้งย่าง สตรีทฟู้ด',
    previewBg: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
    backgroundType: 'gradient',
    pageBgColor: '#FFF6EB',
    pageBgGradient: 'linear-gradient(180deg, #FFFAF5 0%, #FEEAD8 100%)',
    cardBgColor: '#FFFFFF',
    cardBorderColor: '#FED7AA',
    textColor: '#431407',
    textMutedColor: '#9A3412',
    accentColor: '#EA580C',
    priceColor: '#C2410C',
    isDark: false,
  },
  {
    id: 'sakura-sweet',
    name: 'Sakura Sweet Pastel',
    nameTh: 'ชมพูซากุระ หวานละมุน',
    category: 'cafe',
    description: 'โทนชมพูพาสเทลอ่อนโยน เหมาะกับร้านเบเกอรี่ เค้ก ขนมหวาน และไอศกรีม',
    previewBg: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
    backgroundType: 'gradient',
    pageBgColor: '#FFF1F3',
    pageBgGradient: 'linear-gradient(180deg, #FFF7F8 0%, #FFE8EB 100%)',
    cardBgColor: '#FFFFFF',
    cardBorderColor: '#FECDD3',
    textColor: '#4C0519',
    textMutedColor: '#9F1239',
    accentColor: '#E11D48',
    priceColor: '#BE123C',
    isDark: false,
  },

  // 3. GRADIENTS
  {
    id: 'sunset-glow',
    name: 'Sunset Glow Gradient',
    nameTh: 'ไล่เฉด ซันเซ็ทอบอุ่น',
    category: 'gradient',
    description: 'ไล่เฉดสีส้มพีช-ทองอ่อน ยามเย็น ให้ความรู้สึกผ่อนคลายและทันสมัย',
    previewBg: 'linear-gradient(135deg, #FFF7ED 0%, #FEF2F2 50%, #FDF4FF 100%)',
    backgroundType: 'gradient',
    pageBgColor: '#FFF7ED',
    pageBgGradient: 'linear-gradient(180deg, #FFF7ED 0%, #FEF2F2 50%, #FFF1F2 100%)',
    cardBgColor: '#FFFFFF',
    cardBorderColor: '#FDE047',
    textColor: '#371B10',
    textMutedColor: '#7C2D12',
    accentColor: '#EA580C',
    priceColor: '#EA580C',
    isDark: false,
  },
];
