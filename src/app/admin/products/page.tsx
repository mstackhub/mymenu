'use client';

import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Layers,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
  ArrowUpDown,
  MoreVertical,
} from 'lucide-react';
import { useStore } from '@/lib/store-context';
import { Product, OptionGroup, ProductOption } from '@/types';
import { ImageUploadModal } from '@/components/ui/ImageUploadModal';

export default function ProductsPage() {
  const { products, categories, addProduct, updateProduct, deleteProduct, store } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formSalePrice, setFormSalePrice] = useState<number>(0);
  const [formRegularPrice, setFormRegularPrice] = useState<string>('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formOptionGroups, setFormOptionGroups] = useState<OptionGroup[]>([]);
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormDescription('');
    setFormCategoryId(categories[0]?.id || '');
    setFormSalePrice(80);
    setFormRegularPrice('');
    setFormImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80');
    setFormStatus('active');
    setFormOptionGroups([]);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormDescription(product.description || '');
    setFormCategoryId(product.category_id);
    setFormSalePrice(product.sale_price);
    setFormRegularPrice(product.regular_price ? product.regular_price.toString() : '');
    setFormImageUrl(product.image_url);
    setFormStatus(product.status);
    setFormOptionGroups(JSON.parse(JSON.stringify(product.option_groups || [])));
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const regPriceNum = formRegularPrice.trim() !== '' ? parseFloat(formRegularPrice) : null;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formName,
        description: formDescription.trim() || undefined,
        category_id: formCategoryId,
        sale_price: Number(formSalePrice),
        regular_price: regPriceNum,
        image_url: formImageUrl,
        status: formStatus,
        option_groups: formOptionGroups,
      });
    } else {
      addProduct({
        store_id: store.id,
        name: formName,
        description: formDescription.trim() || undefined,
        category_id: formCategoryId,
        sale_price: Number(formSalePrice),
        regular_price: regPriceNum,
        image_url: formImageUrl,
        status: formStatus,
        sort_order: products.length + 1,
        option_groups: formOptionGroups,
      });
    }
    setIsModalOpen(false);
  };

  // Option Groups Handlers
  const addOptionGroup = () => {
    const newGroupId = 'optg-' + Date.now();
    const newGroup: OptionGroup = {
      id: newGroupId,
      product_id: editingProduct?.id || '',
      name: 'ตัวเลือกใหม่ (เช่น ขนาด / ระดับความเผ็ด)',
      sort_order: formOptionGroups.length + 1,
      options: [
        {
          id: 'opt-' + Date.now(),
          option_group_id: newGroupId,
          name: 'ธรรมดา',
          additional_price: 0,
          sort_order: 1,
        },
      ],
    };
    setFormOptionGroups([...formOptionGroups, newGroup]);
  };

  const updateGroupName = (groupId: string, name: string) => {
    setFormOptionGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, name } : g))
    );
  };

  const deleteOptionGroup = (groupId: string) => {
    setFormOptionGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const addOptionItem = (groupId: string) => {
    setFormOptionGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const newItem: ProductOption = {
            id: 'opt-' + Date.now(),
            option_group_id: groupId,
            name: 'ตัวเลือกเพิ่มเติม',
            additional_price: 15,
            sort_order: g.options.length + 1,
          };
          return { ...g, options: [...g.options, newItem] };
        }
        return g;
      })
    );
  };

  const updateOptionItem = (
    groupId: string,
    optionId: string,
    data: Partial<ProductOption>
  ) => {
    setFormOptionGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            options: g.options.map((opt) =>
              opt.id === optionId ? { ...opt, ...data } : opt
            ),
          };
        }
        return g;
      })
    );
  };

  const deleteOptionItem = (groupId: string, optionId: string) => {
    setFormOptionGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            options: g.options.filter((opt) => opt.id !== optionId),
          };
        }
        return g;
      })
    );
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCatFilter === 'all' || p.category_id === selectedCatFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-dark-primary font-display">
              รายการอาหาร ({products.length})
            </h1>
            <p className="text-xs text-dark-secondary mt-0.5">
              จัดการรายการอาหาร ราคา รูปภาพ และตัวเลือกเสริม (Option Groups) สำหรับแสดงในเมนู
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มรายการอาหาร</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-dark-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อรายการอาหาร..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setSelectedCatFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCatFilter === 'all'
                  ? 'bg-dark-primary text-white'
                  : 'bg-zinc-100 text-dark-secondary hover:bg-zinc-200'
              }`}
            >
              ทั้งหมด
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCatFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCatFilter === cat.id
                    ? 'bg-dark-primary text-white'
                    : 'bg-zinc-100 text-dark-secondary hover:bg-zinc-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Table/Grid */}
        <div className="bg-white rounded-3xl border border-border shadow-xs overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-dark-muted">
              <Layers className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
              <p className="font-semibold text-sm">ไม่พบรายการอาหาร</p>
              <p className="text-xs mt-1">ลองเปลี่ยนคำค้นหา หรือเพิ่มรายการอาหารใหม่</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {filteredProducts.map((product) => {
                const category = categories.find((c) => c.id === product.category_id);
                return (
                  <div
                    key={product.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/60 transition-colors"
                  >
                    <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
                      <img
                        src={product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&fit=crop'}
                        alt={product.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-border shadow-xs flex-shrink-0 mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-dark-primary font-display break-words">
                            {product.name}
                          </h3>
                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap flex-shrink-0 inline-flex items-center ${
                              product.status === 'active'
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/80'
                                : 'bg-zinc-100 text-dark-muted border border-zinc-200'
                            }`}
                          >
                            {product.status === 'active' ? 'เปิดขาย' : 'ซ่อน'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          <span className="text-[11px] bg-zinc-100 text-dark-secondary px-2 py-0.5 rounded-md font-medium whitespace-nowrap">
                            {category?.name || 'ไม่มีหมวดหมู่'}
                          </span>
                          {product.option_groups && product.option_groups.length > 0 && (
                            <span className="text-[11px] text-primary-600 bg-orange-50 px-2 py-0.5 rounded-md font-medium whitespace-nowrap border border-orange-100">
                              +{product.option_groups.length} กลุ่มตัวเลือก
                            </span>
                          )}
                        </div>
                        {product.description && (
                          <p className="text-xs text-dark-secondary line-clamp-3 mt-1.5 leading-relaxed break-words [overflow-wrap:anywhere]">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div className="text-right">
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-bold text-dark-primary font-display">
                            ฿{product.sale_price}
                          </span>
                          {product.regular_price && (
                            <span className="text-xs text-dark-muted line-through">
                              ฿{product.regular_price}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-dark-secondary">ราคาขายหน้าร้าน</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 rounded-xl text-dark-secondary hover:text-dark-primary hover:bg-zinc-100 transition-colors"
                          title="แก้ไข"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="p-2 rounded-xl text-dark-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="ลบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-soft/60">
              <h3 className="text-base font-bold text-dark-primary font-display">
                {editingProduct ? 'แก้ไขรายการอาหาร' : 'เพิ่มรายการอาหารใหม่'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-zinc-100 text-dark-muted hover:text-dark-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Image & Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="text-xs font-semibold text-dark-secondary block mb-1.5">
                    รูปอาหาร (Ratio 1:1)
                  </label>
                  <div
                    onClick={() => setIsImageUploadOpen(true)}
                    className="relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-zinc-200 hover:border-primary-500 cursor-pointer group bg-zinc-50 flex items-center justify-center"
                  >
                    <img
                      src={formImageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&fit=crop'}
                      alt="Food"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">
                      <ImageIcon className="w-5 h-5 mb-1" />
                      <span>อัปโหลด / Crop</span>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-dark-secondary block mb-1">
                      ชื่อรายการอาหาร <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="เช่น ข้าวผัดกุ้งสด"
                      className="w-full px-3 py-2 bg-zinc-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-dark-secondary block mb-1">
                      รายละเอียดอาหาร / คำอธิบาย (Description)
                    </label>
                    <textarea
                      rows={2}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="อธิบายรายละเอียด เช่น วัตถุดิบ ส่วนประกอบ รสชาติ (เช่น ข้าวหอมมะลิผัดกุ้งสดตัวโต หอมกลิ่นกระทะ เสิร์ฟพร้อมผักสด)..."
                      className="w-full px-3 py-2 bg-zinc-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500 resize-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-dark-secondary block mb-1">
                      หมวดหมู่อาหาร
                    </label>
                    <select
                      value={formCategoryId}
                      onChange={(e) => setFormCategoryId(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-dark-secondary block mb-1">
                        ราคาขาย (Sale Price ฿) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formSalePrice}
                        onChange={(e) => setFormSalePrice(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-zinc-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-dark-secondary block mb-1">
                        ราคาปกติ (Regular Price ฿)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="เว้นว่างได้"
                        value={formRegularPrice}
                        onChange={(e) => setFormRegularPrice(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 border border-border rounded-xl text-xs focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-dark-secondary block mb-1">
                      สถานะการแสดงผล
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-dark-primary cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="active"
                          checked={formStatus === 'active'}
                          onChange={() => setFormStatus('active')}
                          className="accent-primary-500"
                        />
                        <span>เปิดขาย (Active)</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-dark-secondary cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="inactive"
                          checked={formStatus === 'inactive'}
                          onChange={() => setFormStatus('inactive')}
                          className="accent-primary-500"
                        />
                        <span>ซ่อนจากเมนู (Inactive)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Option Groups Section (Section 7) */}
              <div className="pt-4 border-t border-border space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-dark-primary">
                      ตัวเลือกเมนูอาหาร (Dynamic Option Groups)
                    </h4>
                    <p className="text-[11px] text-dark-secondary">
                      เช่น ขนาดจาน, ระดับความเผ็ด, ท็อปปิ้งเพิ่มเติม (ไม่จำกัดจำนวน)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addOptionGroup}
                    className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-dark-primary rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มกลุ่มตัวเลือก</span>
                  </button>
                </div>

                {formOptionGroups.length === 0 ? (
                  <div className="p-4 border border-dashed border-zinc-200 rounded-2xl text-center text-dark-muted text-xs">
                    ไม่มีกลุ่มตัวเลือกสำหรับรายการนี้ (สามารถเพิ่มได้ตามต้องการ)
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formOptionGroups.map((group, groupIndex) => (
                      <div
                        key={group.id}
                        className="p-4 bg-zinc-50 border border-border rounded-2xl space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={group.name}
                            onChange={(e) => updateGroupName(group.id, e.target.value)}
                            placeholder="ชื่อกลุ่มตัวเลือก (เช่น ระดับความเผ็ด)"
                            className="font-bold text-xs bg-white border border-border rounded-lg px-2.5 py-1.5 flex-1 focus:outline-none focus:border-primary-500"
                          />
                          <button
                            type="button"
                            onClick={() => deleteOptionGroup(group.id)}
                            className="p-1.5 text-dark-muted hover:text-red-500 rounded-lg hover:bg-red-50"
                            title="ลบกลุ่มนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Option Items */}
                        <div className="space-y-2 pl-2">
                          {group.options.map((opt) => (
                            <div key={opt.id} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={opt.name}
                                onChange={(e) =>
                                  updateOptionItem(group.id, opt.id, { name: e.target.value })
                                }
                                placeholder="ชื่อตัวเลือก (เช่น เผ็ดมาก / ไข่ดาว)"
                                className="flex-1 bg-white border border-border rounded-lg px-2 py-1 text-xs focus:outline-none"
                              />
                              <div className="flex items-center gap-1 w-28">
                                <span className="text-[11px] text-dark-secondary">+฿</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={opt.additional_price}
                                  onChange={(e) =>
                                    updateOptionItem(group.id, opt.id, {
                                      additional_price: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="w-full bg-white border border-border rounded-lg px-2 py-1 text-xs focus:outline-none"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => deleteOptionItem(group.id, opt.id)}
                                className="p-1 text-dark-muted hover:text-red-500"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => addOptionItem(group.id)}
                            className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1 pt-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>เพิ่มตัวเลือกย่อย</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-dark-secondary hover:bg-zinc-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  บันทึกรายการอาหาร
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Upload & Crop Modal */}
      <ImageUploadModal
        isOpen={isImageUploadOpen}
        onClose={() => setIsImageUploadOpen(false)}
        specType="product"
        title="อัปโหลดรูปอาหาร"
        onImageSelected={(dataUrl) => setFormImageUrl(dataUrl)}
      />
    </>
  );
}
