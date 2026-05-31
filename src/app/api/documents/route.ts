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
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'projectId is required' } },
        { status: 400 }
      );
    }

    const project = await db.project.findFirst({ where: { id: projectId, userId: payload.sub } });
    if (!project) {
      return NextResponse.json(
        { error: { code: 'RESOURCE_NOT_FOUND', message: 'Project not found' } },
        { status: 404 }
      );
    }

    const documents = await db.document.findMany({
      where: { projectId },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ data: { documents } });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: { code: 'AUTHENTICATION_REQUIRED', message: 'Token is required' } },
        { status: 401 }
      );
    }
    console.error('Documents GET error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch documents' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    const body = await request.json();
    const { projectId, type, title, content } = body;

    if (!projectId || !type || !title) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'projectId, type, and title are required' } },
        { status: 400 }
      );
    }

    const project = await db.project.findFirst({ where: { id: projectId, userId: payload.sub } });
    if (!project) {
      return NextResponse.json(
        { error: { code: 'RESOURCE_NOT_FOUND', message: 'Project not found' } },
        { status: 404 }
      );
    }

    const existingDocs = await db.document.findMany({ where: { projectId, type } });
    const version = existingDocs.length + 1;

    const document = await db.document.create({
      data: {
        projectId,
        type,
        title: title.trim(),
        content: content || '',
        version,
        userId: payload.sub,
      },
    });

    await db.auditLog.create({
      data: {
        userId: payload.sub,
        action: 'DOCUMENT_CREATED',
        entity: 'Document',
        entityId: document.id,
        details: `Created ${type}: ${title}`,
      },
    });

    return NextResponse.json({ data: { document } }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: { code: 'AUTHENTICATION_REQUIRED', message: 'Token is required' } },
        { status: 401 }
      );
    }
    console.error('Documents POST error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create document' } },
      { status: 500 }
    );
  }
}
