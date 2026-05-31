import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken, extractToken } from '@/lib/auth';

async function requireAuth(request: NextRequest) {
  const token = extractToken(request.headers.get('authorization'));
  if (!token) throw new Error('AUTH_REQUIRED');
  return verifyAccessToken(token);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await requireAuth(request);
    const { id } = await params;

    const project = await db.project.findFirst({
      where: { id, userId: payload.sub },
      include: {
        _count: { select: { documents: true } },
        documents: { orderBy: { updatedAt: 'desc' } },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: { code: 'RESOURCE_NOT_FOUND', message: 'Project not found' } },
        { status: 404 }
      );
    }

    const mapped = { ...project, documentsCount: project._count.documents, _count: undefined };
    return NextResponse.json({ data: { project: mapped } });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: { code: 'AUTHENTICATION_REQUIRED', message: 'Token is required' } },
        { status: 401 }
      );
    }
    console.error('Project GET error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch project' } },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await requireAuth(request);
    const { id } = await params;
    const body = await request.json();

    const existing = await db.project.findFirst({ where: { id, userId: payload.sub } });
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'RESOURCE_NOT_FOUND', message: 'Project not found' } },
        { status: 404 }
      );
    }

    const project = await db.project.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name.trim() }),
        ...(body.description !== undefined && { description: body.description?.trim() || null }),
        ...(body.domain !== undefined && { domain: body.domain }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.budget !== undefined && { budget: body.budget ?? null }),
        ...(body.currency !== undefined && { currency: body.currency }),
        ...(body.preferences !== undefined && { preferences: body.preferences }),
      },
      include: { _count: { select: { documents: true } } },
    });

    await db.auditLog.create({
      data: {
        userId: payload.sub,
        action: 'PROJECT_UPDATED',
        entity: 'Project',
        entityId: project.id,
        details: `Updated project: ${project.name}`,
      },
    });

    const mapped = { ...project, documentsCount: project._count.documents, _count: undefined };
    return NextResponse.json({ data: { project: mapped } });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: { code: 'AUTHENTICATION_REQUIRED', message: 'Token is required' } },
        { status: 401 }
      );
    }
    console.error('Project PUT error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update project' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await requireAuth(request);
    const { id } = await params;

    const existing = await db.project.findFirst({ where: { id, userId: payload.sub } });
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'RESOURCE_NOT_FOUND', message: 'Project not found' } },
        { status: 404 }
      );
    }

    await db.document.deleteMany({ where: { projectId: id } });
    await db.project.delete({ where: { id } });

    await db.auditLog.create({
      data: {
        userId: payload.sub,
        action: 'PROJECT_DELETED',
        entity: 'Project',
        entityId: id,
        details: `Deleted project: ${existing.name}`,
      },
    });

    return NextResponse.json({ data: { message: 'Project deleted successfully' } });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: { code: 'AUTHENTICATION_REQUIRED', message: 'Token is required' } },
        { status: 401 }
      );
    }
    console.error('Project DELETE error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete project' } },
      { status: 500 }
    );
  }
}
