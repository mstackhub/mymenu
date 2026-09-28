import { turso } from './turso';

export async function initTursoTables() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      store_id TEXT,
      reset_code TEXT,
      reset_expires_at TEXT,
      created_at TEXT,
      updated_at TEXT
    );
  `);

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY,
      owner_id TEXT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE,
      logo_url TEXT,
      description TEXT,
      bank_name TEXT,
      bank_account_name TEXT,
      bank_account_number TEXT,
      promptpay_number TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT,
      updated_at TEXT
    );
  `);

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      store_id TEXT,
      name TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at TEXT,
      updated_at TEXT
    );
  `);

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      store_id TEXT,
      category_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      sale_price REAL DEFAULT 0,
      regular_price REAL,
      status TEXT DEFAULT 'active',
      sort_order INTEGER DEFAULT 0,
      option_groups TEXT,
      created_at TEXT,
      updated_at TEXT
    );
  `);

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS menus (
      id TEXT PRIMARY KEY,
      store_id TEXT,
      name TEXT,
      slug TEXT,
      status TEXT DEFAULT 'draft',
      published_at TEXT,
      theme TEXT,
      sections TEXT,
      created_at TEXT,
      updated_at TEXT
    );
  `);

  // Migrate existing tables if columns are missing
  try {
    await turso.execute('ALTER TABLE products ADD COLUMN description TEXT;');
  } catch (e) {}

  try {
    await turso.execute('ALTER TABLE users ADD COLUMN reset_code TEXT;');
  } catch (e) {}

  try {
    await turso.execute('ALTER TABLE users ADD COLUMN reset_expires_at TEXT;');
  } catch (e) {}
}
