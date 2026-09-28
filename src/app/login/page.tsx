'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UtensilsCrossed,
  Lock,
  Mail,
  User,
  Store,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  Send,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useStore } from '@/lib/store-context';

export default function LoginPage() {
  const router = useRouter();
  const { login, signup } = useStore();

  const [isSetupMode, setIsSetupMode] = useState<boolean | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Active view: 'auth' (login or first-time setup) | 'forgot'
  const [view, setView] = useState<'auth' | 'forgot'>('auth');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');

  // Forgot Password fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [codeRequested, setCodeRequested] = useState(false);
  const [codeSending, setCodeSending] = useState(false);
  const [codePreview, setCodePreview] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check initial setup status from server
  const checkStatus = async () => {
    try {
      setCheckingStatus(true);
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      if (data.success) {
        setIsSetupMode(data.isSetupMode);
      } else {
        setIsSetupMode(false);
      }
    } catch (e) {
      console.error('Failed to check auth status:', e);
      setIsSetupMode(false);
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  // Handle Login or First-time Setup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isSetupMode) {
        // First-time Setup
        const ok = await signup(email, password, name, storeName);
        if (ok) {
          router.push('/admin');
        }
      } else {
        // Normal Login
        const ok = await login(email, password);
        if (ok) {
          router.push('/admin');
        }
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  // Request 4-digit code
  const handleRequestCode = async () => {
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setError('กรุณากรอกอีเมลที่ถูกต้อง');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setCodeSending(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_code', email: forgotEmail }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCodeRequested(true);
        setSuccessMsg(data.message);
        if (data.codePreview) {
          setCodePreview(data.codePreview);
          setForgotCode(data.codePreview); // Auto-fill for convenience
        }
      } else {
        setError(data.error || 'ไม่สามารถส่งรหัสได้');
      }
    } catch (err: any) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setCodeSending(false);
    }
  };

  // Reset Password with 4-digit code
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          email: forgotEmail,
          code: forgotCode,
          newPassword: forgotNewPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('รีเซ็ตรหัสผ่านสำเร็จแล้ว! กำลังเข้าสู่ระบบ...');
        setTimeout(async () => {
          setEmail(forgotEmail);
          setPassword(forgotNewPassword);
          const ok = await login(forgotEmail, forgotNewPassword);
          if (ok) {
            router.push('/admin');
          } else {
            setView('auth');
          }
        }, 1200);
      } else {
        setError(data.error || 'รหัสยืนยันไม่ถูกต้องหรือหมดอายุ');
      }
    } catch (err: any) {
      setError('เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-soft flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          <p className="text-xs font-medium text-dark-secondary">กำลังตรวจสอบสถานะระบบ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-border overflow-hidden transition-all">
        {/* Top Branding Banner */}
        <div className="p-8 pb-6 text-center bg-gradient-to-b from-orange-50/60 to-white border-b border-border/50">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-md mb-3">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-dark-primary font-display">
            MyMenu Backoffice
          </h2>

          {isSetupMode ? (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>ติดตั้งระบบครั้งแรก (First-Time Store Setup)</span>
            </div>
          ) : view === 'forgot' ? (
            <p className="text-xs text-dark-secondary mt-1">
              กู้คืนรหัสผ่านด้วยรหัสยืนยัน 4 หลักทางอีเมล
            </p>
          ) : (
            <p className="text-xs text-dark-secondary mt-1">
              เข้าสู่ระบบจัดการเมนูและร้านอาหารของคุณ
            </p>
          )}
        </div>

        {/* Feedback Messages */}
        <div className="px-8 pt-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl mb-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {codePreview && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl mb-2 text-xs text-blue-900">
              <span className="font-semibold">รหัสยืนยันสำหรับทดสอบ (OTP): </span>
              <span className="font-mono font-bold tracking-widest text-sm bg-white px-2 py-0.5 rounded border border-blue-300 ml-1">
                {codePreview}
              </span>
            </div>
          )}
        </div>

        {/* VIEW 1: FORGOT PASSWORD */}
        {view === 'forgot' ? (
          <form onSubmit={handleResetPassword} className="p-8 pt-2 space-y-4">
            {/* Field 1: user (email) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-dark-primary flex items-center justify-between">
                <span>user (อีเมลที่ลงทะเบียน):</span>
                <span className="text-[10px] text-dark-muted font-normal">รับรหัส 4 หลัก</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-dark-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="your-email@restaurant.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRequestCode}
                  disabled={codeSending || !forgotEmail}
                  className="px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-900 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 flex-shrink-0"
                >
                  {codeSending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-primary-400" />
                  )}
                  <span>{codeRequested ? 'ส่งใหม่' : 'ส่งรหัส'}</span>
                </button>
              </div>
            </div>

            {/* Field 2: code (4-digit OTP) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-dark-primary">
                code (รหัส 4 หลักจากอีเมล):
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-dark-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={forgotCode}
                  onChange={(e) => setForgotCode(e.target.value.trim())}
                  placeholder="เช่น 4829"
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-border rounded-xl text-xs font-mono font-bold tracking-widest focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Field 3: new password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-dark-primary">
                new password (รหัสผ่านใหม่):
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-dark-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !forgotCode || !forgotNewPassword}
              className="w-full mt-2 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>บันทึกรหัสผ่านใหม่และเข้าสู่ระบบ</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setView('auth');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-xs font-semibold text-dark-secondary hover:text-dark-primary hover:underline transition-all"
              >
                ← ย้อนกลับไปหน้าเข้าสู่ระบบ
              </button>
            </div>
          </form>
        ) : (
          /* VIEW 2: AUTH FORM (Setup Mode OR Standard Login) */
          <form onSubmit={handleSubmit} className="p-8 pt-2 space-y-4">
            {isSetupMode && (
              <>
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900 leading-relaxed">
                  👋 <strong>ยินดีต้อนรับสู่ระบบร้านค้าของคุณ</strong><br />
                  กรุณาสร้างบัญชีเจ้าของร้านครั้งแรกเพื่อเริ่มต้นใช้งาน เมื่อสร้างเสร็จแล้วระบบจะปิดฟอร์มสมัครสมาชิกโดยอัตโนมัติ
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-dark-primary">ชื่อร้านอาหาร (Restaurant Name)</label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-dark-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="เช่น ครัวคุณแม่, Somtum Zap, Cafe Craft"
                      className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-dark-primary">ชื่อผู้ดูแลร้าน (Owner Name)</label>
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
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-dark-primary">อีเมล (Email)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-dark-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@yourrestaurant.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-dark-primary">รหัสผ่าน (Password)</label>
                {!isSetupMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setView('forgot');
                      setError(null);
                      setSuccessMsg(null);
                      if (email) setForgotEmail(email);
                    }}
                    className="text-[11px] font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-all"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                )}
              </div>
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
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{isSetupMode ? 'บันทึกและเริ่มต้นสร้างเมนู' : 'เข้าสู่ระบบ'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
