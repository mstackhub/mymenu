'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Layers,
  Store as StoreIcon,
  Eye,
  LogOut,
  Sparkles,
  Menu as MenuIcon,
  X,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '@/lib/store-context';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, store, logout } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'เมนูออนไลน์ (Builder)', href: '/admin/builder', icon: UtensilsCrossed, badge: 'Hot' },
    { name: 'รายการอาหาร', href: '/admin/products', icon: Layers },
    { name: 'หมวดหมู่อาหาร', href: '/admin/categories', icon: Layers },
    { name: 'ข้อมูลร้าน', href: '/admin/store', icon: StoreIcon },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isBuilder = pathname === '/admin/builder';

  return (
    <div className={`min-h-screen ${isBuilder ? 'h-screen overflow-hidden' : ''} bg-soft flex flex-col md:flex-row text-dark-primary font-sans`}>
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-border sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            M
          </div>
          <div>
            <span className="font-bold text-base tracking-tight font-display">MyMenu</span>
            <span className="text-[10px] bg-orange-100 text-primary-600 px-1.5 py-0.5 rounded ml-1.5 font-medium">
              SaaS
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg text-dark-secondary hover:bg-zinc-100"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-30 h-screen w-64 bg-white border-r border-border flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 flex flex-col h-full">
          {/* Brand Logo */}
          <div className="flex items-center justify-between pb-5 border-b border-border">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
                M
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight font-display">MyMenu</span>
                  <span className="text-[10px] bg-orange-50 text-primary-600 border border-orange-200 px-1.5 py-0.2 rounded font-semibold">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-dark-secondary truncate max-w-[130px]">
                  {store.name}
                </p>
              </div>
            </Link>
          </div>

          {/* Store Quick Preview Badge (Fully Clickable) */}
          <a
            href={`/m/${store.slug}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 p-3 bg-gradient-to-r from-orange-50/80 to-amber-50/60 hover:from-orange-100 hover:to-amber-100 rounded-xl border border-orange-200/80 flex items-center justify-between transition-all group cursor-pointer shadow-xs block"
            title="คลิกเพื่อเปิดดูหน้าเว็บไซต์เมนูจริง (New Tab)"
          >
            <div className="truncate pr-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <span className="text-[11px] font-bold text-primary-700">ดูเว็บไซต์ร้าน (Live Menu)</span>
              </div>
              <span className="text-xs font-mono font-semibold text-dark-primary group-hover:text-primary-600 truncate block mt-0.5">
                /m/{store.slug}
              </span>
            </div>
            <div className="p-1.5 rounded-lg bg-white border border-orange-200 text-primary-600 group-hover:bg-primary-500 group-hover:text-white transition-all shadow-xs flex-shrink-0">
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </a>

          {/* Navigation Items */}
          <nav className="mt-6 space-y-1 flex-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'text-dark-secondary hover:text-dark-primary hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-dark-secondary'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-primary-50 text-primary-600 border border-primary-100'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="pt-4 border-t border-border mt-auto">
            <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-full bg-zinc-200 text-dark-primary font-semibold text-xs flex items-center justify-center">
                  {user?.name?.slice(0, 1).toUpperCase() || 'U'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-dark-primary truncate">{user?.name || 'Owner'}</p>
                  <p className="text-[10px] text-dark-secondary truncate">{user?.email || 'owner@mymenu.com'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="ออกจากระบบ"
                className="p-1.5 rounded-lg text-dark-muted hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col min-w-0 ${isBuilder ? 'h-screen overflow-hidden' : 'min-h-screen overflow-x-hidden'}`}>
        {children}
      </main>
    </div>
  );
};
