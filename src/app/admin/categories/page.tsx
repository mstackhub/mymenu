'use client';

import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  GripVertical,
} from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { Category } from '@/types';

export default function CategoriesPage() {
  const { categories, products, addCategory, updateCategory, deleteCategory, reorderCategories } =
    useStore();

  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim());
    setNewCatName('');
  };

  const startEdit = (cat: Category) => {
    setEditingCat(cat);
    setEditName(cat.name);
  };

  const handleSaveEdit = () => {
    if (!editingCat || !editName.trim()) return;
    updateCategory(editingCat.id, { name: editName.trim() });
    setEditingCat(null);
  };

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newOrder = [...categories];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);
    reorderCategories(newOrder);
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-dark-primary font-display">
              หมวดหมู่อาหาร ({categories.length})
            </h1>
            <p className="text-xs text-dark-secondary mt-0.5">
              จัดหมวดหมู่ให้กับรายการอาหารเพื่อการค้นหาและการจัดหน้าเมนูที่สวยงาม
            </p>
          </div>
        </div>

        {/* Add Category Input */}
        <form
          onSubmit={handleAddCategory}
          className="bg-white p-4 rounded-2xl border border-border shadow-xs flex items-center gap-2"
        >
          <input
            type="text"
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="เพิ่มหมวดหมู่ใหม่ เช่น อาหารทานเล่น, ของหวาน, เครื่องดื่ม..."
            className="flex-1 px-4 py-2.5 bg-zinc-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มหมวดหมู่</span>
          </button>
        </form>

        {/* Categories List */}
        <div className="bg-white rounded-3xl border border-border shadow-xs overflow-hidden">
          {categories.length === 0 ? (
            <div className="p-12 text-center text-dark-muted">
              <Layers className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
              <p className="font-semibold text-sm">ยังไม่มีหมวดหมู่อาหาร</p>
              <p className="text-xs mt-1">พิมพ์ชื่อหมวดหมู่ด้านบนเพื่อเริ่มต้นสร้าง</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {categories.map((category, index) => {
                const productCount = products.filter(
                  (p) => p.category_id === category.id
                ).length;
                const isEditing = editingCat?.id === category.id;

                return (
                  <div
                    key={category.id}
                    className="p-4 flex items-center justify-between hover:bg-zinc-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex flex-col gap-0.5 text-dark-muted">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveCategory(index, 'up')}
                          className="p-0.5 hover:text-dark-primary disabled:opacity-20"
                          title="เลื่อนขึ้น"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === categories.length - 1}
                          onClick={() => moveCategory(index, 'down')}
                          className="p-0.5 hover:text-dark-primary disabled:opacity-20"
                          title="เลื่อนลง"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="w-7 h-7 rounded-lg bg-orange-50 text-primary-600 flex items-center justify-center font-bold text-xs">
                        {index + 1}
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1 max-w-sm">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-3 py-1.5 bg-white border border-primary-500 rounded-lg text-xs font-semibold focus:outline-none flex-1"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveEdit}
                            className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingCat(null)}
                            className="p-1.5 bg-zinc-100 text-dark-secondary rounded-lg hover:bg-zinc-200"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-sm font-bold text-dark-primary font-display">
                            {category.name}
                          </h3>
                          <span className="text-[11px] text-dark-secondary">
                            {productCount} รายการอาหารในหมวดนี้
                          </span>
                        </div>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(category)}
                          className="p-2 text-dark-secondary hover:text-dark-primary hover:bg-zinc-100 rounded-xl transition-colors"
                          title="แก้ไขชื่อ"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="p-2 text-dark-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          title="ลบหมวดหมู่"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
