# Online Menu Builder — Web Application (MyMenu)

ระบบสร้าง **เมนูอาหารออนไลน์ (Digital Menu)** สำหรับร้านอาหาร พร้อมระบบ Drag & Drop Page Builder, Image Optimization & Cropper, Unlimited Dynamic Option Groups, Turso Database (LibSQL), UploadThing Cloud CDN และระบบ Generate QR Code สำหรับพิมพ์ตั้งโต๊ะหรือแชร์บนโซเชียล

---

## 🌟 ฟีเจอร์หลัก (Features)

1. **Authentication & Store Profile**
   - เข้าสู่ระบบด้วย Email / Password หรือ One-Click Demo Mode
   - จัดการข้อมูลร้านค้า (ชื่อร้าน, โลโก้, คำอธิบาย, สถานะเปิด/ปิด)
   - ปรับแต่งและสร้าง **Unique Store Slug** สำหรับ Public URL เช่น `/m/somtum-house`

2. **Cloud Database (Turso LibSQL) & CDN (UploadThing)**
   - จัดเก็บข้อมูลร้านค้า, หมวดหมู่, สินค้า, หน้าเมนูแบบเรียลไทม์บน Turso Cloud Database
   - จัดเก็บและโหลดรูปภาพผ่าน UploadThing Cloud CDN พร้อม WebP Auto Compression

3. **Food Categories Management**
   - สร้าง, แก้ไข, ลบ หมวดหมู่อาหาร
   - จัดเรียงลำดับการแสดงผลหมวดหมู่

4. **Food / Product Management**
   - เพิ่มรายการอาหาร พร้อมราคาขาย (Sale Price) และราคาปกติ (Regular Price ขีดฆ่า)
   - สถานะ Active / Inactive
   - **Unlimited Dynamic Option Groups**: รองรับการสร้างกลุ่มตัวเลือกไม่จำกัด (เช่น ขนาดจาน, ระดับความเผ็ด, ท็อปปิ้งเพิ่มเติม พร้อมราคาบวกเพิ่ม)

5. **Image Upload & Optimization System**
   - ระบุขนาดที่แนะนำ (Recommended Size) และขนาดไฟล์ต้นฉบับสูงสุด 10 MB ชัดเจน
   - **Interactive Aspect Ratio Crop Modal**: 1:1, 4:5, 16:9
   - **Smart Auto-Resize**: ย่อขนาดภาพอัตโนมัติหากเกินขนาดที่แนะนำ โดยไม่ทำให้ภาพสูญเสียสัดส่วน
   - **Iterative WebP Compression**: บีบอัดภาพให้อยู่ในเกณฑ์เป้าหมาย

6. **3-Column Online Menu Builder**
   - **Left Column**: Elements Palette (Store Name, Logo, Description, Image/Banner, Text, Food List, Category Slider) และ Sections Order พร้อม Drag & Drop (`@dnd-kit`)
   - **Center Column**: Live Menu Preview Canvas พร้อมปุ่มสลับขนาดหน้าจอ **Mobile (390px)**, **Tablet (768px)**, และ **Desktop (1200px)**
   - **Right Column**: Properties Panel สำหรับปรับแต่ง Typography (Font Size, Weight, Color, Alignment, Line Height, Letter Spacing) และ Spacing (Margin, Padding, Gap)

7. **Save Draft vs Publish & QR Code Generator**
   - บันทึกแบบ Draft เพื่อทดลองจัดหน้าโดยไม่กระทบหน้าเมนูจริง
   - เมื่อกด Publish ระบบจะอัปเดต Public Menu และสร้าง **QR Code ความละเอียดสูง**
   - ดาวน์โหลด QR Code เป็นไฟล์ภาพ PNG พร้อมชื่อร้าน หรือ Copy Menu Link ได้ทันที

8. **Mobile-First Public Menu (`/m/[slug]`)**
   - โหลดเร็ว สวยงาม คลีน Minimal White Design
   - ระบบ Customer Note Chat พร้อมแชร์ข้อความสั่งอาหารผ่าน LINE หรือกดคัดลอก

---

## 🚀 การติดตั้งและรันโปรเจกต์ (Getting Started)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่า Environment Variables
คัดลอก `.env.example` เป็น `.env.local` แล้วใส่ Token:
```env
UPLOADTHING_TOKEN=your_uploadthing_token
TURSO_DATABASE_URL=your_turso_db_url
TURSO_AUTH_TOKEN=your_turso_auth_token
```

### 3. รันในโหมด Development
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

### 4. เส้นทางหลักของระบบ (Routes)
- **Landing Page**: `/`
- **เข้าสู่ระบบหลังบ้าน**: `/login`
- **Admin Dashboard**: `/admin`
- **Menu Builder (3-Column Layout)**: `/admin/builder`
- **จัดการรายการอาหาร**: `/admin/products`
- **จัดการหมวดหมู่อาหาร**: `/admin/categories`
- **ข้อมูลร้านและ Slug**: `/admin/store`
- **หน้าเมนูลูกค้า (Public Menu)**: `/m/somtum-house`
