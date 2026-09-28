import { NextResponse } from 'next/server';
import { turso, isTursoConfigured } from '@/lib/turso';
import { Store, Category, Product, Menu } from '@/types';

export async function GET(req: Request) {
  if (!isTursoConfigured) {
    return NextResponse.json({ success: false, error: 'Turso not configured' }, { status: 400 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const storeIdParam = searchParams.get('store_id');
    const userIdParam = searchParams.get('user_id');

    let storeRes;
    if (storeIdParam) {
      storeRes = await turso.execute({
        sql: 'SELECT * FROM stores WHERE id = ? LIMIT 1',
        args: [storeIdParam],
      });
    } else if (userIdParam) {
      storeRes = await turso.execute({
        sql: 'SELECT * FROM stores WHERE owner_id = ? LIMIT 1',
        args: [userIdParam],
      });
    } else {
      storeRes = await turso.execute('SELECT * FROM stores LIMIT 1');
    }

    if (storeRes.rows.length === 0) {
      return NextResponse.json({ success: true, empty: true });
    }

    const storeRow = storeRes.rows[0] as any;
    const store: Store = {
      id: String(storeRow.id),
      owner_id: String(storeRow.owner_id || 'user-001'),
      slug: String(storeRow.slug),
      name: String(storeRow.name),
      description: String(storeRow.description || ''),
      logo_url: String(storeRow.logo_url || ''),
      bank_name: storeRow.bank_name ? String(storeRow.bank_name) : undefined,
      bank_account_name: storeRow.bank_account_name ? String(storeRow.bank_account_name) : undefined,
      bank_account_number: storeRow.bank_account_number ? String(storeRow.bank_account_number) : undefined,
      promptpay_number: storeRow.promptpay_number ? String(storeRow.promptpay_number) : undefined,
      status: (storeRow.status as any) || 'active',
      created_at: String(storeRow.created_at),
      updated_at: String(storeRow.updated_at),
    };

    const categoriesRes = await turso.execute({
      sql: 'SELECT * FROM categories WHERE store_id = ? ORDER BY sort_order ASC',
      args: [store.id],
    });

    const categories: Category[] = categoriesRes.rows.map((r: any) => ({
      id: String(r.id),
      store_id: String(r.store_id),
      name: String(r.name),
      sort_order: Number(r.sort_order),
      status: (r.status as any) || 'active',
      created_at: String(r.created_at),
      updated_at: String(r.updated_at || r.created_at),
    }));

    const productsRes = await turso.execute({
      sql: 'SELECT * FROM products WHERE store_id = ? ORDER BY sort_order ASC',
      args: [store.id],
    });

    const products: Product[] = productsRes.rows.map((r: any) => ({
      id: String(r.id),
      store_id: String(r.store_id),
      category_id: String(r.category_id),
      name: String(r.name),
      description: r.description ? String(r.description) : undefined,
      image_url: String(r.image_url || ''),
      sale_price: Number(r.sale_price),
      regular_price: r.regular_price !== null && r.regular_price !== undefined ? Number(r.regular_price) : null,
      status: (r.status as any) || 'active',
      sort_order: Number(r.sort_order),
      option_groups: r.option_groups ? JSON.parse(String(r.option_groups)) : [],
      created_at: String(r.created_at),
      updated_at: String(r.updated_at),
    }));

    const menusRes = await turso.execute({
      sql: 'SELECT * FROM menus WHERE store_id = ?',
      args: [store.id],
    });

    let draftMenu: Menu | null = null;
    let publishedMenu: Menu | null = null;

    for (const m of menusRes.rows as any[]) {
      const parsedMenu: Menu = {
        id: String(m.id),
        store_id: String(m.store_id),
        name: String(m.name || 'Menu'),
        slug: String(m.slug || store.slug),
        status: (m.status as any) || 'draft',
        published_at: m.published_at ? String(m.published_at) : null,
        theme: m.theme ? JSON.parse(String(m.theme)) : undefined,
        sections: m.sections ? JSON.parse(String(m.sections)) : [],
        created_at: String(m.created_at || new Date().toISOString()),
        updated_at: String(m.updated_at),
      };

      if (m.status === 'published') {
        publishedMenu = parsedMenu;
      } else {
        draftMenu = parsedMenu;
      }
    }

    return NextResponse.json({
      success: true,
      store,
      categories,
      products,
      draftMenu,
      publishedMenu,
    });
  } catch (error: any) {
    console.error('Turso sync GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isTursoConfigured) {
    return NextResponse.json({ success: false, error: 'Turso not configured' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { store, categories, products, draftMenu, publishedMenu } = body as {
      store: Store;
      categories: Category[];
      products: Product[];
      draftMenu: Menu;
      publishedMenu: Menu;
    };

    if (!store || !store.id) {
      return NextResponse.json({ success: false, error: 'Invalid store data' }, { status: 400 });
    }

    // 1. Update / Insert store
    await turso.execute({
      sql: `INSERT INTO stores (id, owner_id, name, slug, logo_url, description, bank_name, bank_account_name, bank_account_number, promptpay_number, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              owner_id = excluded.owner_id,
              name = excluded.name,
              slug = excluded.slug,
              logo_url = excluded.logo_url,
              description = excluded.description,
              bank_name = excluded.bank_name,
              bank_account_name = excluded.bank_account_name,
              bank_account_number = excluded.bank_account_number,
              promptpay_number = excluded.promptpay_number,
              status = excluded.status,
              updated_at = excluded.updated_at`,
      args: [
        store.id,
        store.owner_id || 'user-001',
        store.name,
        store.slug,
        store.logo_url || '',
        store.description || '',
        store.bank_name || '',
        store.bank_account_name || '',
        store.bank_account_number || '',
        store.promptpay_number || '',
        store.status || 'active',
        store.created_at || new Date().toISOString(),
        new Date().toISOString(),
      ],
    });

    // 2. Sync Categories (delete removed + upsert current)
    await turso.execute({
      sql: 'DELETE FROM categories WHERE store_id = ?',
      args: [store.id],
    });

    for (const cat of categories || []) {
      await turso.execute({
        sql: `INSERT INTO categories (id, store_id, name, sort_order, status, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          cat.id,
          store.id,
          cat.name,
          cat.sort_order,
          cat.status || 'active',
          cat.created_at || new Date().toISOString(),
          cat.updated_at || new Date().toISOString(),
        ],
      });
    }

    // 3. Sync Products
    await turso.execute({
      sql: 'DELETE FROM products WHERE store_id = ?',
      args: [store.id],
    });

    for (const prod of products || []) {
      await turso.execute({
        sql: `INSERT INTO products (id, store_id, category_id, name, description, image_url, sale_price, regular_price, status, sort_order, option_groups, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          prod.id,
          store.id,
          prod.category_id,
          prod.name,
          prod.description || '',
          prod.image_url || '',
          prod.sale_price,
          prod.regular_price ?? null,
          prod.status || 'active',
          prod.sort_order,
          JSON.stringify(prod.option_groups || []),
          prod.created_at || new Date().toISOString(),
          prod.updated_at || new Date().toISOString(),
        ],
      });
    }

    // 4. Sync Menus
    if (draftMenu) {
      await turso.execute({
        sql: `INSERT INTO menus (id, store_id, name, slug, status, published_at, theme, sections, created_at, updated_at)
              VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                slug = excluded.slug,
                published_at = excluded.published_at,
                theme = excluded.theme,
                sections = excluded.sections,
                updated_at = excluded.updated_at`,
        args: [
          draftMenu.id || 'draft-menu',
          store.id,
          draftMenu.name || store.name,
          draftMenu.slug || store.slug,
          draftMenu.published_at || null,
          JSON.stringify(draftMenu.theme || {}),
          JSON.stringify(draftMenu.sections || []),
          draftMenu.created_at || new Date().toISOString(),
          new Date().toISOString(),
        ],
      });
    }

    if (publishedMenu) {
      await turso.execute({
        sql: `INSERT INTO menus (id, store_id, name, slug, status, published_at, theme, sections, created_at, updated_at)
              VALUES (?, ?, ?, ?, 'published', ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                slug = excluded.slug,
                published_at = excluded.published_at,
                theme = excluded.theme,
                sections = excluded.sections,
                updated_at = excluded.updated_at`,
        args: [
          'published-' + (publishedMenu.id || 'menu'),
          store.id,
          publishedMenu.name || store.name,
          publishedMenu.slug || store.slug,
          publishedMenu.published_at || new Date().toISOString(),
          JSON.stringify(publishedMenu.theme || {}),
          JSON.stringify(publishedMenu.sections || []),
          publishedMenu.created_at || new Date().toISOString(),
          new Date().toISOString(),
        ],
      });
    }

    return NextResponse.json({ success: true, message: 'Saved to Turso successfully' });
  } catch (error: any) {
    console.error('Turso sync POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
