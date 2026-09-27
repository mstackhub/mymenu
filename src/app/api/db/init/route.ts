import { NextResponse } from 'next/server';
import { turso, isTursoConfigured } from '@/lib/turso';
import { initTursoTables } from '@/lib/turso-schema';
import {
  DEFAULT_STORE,
  DEFAULT_CATEGORIES,
  DEFAULT_PRODUCTS,
  DEFAULT_MENU,
} from '@/lib/default-data';

export async function POST() {
  if (!isTursoConfigured) {
    return NextResponse.json({ success: false, error: 'Turso is not configured' }, { status: 400 });
  }

  try {
    // 1. Create tables
    await initTursoTables();

    // 2. Check if default store exists
    const storeCheck = await turso.execute({
      sql: 'SELECT id FROM stores LIMIT 1',
      args: [],
    });

    if (storeCheck.rows.length === 0) {
      // Seed default store
      await turso.execute({
        sql: `INSERT INTO stores (id, owner_id, name, slug, logo_url, description, bank_name, bank_account_name, bank_account_number, promptpay_number, status, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          DEFAULT_STORE.id,
          DEFAULT_STORE.owner_id || 'user-001',
          DEFAULT_STORE.name,
          DEFAULT_STORE.slug,
          DEFAULT_STORE.logo_url || '',
          DEFAULT_STORE.description || '',
          DEFAULT_STORE.bank_name || '',
          DEFAULT_STORE.bank_account_name || '',
          DEFAULT_STORE.bank_account_number || '',
          DEFAULT_STORE.promptpay_number || '',
          DEFAULT_STORE.status || 'active',
          DEFAULT_STORE.created_at || new Date().toISOString(),
          DEFAULT_STORE.updated_at || new Date().toISOString(),
        ],
      });

      // Seed categories
      for (const cat of DEFAULT_CATEGORIES) {
        await turso.execute({
          sql: `INSERT INTO categories (id, store_id, name, sort_order, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [
            cat.id,
            DEFAULT_STORE.id,
            cat.name,
            cat.sort_order,
            cat.status,
            cat.created_at,
            cat.updated_at,
          ],
        });
      }

      // Seed products
      for (const prod of DEFAULT_PRODUCTS) {
        await turso.execute({
          sql: `INSERT INTO products (id, store_id, category_id, name, description, image_url, sale_price, regular_price, status, sort_order, option_groups, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            prod.id,
            DEFAULT_STORE.id,
            prod.category_id,
            prod.name,
            prod.description || '',
            prod.image_url || '',
            prod.sale_price,
            prod.regular_price ?? null,
            prod.status,
            prod.sort_order,
            JSON.stringify(prod.option_groups || []),
            prod.created_at,
            prod.updated_at,
          ],
        });
      }

      // Seed draft and published menu
      await turso.execute({
        sql: `INSERT INTO menus (id, store_id, name, slug, status, published_at, theme, sections, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          DEFAULT_MENU.id || 'draft-menu-01',
          DEFAULT_STORE.id,
          DEFAULT_MENU.name,
          DEFAULT_MENU.slug,
          'draft',
          DEFAULT_MENU.published_at || null,
          JSON.stringify(DEFAULT_MENU.theme || {}),
          JSON.stringify(DEFAULT_MENU.sections || []),
          DEFAULT_MENU.created_at,
          DEFAULT_MENU.updated_at,
        ],
      });

      await turso.execute({
        sql: `INSERT INTO menus (id, store_id, name, slug, status, published_at, theme, sections, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          'published-' + (DEFAULT_MENU.id || 'menu-01'),
          DEFAULT_STORE.id,
          DEFAULT_MENU.name,
          DEFAULT_MENU.slug,
          'published',
          DEFAULT_MENU.published_at || new Date().toISOString(),
          JSON.stringify(DEFAULT_MENU.theme || {}),
          JSON.stringify(DEFAULT_MENU.sections || []),
          DEFAULT_MENU.created_at,
          DEFAULT_MENU.updated_at,
        ],
      });
    }

    return NextResponse.json({ success: true, message: 'Turso tables initialized successfully' });
  } catch (error: any) {
    console.error('Turso init error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
