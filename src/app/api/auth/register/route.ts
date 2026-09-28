import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { turso, isTursoConfigured } from '@/lib/turso';
import { initTursoTables } from '@/lib/turso-schema';
import { Store, Menu, MenuSection } from '@/types';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'store';
}

export async function POST(req: Request) {
  if (!isTursoConfigured) {
    return NextResponse.json({ success: false, error: 'Turso is not configured' }, { status: 400 });
  }

  try {
    await initTursoTables();
    const body = await req.json();
    const { email, password, name, storeName } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'กรุณากรอกอีเมลและรหัสผ่าน' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    // Check if user already exists
    const existingUser = await turso.execute({
      sql: 'SELECT id FROM users WHERE email = ? LIMIT 1',
      args: [cleanEmail],
    });

    if (existingUser.rows.length > 0) {
      return NextResponse.json({ success: false, error: 'อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบ' }, { status: 400 });
    }

    const userId = 'user-' + Date.now();
    const storeId = 'store-' + Date.now();
    const menuId = 'menu-' + Date.now();

    const finalStoreName = (storeName || name || 'ร้านของฉัน').trim();
    let baseSlug = slugify(finalStoreName);
    
    // Check if slug is unique
    const slugCheck = await turso.execute({
      sql: 'SELECT id FROM stores WHERE slug = ? LIMIT 1',
      args: [baseSlug],
    });

    let finalSlug = baseSlug;
    if (slugCheck.rows.length > 0) {
      finalSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const now = new Date().toISOString();

    // 1. Create User
    await turso.execute({
      sql: `INSERT INTO users (id, email, password_hash, name, store_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [userId, cleanEmail, passwordHash, name || '', storeId, now, now],
    });

    // 2. Create Blank Store
    const newStore: Store = {
      id: storeId,
      owner_id: userId,
      name: finalStoreName,
      slug: finalSlug,
      logo_url: '',
      description: '',
      bank_name: '',
      bank_account_name: '',
      bank_account_number: '',
      promptpay_number: '',
      status: 'active',
      created_at: now,
      updated_at: now,
    };

    await turso.execute({
      sql: `INSERT INTO stores (id, owner_id, name, slug, logo_url, description, bank_name, bank_account_name, bank_account_number, promptpay_number, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        newStore.id,
        newStore.owner_id,
        newStore.name,
        newStore.slug,
        newStore.logo_url || '',
        newStore.description || '',
        newStore.bank_name || '',
        newStore.bank_account_name || '',
        newStore.bank_account_number || '',
        newStore.promptpay_number || '',
        newStore.status,
        newStore.created_at,
        newStore.updated_at,
      ],
    });

    // 3. Create Clean Initial Draft Menu (Starter layout without fake products)
    const starterSections: MenuSection[] = [
      {
        id: `sec-${Date.now()}-1`,
        menu_id: menuId,
        type: 'store_name',
        sort_order: 1,
        content: { text: finalStoreName },
        styles: {
          fontSize: 24,
          fontSizeMobile: 20,
          fontWeight: 700,
          textAlign: 'center',
          color: '#18181B',
          margin: { top: 16, right: 0, bottom: 8, left: 0 },
        },
      },
      {
        id: `sec-${Date.now()}-2`,
        menu_id: menuId,
        type: 'category_slider',
        sort_order: 2,
        content: {
          showAll: true,
          allLabel: 'ทั้งหมด',
        },
        styles: {
          alignment: 'center',
          tabStyle: 'pill',
          margin: { top: 0, right: 0, bottom: 16, left: 0 },
        },
      },
      {
        id: `sec-${Date.now()}-3`,
        menu_id: menuId,
        type: 'product_list',
        sort_order: 3,
        content: {
          selectionMode: 'auto',
          display: 'image-text-price',
        },
        styles: {
          columns: 1,
          gap: 12,
          margin: { top: 0, right: 0, bottom: 24, left: 0 },
        },
      },
    ];

    const newDraftMenu: Menu = {
      id: menuId,
      store_id: storeId,
      name: `${finalStoreName} Menu`,
      slug: finalSlug,
      status: 'draft',
      published_at: null,
      theme: {
        presetId: 'minimal-white',
        fontFamily: "'Prompt', sans-serif",
        backgroundType: 'color',
        pageBgColor: '#FFFFFF',
        cardBgColor: '#FFFFFF',
        cardBorderColor: '#E4E4E7',
        textColor: '#18181B',
        textMutedColor: '#71717A',
        accentColor: '#FF5A36',
        priceColor: '#FF5A36',
        isDark: false,
        contentMaxWidth: 'wide',
      },
      sections: starterSections,
      created_at: now,
      updated_at: now,
    };

    await turso.execute({
      sql: `INSERT INTO menus (id, store_id, name, slug, status, published_at, theme, sections, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?)`,
      args: [
        newDraftMenu.id,
        newDraftMenu.store_id,
        newDraftMenu.name,
        newDraftMenu.slug,
        null,
        JSON.stringify(newDraftMenu.theme || {}),
        JSON.stringify(newDraftMenu.sections || []),
        newDraftMenu.created_at,
        newDraftMenu.updated_at,
      ],
    });

    const userProfile = {
      id: userId,
      email: cleanEmail,
      name: name || '',
    };

    return NextResponse.json({
      success: true,
      user: userProfile,
      store: newStore,
      categories: [],
      products: [],
      draftMenu: newDraftMenu,
      publishedMenu: null,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: error.message || 'เกิดข้อผิดพลาดในการลงทะเบียน' }, { status: 500 });
  }
}
