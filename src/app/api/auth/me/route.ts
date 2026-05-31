import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken, extractToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json(
        { error: { code: 'AUTHENTICATION_REQUIRED', message: 'Token is required' } },
        { status: 401 }
      );
    }

    const payload = await verifyAccessToken(token);
    const user = await db.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true, avatar: true, bio: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: { code: 'AUTHENTICATION_REQUIRED', message: 'User not found' } },
        { status: 401 }
      );
    }

    return NextResponse.json({ data: { user } });
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json(
      { error: { code: 'AUTHENTICATION_REQUIRED', message: 'Invalid or expired token' } },
      { status: 401 }
    );
  }
}
