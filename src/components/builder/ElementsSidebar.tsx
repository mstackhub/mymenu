'use client';

import React from 'react';
import {
  Store as StoreIcon,
  Image as ImageIcon,
  Type,
  UtensilsCrossed,
  FileText,
  GripVertical,
  Plus,
  Trash2,
  Copy,
  Sparkles,
  Layers,
  Palette,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useStore } from '@/lib/store-context';
import { SectionType, MenuSection } from '@/types';

const ELEMENT_TEMPLATES: {
  type: SectionType;
  title: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    type: 'store_name',
    title: 'Store Name',
    description: 'ชื่อร้านอาหาร',
    icon: StoreIcon,
  },
  {
    type: 'logo',
    title: 'Logo',
    description: 'โลโก้ร้านอาหาร',
    icon: Sparkles,
  },
  {
    type: 'description',
    title: 'Description',
    description: 'คำอธิบายหรือสโลแกนร้าน',
    icon: FileText,
  },
  {
    type: 'image',
    title: 'Image / Banner',
    description: 'รูปแบนเนอร์หรือโปรโมชั่น',
    icon: ImageIcon,
  },
  {
    type: 'text',
    title: 'Text / Heading',
    description: 'ข้อความหรือหัวข้อเมนู',
    icon: Type,
  },
  {
    type: 'product_list',
    title: 'Food List',
    description: 'รายการอาหารและราคา',
    icon: UtensilsCrossed,
  },
  {
    type: 'category_slider',
    title: 'Category Slider',
    description: 'แถบหมวดหมู่แบบสไลด์',
    icon: Layers,
  },
];

interface SortableItemProps {
  section: MenuSection;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const SortableSectionItem: React.FC<SortableItemProps> = ({
  section,
  index,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 20 : 'auto',
  };

  const getSectionTitle = (s: MenuSection) => {
    switch (s.type) {
      case 'store_name':
        return 'ชื่อร้าน (Store Name)';
      case 'logo':
        return 'โลโก้ร้าน (Logo)';
      case 'description':
        return 'รายละเอียดร้าน (Description)';
      case 'image':
        return 'รูปภาพ / แบนเนอร์ (Image)';
      case 'text':
        return `ข้อความ: "${(s.content?.text || 'Text').slice(0, 16)}..."`;
      case 'product_list':
        return `รายการอาหาร (${(s.content?.productIds || []).length} เมนู)`;
      case 'category_slider':
        return 'สไลด์หมวดหมู่ (Category Slider)';
      default:
        return s.type;
    }
  };

  const getSectionIcon = (type: SectionType) => {
    const item = ELEMENT_TEMPLATES.find((t) => t.type === type);
    const Icon = item?.icon || Layers;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group relative flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
        isSelected
          ? 'bg-orange-50/70 border-primary-500 shadow-xs text-primary-900 font-medium'
          : 'bg-white hover:bg-zinc-50 border-border text-dark-primary'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="p-1 text-dark-muted hover:text-dark-primary cursor-grab active:cursor-grabbing rounded hover:bg-zinc-100 flex-shrink-0"
          title="ลากเพื่อจัดลำดับ"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className={`p-1.5 rounded-lg flex-shrink-0 cursor-pointer ${
            isSelected ? 'bg-primary-500 text-white' : 'bg-zinc-100 text-dark-secondary'
          }`}
        >
          {getSectionIcon(section.type)}
        </div>

        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="truncate flex-1 cursor-pointer"
        >
          <span className="truncate block font-medium">
            {getSectionTitle(section)}
          </span>
          <span className="text-[10px] text-dark-secondary uppercase tracking-wider block">
            {section.type.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Action buttons (Duplicate, Delete) */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-1 text-dark-muted hover:text-dark-primary hover:bg-zinc-100 rounded"
          title="คัดลอก Section"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-dark-muted hover:text-red-500 hover:bg-red-50 rounded"
          title="ลบ Section"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const ElementsSidebar: React.FC = () => {
  const {
    draftMenu,
    selectedSectionId,
    setSelectedSectionId,
    addSection,
    deleteSection,
    duplicateSection,
    reorderSections,
  } = useStore();

  const sections = draftMenu.sections || [];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(sections, oldIndex, newIndex);
        reorderSections(reordered);
      }
    }
  };

  return (
    <div className="w-64 lg:w-72 h-full flex-shrink-0 bg-white border-r border-border flex flex-col overflow-hidden select-none">
      {/* Top Elements Palette */}
      <div className="p-3.5 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-dark-primary uppercase tracking-wider font-display">
            Elements ({ELEMENT_TEMPLATES.length})
          </span>
          <span className="text-[10px] text-dark-muted">คลิกเพื่อเพิ่ม</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {ELEMENT_TEMPLATES.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.type}
                onClick={() => addSection(item.type)}
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-border hover:border-primary-500 hover:bg-orange-50/40 text-dark-primary transition-all group text-center"
              >
                <div className="w-6 h-6 rounded-lg bg-zinc-100 group-hover:bg-primary-500 group-hover:text-white text-dark-secondary flex items-center justify-center transition-colors mb-1">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold group-hover:text-primary-600 block">
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setSelectedSectionId(null)}
          className="w-full mt-2.5 py-2 px-3 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border border-orange-200/80 rounded-xl text-primary-700 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs"
        >
          <Palette className="w-3.5 h-3.5 text-primary-500" />
          <span>🎨 ตั้งค่าธีม & สีพื้นหลัง</span>
        </button>
      </div>

      {/* Sections List Outline with Drag & Drop */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-dark-primary uppercase tracking-wider font-display">
            Sections Order ({sections.length})
          </span>
          <span className="text-[10px] text-dark-muted">ลากสลับลำดับ</span>
        </div>

        {sections.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-zinc-200 rounded-2xl text-dark-muted">
            <Plus className="w-6 h-6 mb-1 text-zinc-400" />
            <p className="text-xs font-medium">ยังไม่มี Section ในเมนู</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              คลิก Element ด้านบนเพื่อเริ่มจัดหน้า
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1.5 flex-1">
                {sections.map((section, index) => (
                  <SortableSectionItem
                    key={section.id}
                    section={section}
                    index={index}
                    isSelected={selectedSectionId === section.id}
                    onSelect={() => setSelectedSectionId(section.id)}
                    onDuplicate={() => duplicateSection(section.id)}
                    onDelete={() => deleteSection(section.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};
