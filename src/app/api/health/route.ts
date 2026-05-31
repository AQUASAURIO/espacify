import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        service: 'Espacify',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'UNHEALTHY', message: 'Database connection failed' } },
      { status: 503 }
    );
  }
}
