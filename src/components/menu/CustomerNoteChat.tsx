'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Copy,
  Check,
  Trash2,
  Plus,
  Minus,
  X,
  Share2,
  Sparkles,
  ShoppingBag,
  Send,
  CreditCard,
  FileText,
  Edit3,
} from 'lucide-react';
import { Store, Product } from '@/types';

export interface NoteItemOption {
  groupName: string;
  optionName: string;
  additionalPrice: number;
}

export interface NoteItem {
  id: string;
  productId: string;
  productName: string;
  basePrice: number;
  selectedOptions: NoteItemOption[];
  unitPrice: number;
  quantity: number;
  note?: string;
}

interface CustomerNoteChatProps {
  store?: Store | any;
  notedItems: NoteItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onUpdateNote?: (id: string, note: string) => void;
  onAddCustomItem?: (name: string, note?: string) => void;
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const CustomerNoteChat: React.FC<CustomerNoteChatProps> = ({
  store,
  notedItems,
  onUpdateQuantity,
  onUpdateNote,
  onAddCustomItem,
  onRemoveItem,
  onClearAll,
  isOpen,
  onToggleOpen,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedBankNum, setCopiedBankNum] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [editingNoteItemId, setEditingNoteItemId] = useState<string | null>(null);
  const [tempItemNote, setTempItemNote] = useState('');

  // Update realtime date & time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const dateFormatted = now.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      const timeFormatted =
        now.toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit',
        }) + ' น.';

      setCurrentDateStr(dateFormatted);
      setCurrentTimeStr(timeFormatted);
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const totalItemsCount = notedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = notedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // Bank Info Fallbacks
  const bankName = store?.bank_name || 'SCB (ไทยพาณิชย์)';
  const bankAccountName = store?.bank_account_name || 'Mark';
  const bankAccountNumber = store?.bank_account_number || '44324343244';

  const handleSaveItemNote = (id: string) => {
    if (onUpdateNote) {
      onUpdateNote(id, tempItemNote.trim());
    }
    setEditingNoteItemId(null);
    setTempItemNote('');
  };

  // Generate formatted text for copying or sharing
  const generateFormattedText = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear() + 543;
    const time = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';

    let text = `📝 รายการของฉันวันนี้ (${day}/${month}/${year} ${time})\n`;
    text += `🏪 ร้าน: ${store?.name || 'ร้านอาหาร'}\n`;
    text += `--------------------------------\n`;
    text += `จำนวนที่สั่ง ${totalItemsCount} รายการ\n\n`;

    notedItems.forEach((item, index) => {
      text += `${index + 1}. ${item.productName}\n`;
      if (item.selectedOptions && item.selectedOptions.length > 0) {
        const optionDescriptions = item.selectedOptions
          .map((opt) => opt.optionName)
          .join(', ');
        text += `   - ${optionDescriptions} ${item.quantity} จำนวน\n`;
      } else {
        text += `   - ธรรมดา ${item.quantity} จำนวน\n`;
      }
      if (item.note) {
        text += `   * หมายเหตุ: ${item.note}\n`;
      }
    });

    if (orderNote.trim()) {
      text += `\n📌 Note: ${orderNote.trim()}\n`;
    }

    text += `\n--------------------------------\n`;
    text += `💰 ยอดรวมประมาณ: ฿${totalAmount.toLocaleString()}\n`;

    // Bank Account Info
    if (bankAccountNumber) {
      text += `\n💳 โอนชำระเงินได้ที่:\n`;
      text += `ธนาคาร: ${bankName}\n`;
      text += `ชื่อบัญชี: ${bankAccountName}\n`;
      text += `เลขที่บัญชี: ${bankAccountNumber}\n`;
      if (store?.promptpay_number) {
        text += `พร้อมเพย์: ${store?.promptpay_number}\n`;
      }
    }

    return text;
  };

  const handleCopyText = async () => {
    if (notedItems.length === 0) return;
    const text = generateFormattedText();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleCopyBankAccount = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!bankAccountNumber) return;
    try {
      navigator.clipboard.writeText(bankAccountNumber);
      setCopiedBankNum(true);
      setTimeout(() => setCopiedBankNum(false), 2000);
    } catch (err) {}
  };

  const handleShareLine = () => {
    if (notedItems.length === 0) return;
    const text = generateFormattedText();
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
    window.open(lineUrl, '_blank');
  };

  return (
    <>
      {/* Floating Chat Trigger Button (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleOpen}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-[#FF5A36] to-[#FF7A59] hover:from-[#E04826] hover:to-[#FF5A36] text-white font-bold rounded-full shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-200 border-2 border-white/40"
          aria-label="รายการที่จด"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-white" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-zinc-900 text-white text-[11px] font-extrabold rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                {totalItemsCount}
              </span>
            )}
          </div>
          <span className="text-sm font-display tracking-tight pr-1">
            {totalItemsCount > 0 ? `จดเมนูไว้ (${totalItemsCount})` : 'จดเมนูอาหาร'}
          </span>
          {totalItemsCount > 0 && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-semibold">
              ฿{totalAmount}
            </span>
          )}
        </button>
      </div>

      {/* Floating Note/Chat Panel Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:p-6 bg-black/50 backdrop-blur-xs animate-fade-in"
          onClick={onToggleOpen}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-border flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-white text-dark-primary border-b border-border/80 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-primary-500 shadow-2xs">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base font-display text-dark-primary flex items-center gap-1.5">
                    <span>รายการของฉันวันนี้</span>
                  </h3>
                  <p className="text-[11px] text-dark-secondary flex items-center gap-1.5 mt-0.5">
                    <span>{currentDateStr || 'วันนี้'}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-300" />
                    <span className="text-primary-600 font-mono font-semibold">{currentTimeStr}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {notedItems.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearAll}
                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors text-xs flex items-center gap-1"
                    title="ล้างรายการทั้งหมด"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onToggleOpen}
                  className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-dark-secondary hover:text-dark-primary flex items-center justify-center transition-colors"
                  title="ปิด"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Summary Bar */}
            <div className="px-4 py-2.5 bg-orange-50/70 border-b border-orange-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-primary-900">
                จำนวนที่สั่ง <span className="font-bold text-primary-600">{totalItemsCount}</span> รายการ
              </span>
              <span className="font-bold text-primary-700 font-display text-sm">
                รวม ฿{totalAmount.toLocaleString()}
              </span>
            </div>

            {/* Items List & Note Controls */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3.5 min-h-[160px]">
              {notedItems.length === 0 ? (
                <div className="py-12 text-center text-dark-muted space-y-2">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-sm text-dark-primary">ยังไม่มีรายการที่จดไว้</p>
                  <p className="text-xs text-dark-secondary max-w-xs mx-auto">
                    คลิกเลือกเมนูอาหารเพื่อเลือกขนาด ตัวเลือกเสริม แล้วกด "จดรายการนี้" ได้เลยครับ
                  </p>
                </div>
              ) : (
                <>
                  {notedItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-3 bg-zinc-50 hover:bg-orange-50/30 rounded-2xl border border-border/80 transition-colors space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-dark-primary font-display truncate">
                            {index + 1}. {item.productName}
                          </h4>

                          {/* Selected Options Breakdown */}
                          {item.selectedOptions && item.selectedOptions.length > 0 ? (
                            <div className="mt-1 space-y-0.5">
                              {item.selectedOptions.map((opt, optIdx) => (
                                <p
                                  key={optIdx}
                                  className="text-[11px] text-dark-secondary flex items-center gap-1"
                                >
                                  <span className="text-primary-500 font-bold">•</span>
                                  <span>{opt.optionName}</span>
                                  {opt.additionalPrice > 0 && (
                                    <span className="text-dark-muted text-[10px]">
                                      (+฿{opt.additionalPrice})
                                    </span>
                                  )}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-dark-muted mt-0.5">• ธรรมดา</p>
                          )}

                          {/* Item Note Display & Inline Edit */}
                          {editingNoteItemId === item.id ? (
                            <div className="mt-2 flex items-center gap-1.5">
                              <input
                                type="text"
                                placeholder="พิมพ์หมายเหตุเมนูนี้..."
                                value={tempItemNote}
                                onChange={(e) => setTempItemNote(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveItemNote(item.id)}
                                autoFocus
                                className="flex-1 p-1.5 text-xs bg-white border border-primary-400 rounded-lg focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveItemNote(item.id)}
                                className="px-2 py-1.5 bg-primary-500 text-white rounded-lg text-[10px] font-bold"
                              >
                                บันทึก
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingNoteItemId(null)}
                                className="px-1.5 py-1.5 text-dark-muted hover:text-dark-primary text-[10px]"
                              >
                                ยกเลิก
                              </button>
                            </div>
                          ) : (
                            <div className="mt-1 flex items-center gap-1.5">
                              {item.note ? (
                                <span
                                  onClick={() => {
                                    setEditingNoteItemId(item.id);
                                    setTempItemNote(item.note || '');
                                  }}
                                  className="text-[10px] text-orange-700 bg-orange-100 hover:bg-orange-200 px-2 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1 inline-block"
                                  title="คลิกเพื่อแก้ไขหมายเหตุ"
                                >
                                  <span>หมายเหตุ: {item.note}</span>
                                  <Edit3 className="w-2.5 h-2.5 opacity-60" />
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingNoteItemId(item.id);
                                    setTempItemNote('');
                                  }}
                                  className="text-[10px] text-dark-muted hover:text-primary-600 flex items-center gap-1 transition-colors"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                  <span>เพิ่มหมายเหตุ</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Item Total Price */}
                        <div className="text-right flex-shrink-0">
                          <span className="font-bold text-xs sm:text-sm text-dark-primary font-display">
                            {item.unitPrice > 0 ? `฿${(item.unitPrice * item.quantity).toLocaleString()}` : '-'}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Stepper & Delete */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/60">
                        <div className="flex items-center gap-1 bg-white border border-border rounded-lg p-0.5 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-dark-secondary hover:bg-zinc-100 active:scale-90 transition-all"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-bold text-xs font-mono text-dark-primary">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-dark-secondary hover:bg-zinc-100 active:scale-90 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="text-[11px] text-dark-muted hover:text-red-500 transition-colors p-1"
                        >
                          ลบ
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* General Order Note Input */}
                  <div className="p-3 bg-zinc-50 rounded-2xl border border-border space-y-1.5">
                    <label className="text-xs font-bold text-dark-primary flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-primary-500" />
                      <span>Note (หมายเหตุเพิ่มเติม)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="พิมพ์ Note เช่น ทานที่ร้าน, ใส่ถุงกลับบ้าน, ขอช้อนส้อม..."
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      className="w-full p-2.5 bg-white border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500 transition-colors shadow-2xs"
                    />
                  </div>

                  {/* Bank Account Details Card in Drawer */}
                  {bankAccountNumber && (
                    <div className="p-3.5 bg-gradient-to-br from-zinc-50 to-orange-50/50 rounded-2xl border border-orange-200/80 space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-dark-primary">
                          <CreditCard className="w-4 h-4 text-primary-500" />
                          <span>บัญชีรับโอนเงินของร้าน</span>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                          พร้อมเพย์ / โอน
                        </span>
                      </div>

                      <div className="text-xs space-y-0.5 text-dark-secondary bg-white p-2.5 rounded-xl border border-border/70">
                        <div className="flex justify-between">
                          <span>ธนาคาร:</span>
                          <span className="font-semibold text-dark-primary">{bankName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ชื่อบัญชี:</span>
                          <span className="font-semibold text-dark-primary">{bankAccountName}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-border/50">
                          <span>เลขบัญชี:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-primary-600 text-sm">
                              {bankAccountNumber}
                            </span>
                            <button
                              type="button"
                              onClick={handleCopyBankAccount}
                              className="p-1 text-dark-secondary hover:text-primary-500 rounded bg-zinc-100 hover:bg-orange-50 transition-colors"
                              title="คัดลอกเลขบัญชี"
                            >
                              {copiedBankNum ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer Action Buttons */}
            {notedItems.length > 0 && (
              <div className="p-4 bg-zinc-50 border-t border-border space-y-2 flex-shrink-0">
                {/* Copy Text Button */}
                <button
                  type="button"
                  onClick={handleCopyText}
                  className={`w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-200 ${
                    copied
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                      : 'bg-primary-500 hover:bg-primary-600 active:scale-[0.99] text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>คัดลอกรายการและเลขบัญชีแล้ว!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>คัดลอกข้อความรายการอาหาร (Copy Text)</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
