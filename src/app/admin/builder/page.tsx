'use client';

import React from 'react';
import { ElementsSidebar } from '@/components/builder/ElementsSidebar';
import { PreviewCenter } from '@/components/builder/PreviewCenter';
import { PropertiesPanel } from '@/components/builder/PropertiesPanel';

export default function MenuBuilderPage() {
  return (
    <div className="flex-1 flex h-full w-full overflow-hidden">
      {/* Left Column: Elements & Drag-and-Drop Sections */}
      <ElementsSidebar />

      {/* Center Column: Live Menu Preview Canvas & Viewport Switchers */}
      <PreviewCenter />

      {/* Right Column: Properties & Styling Controls Panel */}
      <PropertiesPanel />
    </div>
  );
}
