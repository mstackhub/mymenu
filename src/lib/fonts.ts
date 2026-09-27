export interface FontOption {
  id: string;
  name: string;
  nameTh: string;
  family: string;
  category: 'Modern' | 'Clean' | 'Friendly' | 'Premium' | 'Handwriting' | 'Street' | 'Decorative' | 'International';
  previewText: string;
  tag: string;
}

export const AVAILABLE_FONTS: FontOption[] = [
  {
    id: 'sarabun',
    name: 'Sarabun',
    nameTh: 'สารบรรณ (มาตรฐาน)',
    family: "'Sarabun', sans-serif",
    category: 'Clean',
    previewText: 'ส้มตำไทย ข้าวผัดกุ้งสด Delicious Food',
    tag: 'ยอดนิยม • สบายตา',
  },
  {
    id: 'prompt',
    name: 'Prompt',
    nameTh: 'พร้อมท์ (โมเดิร์น)',
    family: "'Prompt', sans-serif",
    category: 'Modern',
    previewText: 'ส้มตำไทย ข้าวผัดกุ้งสด Delicious Food',
    tag: 'โมเดิร์น • คาเฟ่',
  },
  {
    id: 'kanit',
    name: 'Kanit',
    nameTh: 'คณิต (ทันสมัย คมชัด)',
    family: "'Kanit', sans-serif",
    category: 'Modern',
    previewText: 'ส้มตำไทย ข้าวผัดกุ้งสด Delicious Food',
    tag: 'เส้นคม • โดดเด่น',
  },
  {
    id: 'mitr',
    name: 'Mitr',
    nameTh: 'มิตร (อบอุ่น เป็นกันเอง)',
    family: "'Mitr', sans-serif",
    category: 'Friendly',
    previewText: 'ส้มตำไทย ข้าวผัดกุ้งสด Delicious Food',
    tag: 'อบอุ่น • เบเกอรี่',
  },
  {
    id: 'noto-sans-thai',
    name: 'Noto Sans Thai',
    nameTh: 'โนโตะ แซนส์ (มินิมอล)',
    family: "'Noto Sans Thai', sans-serif",
    category: 'Clean',
    previewText: 'ส้มตำไทย ข้าวผัดกุ้งสด Delicious Food',
    tag: 'คลีน • มินิมอล',
  },
  {
    id: 'bai-jamjuree',
    name: 'Bai Jamjuree',
    nameTh: 'จามจุรี (พรีเมียม กึ่งเหลี่ยม)',
    family: "'Bai Jamjuree', sans-serif",
    category: 'Premium',
    previewText: 'ส้มตำไทย ข้าวผัดกุ้งสด Delicious Food',
    tag: 'พรีเมียม • หรูหรา',
  },
  {
    id: 'mali',
    name: 'Mali',
    nameTh: 'มะลิ (ลายมือน่ารัก)',
    family: "'Mali', cursive",
    category: 'Handwriting',
    previewText: 'ส้มตำไทย ข้าวผัดกุ้งสด Delicious Food',
    tag: 'น่ารัก • ชานม/ขนม',
  },
  {
    id: 'chakra-petch',
    name: 'Chakra Petch',
    nameTh: 'จักรเพชร (สปอร์ต เท่)',
    family: "'Chakra Petch', sans-serif",
    category: 'Street',
    previewText: 'ส้มตำไทย ข้าวผัดกุ้งสด Delicious Food',
    tag: 'สตรีท • ปิ้งย่าง',
  },
  {
    id: 'krub',
    name: 'Krub',
    nameTh: 'ครับ (โค้งมน สบายตา)',
    family: "'Krub', sans-serif",
    category: 'Modern',
    previewText: 'ส้มตำไทย ข้าวผัดกุ้งสด Delicious Food',
    tag: 'เรียบเก๋ • ชิค',
  },
  {
    id: 'charm',
    name: 'Charm',
    nameTh: 'ชาร์ม (อักษรวิจิตร ไทยแท้)',
    family: "'Charm', cursive",
    category: 'Decorative',
    previewText: 'ส้มตำไทย ข้าวผัดกุ้งสด Delicious Food',
    tag: 'หรูหรา • ไทยประยุกต์',
  },
  {
    id: 'inter',
    name: 'Inter',
    nameTh: 'Inter (อินเตอร์เนชันแนล)',
    family: "'Inter', sans-serif",
    category: 'International',
    previewText: 'ส้มตำไทย ข้าวผัดกุ้งสด Delicious Food',
    tag: 'สากล • โมเดิร์น',
  },
];
