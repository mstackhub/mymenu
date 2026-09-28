import { NextResponse } from 'next/server';
import { turso, isTursoConfigured } from '@/lib/turso';
import { Store, Category, Product, Menu } from '@/types';

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  if (!isTursoConfigured) {
    return NextResponse.json({ success: false, error: 'Turso not configured' }, { status: 400 });
  }

  try {
    const storeRes = await turso.execute({
      sql: 'SELECT * FROM stores WHERE slug = ? LIMIT 1',
      args: [slug],
    });

    if (storeRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
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
      sql: "SELECT * FROM categories WHERE store_id = ? AND status = 'active' ORDER BY sort_order ASC",
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
      sql: "SELECT * FROM products WHERE store_id = ? AND status = 'active' ORDER BY sort_order ASC",
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

    const menuRes = await turso.execute({
      sql: "SELECT * FROM menus WHERE store_id = ? ORDER BY CASE WHEN status = 'published' THEN 1 ELSE 2 END, updated_at DESC LIMIT 1",
      args: [store.id],
    });

    let menu: Menu | null = null;
    if (menuRes.rows.length > 0) {
      const m = menuRes.rows[0] as any;
      menu = {
        id: String(m.id),
        store_id: String(m.store_id),
        name: String(m.name || store.name),
        slug: String(m.slug || store.slug),
        status: (m.status as any) || 'published',
        published_at: m.published_at ? String(m.published_at) : null,
        theme: m.theme ? JSON.parse(String(m.theme)) : undefined,
        sections: m.sections ? JSON.parse(String(m.sections)) : [],
        created_at: String(m.created_at || new Date().toISOString()),
        updated_at: String(m.updated_at),
      };
    }

    return NextResponse.json({
      success: true,
      store,
      menu,
      categories,
      products,
    });
  } catch (error: any) {
    console.error('Turso public menu GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
