import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { apiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const institutionId = searchParams.get('institutionId');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const skip = (page - 1) * limit;

  const where = institutionId ? { institutionId } : {};

  const [certificates, total] = await Promise.all([
    prisma.certificate.findMany({
      where,
      include: { institution: { select: { id: true, name: true, algorithm: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.certificate.count({ where }),
  ]);

  return NextResponse.json({
    certificates,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
