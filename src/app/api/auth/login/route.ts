import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { turso, isTursoConfigured } from '@/lib/turso';
import { initTursoTables } from '@/lib/turso-schema';
import { Store, Category, Product, Menu } from '@/types';
import {
  DEFAULT_STORE,
  DEFAULT_CATEGORIES,
  DEFAULT_PRODUCTS,
  DEFAULT_MENU,
} from '@/lib/default-data';

export async function POST(req: Request) {
  if (!isTursoConfigured) {
    return NextResponse.json({ success: false, error: 'Turso is not configured' }, { status: 400 });
  }

  try {
    await initTursoTables();
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'กรุณากรอกอีเมลและรหัสผ่าน' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    // 1. Query users table
    const userRes = await turso.execute({
      sql: 'SELECT * FROM users WHERE email = ? AND password_hash = ? LIMIT 1',
      args: [cleanEmail, passwordHash],
    });

    if (userRes.rows.length > 0) {
      const u = userRes.rows[0] as any;
      const userId = String(u.id);
      const storeId = String(u.store_id || '');

      // Fetch User's Store
      const storeRes = await turso.execute({
        sql: 'SELECT * FROM stores WHERE id = ? OR owner_id = ? LIMIT 1',
        args: [storeId, userId],
      });

      if (storeRes.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'ไม่พบข้อมูลร้านอาหารของผู้ใช้' }, { status: 404 });
      }

      const storeRow = storeRes.rows[0] as any;
      const store: Store = {
        id: String(storeRow.id),
        owner_id: String(storeRow.owner_id || userId),
        name: String(storeRow.name),
        slug: String(storeRow.slug),
        logo_url: String(storeRow.logo_url || ''),
        description: String(storeRow.description || ''),
        bank_name: storeRow.bank_name ? String(storeRow.bank_name) : undefined,
        bank_account_name: storeRow.bank_account_name ? String(storeRow.bank_account_name) : undefined,
        bank_account_number: storeRow.bank_account_number ? String(storeRow.bank_account_number) : undefined,
        promptpay_number: storeRow.promptpay_number ? String(storeRow.promptpay_number) : undefined,
        status: (storeRow.status as any) || 'active',
        created_at: String(storeRow.created_at),
        updated_at: String(storeRow.updated_at),
      };

      // Fetch Categories
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

      // Fetch Products
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

      // Fetch Menus
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
          name: String(m.name || store.name),
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
        user: {
          id: userId,
          email: cleanEmail,
          name: String(u.name || ''),
        },
        store,
        categories,
        products,
        draftMenu,
        publishedMenu,
      });
    }

    // Check if default admin demo
    if (cleanEmail === 'owner@somtumhouse.com' && (password === 'password123' || password === 'demo1234')) {
      return NextResponse.json({
        success: true,
        user: {
          id: 'user-001',
          email: 'owner@somtumhouse.com',
          name: 'Somtum House Owner',
        },
        store: DEFAULT_STORE,
        categories: DEFAULT_CATEGORIES,
        products: DEFAULT_PRODUCTS,
        draftMenu: DEFAULT_MENU,
        publishedMenu: null,
      });
    }

    return NextResponse.json({ success: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' }, { status: 500 });
  }
}
