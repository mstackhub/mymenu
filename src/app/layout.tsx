import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store-context";

export const metadata: Metadata = {
  title: "MyMenu — Digital Menu Builder สำหรับร้านอาหาร",
  description: "สร้างเมนูออนไลน์สำหรับร้านอาหารด้วย Drag & Drop, พร้อม QR Code และปรับแต่งสไตล์ได้อิสระ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree:wght@300;400;500;600;700&family=Chakra+Petch:wght@300;400;500;600;700&family=Charm:wght@400;700&family=Inter:wght@300;400;500;600;700;800&family=Kanit:wght@300;400;500;600;700&family=Krub:wght@300;400;500;600;700&family=Mali:wght@300;400;500;600;700&family=Mitr:wght@300;400;500;600;700&family=Noto+Sans+Thai:wght@300;400;500;600;700&family=Prompt:wght@300;400;500;600;700;800&family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#F8F9FA] text-[#18181B] min-h-screen font-sans">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
