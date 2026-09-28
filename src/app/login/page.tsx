'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UtensilsCrossed, Lock, Mail, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useStore } from '@/lib/store-context';

export default function LoginPage() {
  const router = useRouter();
  const { login, signup, user } = useStore();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('owner@somtumhouse.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Somtum House Owner');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const ok = await login(email, password);
        if (ok) {
          router.push('/admin');
        } else {
          setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        }
      } else {
        const ok = await signup(email, password, name);
        if (ok) {
          router.push('/admin');
        } else {
          setError('ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง');
        }
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    await login('owner@somtumhouse.com', 'demo1234');
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-soft flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-border overflow-hidden">
        {/* Top Branding Banner */}
        <div className="p-8 pb-6 text-center bg-gradient-to-b from-orange-50/60 to-white">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-md mb-3">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-dark-primary font-display">
            MyMenu Backoffice
          </h2>
          <p className="text-xs text-dark-secondary mt-1">
            ระบบจัดการเมนูออนไลน์และหลังบ้านสำหรับร้านอาหาร
          </p>

          {/* Mode Switcher Tabs */}
          <div className="mt-6 p-1 bg-zinc-100 rounded-xl grid grid-cols-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-dark-primary shadow-xs'
                  : 'text-dark-secondary hover:text-dark-primary'
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-white text-dark-primary shadow-xs'
                  : 'text-dark-secondary hover:text-dark-primary'
              }`}
            >
              สร้างบัญชีใหม่
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 pt-2 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-dark-secondary">ชื่อผู้ดูแลร้าน</label>
              <div className="relative">
                <User className="w-4 h-4 text-dark-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น สมชาย ใจดี"
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-dark-secondary">อีเมล (Email)</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-dark-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@restaurant.com"
                className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-dark-secondary">รหัสผ่าน (Password)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-dark-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <span>{mode === 'login' ? 'เข้าสู่ระบบ' : 'ลงทะเบียนและเริ่มสร้างเมนู'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
