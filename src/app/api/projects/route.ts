import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken, extractToken } from '@/lib/auth';

async function requireAuth(request: NextRequest) {
  const token = extractToken(request.headers.get('authorization'));
  if (!token) throw new Error('AUTH_REQUIRED');
  return verifyAccessToken(token);
}

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth(request);

    const projects = await db.project.findMany({
      where: { userId: payload.sub },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { documents: true } },
      },
    });

    const mapped = projects.map((p) => ({
      ...p,
      documentsCount: p._count.documents,
      _count: undefined,
    }));

    return NextResponse.json({ data: { projects: mapped } });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: { code: 'AUTHENTICATION_REQUIRED', message: 'Token is required' } },
        { status: 401 }
      );
    }
    console.error('Projects GET error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch projects' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    const body = await request.json();
    const { name, description, domain, status, budget, currency, preferences } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Project name is required' } },
        { status: 400 }
      );
    }

    const project = await db.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        domain: domain || 'general',
        status: status || 'DRAFT',
        budget: budget ?? null,
        currency: currency || 'USD',
        preferences: preferences || null,
        userId: payload.sub,
      },
      include: { _count: { select: { documents: true } } },
    });

    await db.auditLog.create({
      data: {
        userId: payload.sub,
        action: 'PROJECT_CREATED',
        entity: 'Project',
        entityId: project.id,
        details: `Created project: ${project.name}`,
      },
    });

    const mapped = { ...project, documentsCount: project._count.documents, _count: undefined };

    return NextResponse.json({ data: { project: mapped } }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: { code: 'AUTHENTICATION_REQUIRED', message: 'Token is required' } },
        { status: 401 }
      );
    }
    console.error('Projects POST error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create project' } },
      { status: 500 }
    );
  }
}
