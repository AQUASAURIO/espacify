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

    if (payload.role !== 'SUPER_ADMIN' && payload.role !== 'ADMIN') {
      return NextResponse.json(
        { error: { code: 'AUTHORIZATION_DENIED', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const entries = await db.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    const mapped = entries.map((e) => ({
      id: e.id,
      userId: e.userId,
      userName: e.user?.name || 'System',
      userEmail: e.user?.email || null,
      action: e.action,
      entity: e.entity,
      entityId: e.entityId,
      details: e.details,
      ipAddress: e.ipAddress,
      createdAt: e.createdAt,
    }));

    return NextResponse.json({ data: { entries: mapped } });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid or expired')) {
      return NextResponse.json(
        { error: { code: 'AUTHENTICATION_REQUIRED', message: 'Invalid or expired token' } },
        { status: 401 }
      );
    }
    console.error('Audit GET error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch audit logs' } },
      { status: 500 }
    );
  }
}
