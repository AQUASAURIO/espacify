import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signAccessToken, signRefreshToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' } },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return NextResponse.json(
        { error: { code: 'AUTHENTICATION_REQUIRED', message: 'Invalid email or password' } },
        { status: 401 }
      );
    }

    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      return NextResponse.json(
        { error: { code: 'AUTHENTICATION_REQUIRED', message: 'Account is temporarily locked. Try again later.' } },
        { status: 401 }
      );
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      await db.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: { increment: 1 },
          ...(user.loginAttempts >= 4 ? { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) } : {}),
        },
      });

      return NextResponse.json(
        { error: { code: 'AUTHENTICATION_REQUIRED', message: 'Invalid email or password' } },
        { status: 401 }
      );
    }

    if (user.loginAttempts > 0) {
      await db.user.update({
        where: { id: user.id },
        data: { loginAttempts: 0, lockedUntil: null },
      });
    }

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        entity: 'User',
        entityId: user.id,
        details: `User ${user.name} logged in`,
        ipAddress: request.headers.get('x-forwarded-for') || null,
      },
    });

    const accessToken = await signAccessToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    const refreshToken = await signRefreshToken(user.id);

    return NextResponse.json({
      data: {
        user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
