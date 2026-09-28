import { NextResponse } from 'next/server';
import { turso, isTursoConfigured } from '@/lib/turso';
import { initTursoTables } from '@/lib/turso-schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isTursoConfigured) {
    // If Turso is not configured, we fallback to non-setup mode or local mode
    return NextResponse.json({ success: true, isSetupMode: false, userCount: 1 });
  }

  try {
    await initTursoTables();
    const result = await turso.execute('SELECT COUNT(*) as count FROM users;');
    const count = Number(result.rows[0]?.count || 0);

    return NextResponse.json({
      success: true,
      isSetupMode: count === 0,
      userCount: count,
    });
  } catch (err: any) {
    console.error('Error checking auth status:', err);
    return NextResponse.json({
      success: false,
      isSetupMode: false,
      error: err.message,
    }, { status: 500 });
  }
}
