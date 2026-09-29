import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { turso, isTursoConfigured } from '@/lib/turso';
import { initTursoTables } from '@/lib/turso-schema';

async function sendResetEmail(toEmail: string, code: string, userName?: string): Promise<{ success: boolean; error?: string }> {
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'MyMenu Security <onboarding@resend.dev>',
          to: toEmail,
          subject: `[MyMenu] รหัสรีเซ็ตรหัสผ่านของคุณ: ${code}`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e4e4e7; border-radius: 16px;">
              <h2 style="color: #f97316; margin-top: 0;">MyMenu Backoffice</h2>
              <p>สวัสดี ${userName || 'คุณเจ้าของร้าน'},</p>
              <p>คุณได้ทำการร้องขอรหัสผ่านใหม่สำหรับระบบ MyMenu โปรดใช้รหัสยืนยัน 4 หลักด้านล่างนี้ในการตั้งรหัสผ่านใหม่:</p>
              <div style="background-color: #f4f4f5; padding: 16px; text-align: center; border-radius: 12px; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #18181b;">${code}</span>
              </div>
              <p style="color: #71717a; font-size: 13px;">รหัสนี้มีอายุการใช้งาน 15 นาที หากคุณไม่ได้เป็นผู้ส่งคำขอนี้ โปรดเพิกเฉยอีเมลฉบับนี้</p>
            </div>
          `,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('Resend API returned error:', res.status, errData);
        return { success: false, error: errData.message || 'Resend error' };
      }

      return { success: true };
    } catch (e: any) {
      console.error('Failed to send email via Resend:', e);
      return { success: false, error: e.message };
    }
  } else {
    console.log(`[AUTH] 4-digit Reset Code for ${toEmail}: ${code}`);
    return { success: false, error: 'No RESEND_API_KEY' };
  }
}

export async function POST(req: Request) {
  if (!isTursoConfigured) {
    return NextResponse.json({ success: false, error: 'Turso is not configured' }, { status: 400 });
  }

  try {
    await initTursoTables();
    const body = await req.json();
    const { action, email, code, newPassword } = body;

    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุอีเมล' }, { status: 400 });
    }

    // Step 1: Request 4-digit code
    if (action === 'request_code') {
      const userRes = await turso.execute({
        sql: 'SELECT * FROM users WHERE email = ? LIMIT 1',
        args: [cleanEmail],
      });

      if (userRes.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'ไม่พบบัญชีผู้ใช้งานที่ผูกกับอีเมลนี้' },
          { status: 404 }
        );
      }

      const user = userRes.rows[0] as any;
      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      await turso.execute({
        sql: 'UPDATE users SET reset_code = ?, reset_expires_at = ? WHERE id = ?',
        args: [otpCode, expiresAt, user.id],
      });

      const emailResult = await sendResetEmail(cleanEmail, otpCode, user.name);

      return NextResponse.json({
        success: true,
        message: emailResult.success
          ? 'ส่งรหัสยืนยัน 4 หลักไปยังอีเมลของคุณแล้ว (โปรดตรวจสอบกล่องข้อความหรือโฟลเดอร์ Spam/Junk)'
          : 'สร้างรหัสยืนยันเรียบร้อยแล้ว (โปรดใช้รหัสบนหน้าจอ)',
        codePreview: !emailResult.success ? otpCode : undefined,
      });
    }

    // Step 2: Reset Password with 4-digit code
    if (action === 'reset_password') {
      if (!code || !newPassword) {
        return NextResponse.json(
          { success: false, error: 'กรุณาระบุรหัสยืนยัน 4 หลักและรหัสผ่านใหม่' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' },
          { status: 400 }
        );
      }

      const userRes = await turso.execute({
        sql: 'SELECT * FROM users WHERE email = ? LIMIT 1',
        args: [cleanEmail],
      });

      if (userRes.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'ไม่พบบัญชีผู้ใช้งาน' },
          { status: 404 }
        );
      }

      const user = userRes.rows[0] as any;

      if (!user.reset_code || String(user.reset_code).trim() !== String(code).trim()) {
        return NextResponse.json(
          { success: false, error: 'รหัสยืนยัน 4 หลักไม่ถูกต้อง' },
          { status: 400 }
        );
      }

      if (user.reset_expires_at && new Date(user.reset_expires_at).getTime() < Date.now()) {
        return NextResponse.json(
          { success: false, error: 'รหัสยืนยันหมดอายุแล้ว กรุณากดขอรหัสใหม่อีกครั้ง' },
          { status: 400 }
        );
      }

      const newHash = crypto.createHash('sha256').update(newPassword).digest('hex');
      const now = new Date().toISOString();

      await turso.execute({
        sql: 'UPDATE users SET password_hash = ?, reset_code = NULL, reset_expires_at = NULL, updated_at = ? WHERE id = ?',
        args: [newHash, now, user.id],
      });

      return NextResponse.json({
        success: true,
        message: 'รีเซ็ตรหัสผ่านใหม่เรียบร้อยแล้ว สามารถเข้าสู่ระบบได้ทันที',
      });
    }

    return NextResponse.json({ success: false, error: 'คำสั่งไม่ถูกต้อง' }, { status: 400 });
  } catch (err: any) {
    console.error('Error in forgot-password route:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'เกิดข้อผิดพลาดในการกู้คืนรหัสผ่าน' },
      { status: 500 }
    );
  }
}
