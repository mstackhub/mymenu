'use client';

import React, { useState } from 'react';
import { X, Search, Check, Utensils, CheckSquare, Square } from 'lucide-react';
import { Product, Category } from '@/types';

interface FoodSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: Category[];
  selectedProductIds: string[];
  onSave: (selectedIds: string[]) => void;
}

export const FoodSelectModal: React.FC<FoodSelectModalProps> = ({
  isOpen,
  onClose,
  products,
  categories,
  selectedProductIds,
  onSave,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedProductIds);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedCategory === 'all' || prod.category_id === selectedCategory;
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredProducts.map((p) => p.id);
    const combined = Array.from(new Set([...selectedIds, ...allFilteredIds]));
    setSelectedIds(combined);
  };

  const handleDeselectAll = () => {
    const filteredSet = new Set(filteredProducts.map((p) => p.id));
    setSelectedIds((prev) => prev.filter((id) => !filteredSet.has(id)));
  };

  const handleApply = () => {
    onSave(selectedIds);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-soft/60">
          <div>
            <h3 className="text-lg font-bold text-dark-primary font-display flex items-center gap-2">
              <Utensils className="w-5 h-5 text-primary-500" />
              <span>เลือกรายการอาหารใน Section นี้</span>
            </h3>
            <p className="text-xs text-dark-secondary">
              เลือกอาหารที่ต้องการให้แสดงในเมนูส่วนนี้ (เลือกแล้ว {selectedIds.length} รายการ)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-100 text-dark-muted hover:text-dark-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and Search */}
        <div className="p-4 border-b border-border bg-white space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-dark-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหารายการอาหาร..."
                className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-3 py-2 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-dark-secondary rounded-xl transition-colors whitespace-nowrap"
            >
              เลือกทั้งหมด
            </button>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors whitespace-nowrap"
            >
              ล้างที่เลือก
            </button>
          </div>

          {/* Categories bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-dark-primary text-white'
                  : 'bg-zinc-100 text-dark-secondary hover:bg-zinc-200'
              }`}
            >
              ทั้งหมด ({products.length})
            </button>
            {categories.map((cat) => {
              const count = products.filter((p) => p.category_id === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-dark-primary text-white'
                      : 'bg-zinc-100 text-dark-secondary hover:bg-zinc-200'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Product List Items */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-border/60">
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-dark-secondary text-sm">
              ไม่พบรายการอาหารที่ตรงกับคำค้นหา
            </div>
          ) : (
            filteredProducts.map((product) => {
              const isSelected = selectedIds.includes(product.id);
              const categoryName = categories.find((c) => c.id === product.category_id)?.name;

              return (
                <div
                  key={product.id}
                  onClick={() => handleToggle(product.id)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-orange-50/50 hover:bg-orange-50' : 'hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      isSelected ? 'bg-primary-500 border-primary-500 text-white' : 'border-zinc-300'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <img
                      src={product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&fit=crop'}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover border border-border"
                    />

                    <div>
                      <h4 className="text-sm font-semibold text-dark-primary">{product.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        {categoryName && (
                          <span className="text-[11px] bg-zinc-100 text-dark-secondary px-1.5 py-0.2 rounded">
                            {categoryName}
                          </span>
                        )}
                        {product.option_groups && product.option_groups.length > 0 && (
                          <span className="text-[11px] text-primary-600 font-medium">
                            +{product.option_groups.length} ตัวเลือก
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-dark-primary">฿{product.sale_price}</span>
                      {product.regular_price && (
                        <span className="text-xs text-dark-muted line-through">
                          ฿{product.regular_price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-soft/60">
          <span className="text-xs text-dark-secondary">
            เลือกแล้ว <strong className="text-dark-primary">{selectedIds.length}</strong> รายการ
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-dark-secondary hover:text-dark-primary hover:bg-zinc-100 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-sm transition-all"
            >
              เพิ่ม {selectedIds.length} รายการ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
