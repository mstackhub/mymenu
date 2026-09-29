'use client';

import React, { useState } from 'react';
import {
  Store as StoreIcon,
  Image as ImageIcon,
  Save,
  Check,
  Globe,
  ExternalLink,
  QrCode,
  Sparkles,
  Lock,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { ImageUploadModal } from '@/components/ui/ImageUploadModal';
import { PublishModal } from '@/components/ui/PublishModal';

export default function StoreInfoPage() {
  const { store, updateStore, generateSlug, user } = useStore();

  const [name, setName] = useState(store.name);
  const [slug, setSlug] = useState(store.slug);
  const [description, setDescription] = useState(store.description);
  const [logoUrl, setLogoUrl] = useState(store.logo_url);
  const [bankName, setBankName] = useState(store.bank_name || 'SCB (ไทยพาณิชย์)');
  const [bankAccountName, setBankAccountName] = useState(store.bank_account_name || 'Mark');
  const [bankAccountNumber, setBankAccountNumber] = useState(store.bank_account_number || '44324343244');
  const [promptpayNumber, setPromptpayNumber] = useState(store.promptpay_number || '');
  const [status, setStatus] = useState(store.status);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto-suggest slug if not explicitly customized
    if (!slug || slug === generateSlug(store.name)) {
      setSlug(generateSlug(val));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateStore({
        name,
        slug: slug.trim().toLowerCase().replace(/[\s_-]+/g, '-'),
        description,
        logo_url: logoUrl,
        bank_name: bankName,
        bank_account_name: bankAccountName,
        bank_account_number: bankAccountNumber,
        promptpay_number: promptpayNumber,
        status,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (newPassword !== confirmPassword) {
      setPwdError('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (newPassword.length < 6) {
      setPwdError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setPwdLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.email,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPwdSuccess('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPwdSuccess(null), 4000);
      } else {
        setPwdError(data.error || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
      }
    } catch (err: any) {
      setPwdError('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
    } finally {
      setPwdLoading(false);
    }
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mymenu.app';

  return (
    <>
      {/* Floating Success Toast */}
      {savedSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white px-5 py-3 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-2.5 animate-fade-in border border-zinc-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>บันทึกข้อมูลร้านค้าเรียบร้อยแล้ว</span>
        </div>
      )}

      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-dark-primary font-display">
              ข้อมูลร้านอาหาร (Store Profile)
            </h1>
            <p className="text-xs text-dark-secondary mt-0.5">
              ตั้งค่าชื่อร้าน โลโก้ คำอธิบาย บัญชีรับเงิน และความปลอดภัยของระบบ
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsPublishModalOpen(true)}
            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-dark-primary text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4 text-primary-500" />
            <span>QR Code ร้าน</span>
          </button>
        </div>

        {/* Store Form Card */}
        <form onSubmit={handleSave} className="bg-white rounded-3xl border border-border shadow-xs overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">
            {savedSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>บันทึกข้อมูลร้านเรียบร้อยแล้ว</span>
              </div>
            )}

            {/* Logo Section */}
            <div>
              <label className="text-xs font-bold text-dark-primary uppercase tracking-wider block mb-2">
                โลโก้ร้านอาหาร (Logo)
              </label>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-border bg-zinc-50 flex-shrink-0">
                  <img
                    src={logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&fit=crop'}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setIsLogoModalOpen(true)}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-dark-primary text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4 text-primary-500" />
                    <span>เปลี่ยนโลโก้ (แนะนำ 800 × 800 px)</span>
                  </button>
                  <p className="text-[11px] text-dark-muted mt-1.5">
                    ระบบจะทำการ Resize และ Optimize เป็น WebP อัตโนมัติ (≤ 500 KB)
                  </p>
                </div>
              </div>
            </div>

            {/* Store Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark-primary block">
                ชื่อร้านอาหาร (Store Name) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="เช่น ส้มตำเฮาส์ (Somtum House)"
                className="w-full px-4 py-2.5 bg-zinc-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
              />
            </div>

            {/* Store Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark-primary block">
                Store Slug (Public URL) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 bg-zinc-100 border border-r-0 border-border rounded-l-xl text-xs text-dark-secondary font-mono">
                  {origin}/m/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="somtum-house"
                  className="flex-1 px-3 py-2.5 bg-zinc-50 border border-border rounded-r-xl text-xs font-mono font-medium text-dark-primary focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
                />
              </div>
              <p className="text-[11px] text-dark-secondary">
                ใช้ตัวอักษรภาษาอังกฤษ ตัวเลข และขีดกลาง (-) เท่านั้น
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark-primary block">
                รายละเอียดร้าน / สโลแกน (Description)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="คำอธิบายร้าน เมนูเด็ด เวลาเปิด-ปิด หรือสโลแกน..."
                className="w-full p-3 bg-zinc-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
              />
            </div>

            {/* Bank Account & Payment Info */}
            <div className="pt-4 border-t border-border space-y-4">
              <div>
                <h3 className="text-xs font-bold text-dark-primary uppercase tracking-wider flex items-center gap-1.5">
                  <span>💳 บัญชีธนาคารสำหรับรับชำระเงิน (Bank Account)</span>
                </h3>
                <p className="text-[11px] text-dark-secondary mt-0.5">
                  ข้อมูลนี้จะแสดงในใบสรุปรายการอาหาร และคัดลอกให้ลูกค้าโอนเงินชำระได้ทันที
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-dark-primary block">
                    ธนาคาร (Bank Name)
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="เช่น SCB (ไทยพาณิชย์), KBANK, BBL..."
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-dark-primary block">
                    ชื่อบัญชี (Account Name)
                  </label>
                  <input
                    type="text"
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                    placeholder="เช่น Mark, บจก. ส้มตำเฮาส์..."
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-dark-primary block">
                    เลขที่บัญชี (Account Number)
                  </label>
                  <input
                    type="text"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="เช่น 44324343244"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-border rounded-xl text-xs font-mono font-medium focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-dark-primary block">
                    เบอร์พร้อมเพย์ (PromptPay / Optional)
                  </label>
                  <input
                    type="text"
                    value={promptpayNumber}
                    onChange={(e) => setPromptpayNumber(e.target.value)}
                    placeholder="เช่น 0812345678"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-border rounded-xl text-xs font-mono focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Store Status */}
            <div className="pt-4 border-t border-border space-y-1.5">
              <label className="text-xs font-bold text-dark-primary block">
                สถานะร้านอาหาร
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-medium text-dark-primary cursor-pointer">
                  <input
                    type="radio"
                    name="store_status"
                    value="active"
                    checked={status === 'active'}
                    onChange={() => setStatus('active')}
                    className="accent-primary-500"
                  />
                  <span>เปิดให้บริการ (Active)</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-dark-secondary cursor-pointer">
                  <input
                    type="radio"
                    name="store_status"
                    value="inactive"
                    checked={status === 'inactive'}
                    onChange={() => setStatus('inactive')}
                    className="accent-primary-500"
                  />
                  <span>ปิดชั่วคราว (Inactive)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit footer */}
          <div className="px-6 sm:px-8 py-4 bg-soft/60 border-t border-border flex items-center justify-between gap-3">
            <div>
              {savedSuccess && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>บันทึกข้อมูลร้านค้าเรียบร้อยแล้ว</span>
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className={`px-6 py-2.5 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 ${
                savedSuccess
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  : 'bg-primary-500 hover:bg-primary-600 active:scale-95'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white stroke-[3]" />
                  <span>บันทึกสำเร็จแล้ว!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>บันทึกข้อมูลร้าน</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* SECURITY & CHANGE PASSWORD CARD */}
        <form onSubmit={handlePasswordChange} className="bg-white rounded-3xl border border-border shadow-xs overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center text-dark-primary">
                <Lock className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-dark-primary font-display">
                  ความปลอดภัย & เปลี่ยนรหัสผ่าน (Security & Password)
                </h2>
                <p className="text-[11px] text-dark-secondary mt-0.5">
                  เปลี่ยนรหัสผ่านสำหรับเข้าสู่ระบบหลังบ้าน MyMenu
                </p>
              </div>
            </div>

            {pwdError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{pwdError}</span>
              </div>
            )}

            {pwdSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-medium flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>{pwdSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-dark-primary block">
                  รหัสผ่านปัจจุบัน <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-dark-primary block">
                  รหัสผ่านใหม่ <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-dark-primary block">
                  ยืนยันรหัสผ่านใหม่ <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="พิมพ์ซ้ำอีกครั้ง"
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="px-6 sm:px-8 py-4 bg-soft/60 border-t border-border flex items-center justify-between gap-3">
            <div>
              {pwdSuccess && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{pwdSuccess}</span>
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={pwdLoading || !currentPassword || !newPassword || !confirmPassword}
              className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-900 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              {pwdLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-primary-400" />}
              <span>อัปเดตรหัสผ่านใหม่</span>
            </button>
          </div>
        </form>
      </div>

      {/* Logo Upload Modal */}
      <ImageUploadModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        specType="logo"
        title="อัปโหลดโลโก้ร้าน"
        onImageSelected={(dataUrl) => setLogoUrl(dataUrl)}
      />

      {/* Publish / QR Modal */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        store={store}
      />
    </>
  );
}
