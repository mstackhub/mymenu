import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { turso, isTursoConfigured } from '@/lib/turso';
import { initTursoTables } from '@/lib/turso-schema';

export async function POST(req: Request) {
  if (!isTursoConfigured) {
    return NextResponse.json({ success: false, error: 'Turso is not configured' }, { status: 400 });
  }

  try {
    await initTursoTables();
    const body = await req.json();
    const { userId, email, currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' },
        { status: 400 }
      );
    }

    const currentHash = crypto.createHash('sha256').update(currentPassword).digest('hex');
    const newHash = crypto.createHash('sha256').update(newPassword).digest('hex');

    // Find user by userId or email
    let userRes;
    if (userId) {
      userRes = await turso.execute({
        sql: 'SELECT * FROM users WHERE id = ? LIMIT 1',
        args: [userId],
      });
    } else if (email) {
      userRes = await turso.execute({
        sql: 'SELECT * FROM users WHERE email = ? LIMIT 1',
        args: [email.toLowerCase().trim()],
      });
    } else {
      // Fallback: update the single store owner if only 1 user exists
      userRes = await turso.execute('SELECT * FROM users LIMIT 1');
    }

    if (!userRes || userRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบบัญชีผู้ใช้งานในระบบ' },
        { status: 404 }
      );
    }

    const user = userRes.rows[0] as any;
    if (user.password_hash !== currentHash) {
      return NextResponse.json(
        { success: false, error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    await turso.execute({
      sql: 'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?',
      args: [newHash, now, user.id],
    });

    return NextResponse.json({
      success: true,
      message: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว',
    });
  } catch (err: any) {
    console.error('Error changing password:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน' },
      { status: 500 }
    );
  }
}
