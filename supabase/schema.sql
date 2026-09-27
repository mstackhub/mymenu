-- Schema for Online Menu Builder

-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. STORES
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT DEFAULT '',
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stores_owner ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_store ON categories(store_id);

-- 3. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  sale_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  regular_price NUMERIC(10, 2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_store ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- 4. OPTION GROUPS
CREATE TABLE IF NOT EXISTS option_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_option_groups_product ON option_groups(product_id);

-- 5. PRODUCT OPTIONS
CREATE TABLE IF NOT EXISTS product_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  option_group_id UUID NOT NULL REFERENCES option_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  additional_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_product_options_group ON product_options(option_group_id);

-- 6. MENUS
CREATE TABLE IF NOT EXISTS menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Main Menu',
  slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menus_store ON menus(store_id);
CREATE INDEX IF NOT EXISTS idx_menus_slug ON menus(slug);

-- 7. MENU SECTIONS
CREATE TABLE IF NOT EXISTS menu_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('store_name', 'logo', 'description', 'image', 'text', 'product_list')),
  sort_order INT NOT NULL DEFAULT 0,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  styles JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_sections_menu ON menu_sections(menu_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_sections ENABLE ROW LEVEL SECURITY;

-- Stores policies
CREATE POLICY "Users can manage own stores" ON stores
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Public can view published stores" ON stores
  FOR SELECT USING (status = 'active');

-- Categories policies
CREATE POLICY "Users can manage own categories" ON categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = categories.store_id AND stores.owner_id = auth.uid())
  );

CREATE POLICY "Public can view active categories" ON categories
  FOR SELECT USING (status = 'active');

-- Products policies
CREATE POLICY "Users can manage own products" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.owner_id = auth.uid())
  );

CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (status = 'active');

-- Option groups & options policies
CREATE POLICY "Users can manage option groups" ON option_groups
  FOR ALL USING (
    EXISTS (SELECT 1 FROM products JOIN stores ON products.store_id = stores.id WHERE products.id = option_groups.product_id AND stores.owner_id = auth.uid())
  );

CREATE POLICY "Public can view option groups" ON option_groups
  FOR SELECT USING (true);

CREATE POLICY "Users can manage product options" ON product_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM option_groups 
      JOIN products ON option_groups.product_id = products.id
      JOIN stores ON products.store_id = stores.id 
      WHERE option_groups.id = product_options.option_group_id AND stores.owner_id = auth.uid()
    )
  );

CREATE POLICY "Public can view product options" ON product_options
  FOR SELECT USING (true);

-- Menus policies
CREATE POLICY "Users can manage own menus" ON menus
  FOR ALL USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = menus.store_id AND stores.owner_id = auth.uid())
  );

CREATE POLICY "Public can view published menus" ON menus
  FOR SELECT USING (status = 'published');

-- Menu sections policies
CREATE POLICY "Users can manage own menu sections" ON menu_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM menus 
      JOIN stores ON menus.store_id = stores.id 
      WHERE menus.id = menu_sections.menu_id AND stores.owner_id = auth.uid()
    )
  );

CREATE POLICY "Public can view published menu sections" ON menu_sections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM menus WHERE menus.id = menu_sections.menu_id AND menus.status = 'published')
  );

-- STORAGE BUCKETS (menu-images)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('menu-images', 'menu-images', true) ON CONFLICT DO NOTHING;
