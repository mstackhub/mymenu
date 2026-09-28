'use client';

import React, { useState, useEffect } from 'react';
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
  const { user, store, logout, isLoading } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isBuilder = pathname === '/admin/builder';
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'เมนูออนไลน์ (Builder)', href: '/admin/builder', icon: UtensilsCrossed, badge: 'Hot' },
    { name: 'รายการอาหาร', href: '/admin/products', icon: Layers },
    { name: 'หมวดหมู่อาหาร', href: '/admin/categories', icon: Layers },
    { name: 'ข้อมูลร้าน', href: '/admin/store', icon: StoreIcon },
  ];

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

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
        className={`fixed md:sticky top-0 left-0 z-30 h-screen ${
          isCollapsed ? 'md:w-16 w-64' : 'md:w-60 w-64'
        } bg-white border-r border-border flex flex-col justify-between transition-all duration-200 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-3.5 flex flex-col h-full overflow-x-hidden">
          {/* Brand Logo & Collapse toggle */}
          <div className="flex items-center justify-between pb-3.5 border-b border-border">
            <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                M
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-base tracking-tight font-display">MyMenu</span>
                    <span className="text-[9px] bg-orange-50 text-primary-600 border border-orange-200 px-1 py-0.2 rounded font-semibold">
                      PRO
                    </span>
                  </div>
                  <p className="text-[10px] text-dark-secondary truncate max-w-[120px]">
                    {store.name}
                  </p>
                </div>
              )}
            </Link>

            {/* Collapse toggle button for Desktop */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1 rounded-lg hover:bg-zinc-100 text-dark-muted hover:text-dark-primary transition-colors flex-shrink-0"
              title={isCollapsed ? 'ขยายเมนู' : 'ย่อเมนู'}
            >
              <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
            </button>
          </div>

          {/* Store Quick Preview Badge (Fully Clickable) */}
          {!isCollapsed ? (
            <a
              href={`/m/${store.slug}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 p-2.5 bg-gradient-to-r from-orange-50/80 to-amber-50/60 hover:from-orange-100 hover:to-amber-100 rounded-xl border border-orange-200/80 flex items-center justify-between transition-all group cursor-pointer shadow-2xs block"
              title="คลิกเพื่อเปิดดูหน้าเว็บไซต์เมนูจริง (New Tab)"
            >
              <div className="truncate pr-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                  <span className="text-[10px] font-bold text-primary-700">ดูเว็บไซต์ร้าน (Live)</span>
                </div>
                <span className="text-[11px] font-mono font-semibold text-dark-primary group-hover:text-primary-600 truncate block mt-0.5">
                  /m/{store.slug}
                </span>
              </div>
              <div className="p-1 rounded-lg bg-white border border-orange-200 text-primary-600 group-hover:bg-primary-500 group-hover:text-white transition-all shadow-xs flex-shrink-0">
                <ExternalLink className="w-3 h-3" />
              </div>
            </a>
          ) : (
            <a
              href={`/m/${store.slug}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 p-2 bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-200 text-primary-600 flex items-center justify-center transition-all shadow-2xs"
              title={`ดูเว็บไซต์ร้าน (/m/${store.slug})`}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {/* Navigation Items */}
          <nav className="mt-4 space-y-1 flex-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  onClick={() => setIsMobileMenuOpen(false)}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'} rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-xs'
                      : 'text-dark-secondary hover:text-dark-primary hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-dark-secondary'}`} />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
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
          <div className="pt-3 border-t border-border mt-auto">
            <div className={`flex items-center ${isCollapsed ? 'justify-center p-1.5' : 'justify-between p-2'} rounded-xl bg-zinc-50`}>
              <div className="flex items-center gap-2 truncate min-w-0">
                <div className="w-7 h-7 rounded-full bg-zinc-200 text-dark-primary font-semibold text-xs flex items-center justify-center flex-shrink-0">
                  {user?.name?.slice(0, 1).toUpperCase() || 'U'}
                </div>
                {!isCollapsed && (
                  <div className="truncate min-w-0">
                    <p className="text-[11px] font-semibold text-dark-primary truncate">{user?.name || 'Owner'}</p>
                    <p className="text-[9px] text-dark-secondary truncate">{user?.email || 'owner@mymenu.com'}</p>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <button
                  onClick={handleLogout}
                  title="ออกจากระบบ"
                  className="p-1 rounded-lg text-dark-muted hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
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
