import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { apiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (_request: NextRequest) => {
  const institutions = await prisma.institution.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      algorithm: true,
      website: true,
      contactName: true,
      createdAt: true,
      _count: {
        select: { certificates: true },
      },
    },
  });

  return NextResponse.json({
    institutions: institutions.map((inst) => ({
      id: inst.id,
      name: inst.name,
      email: inst.email,
      algorithm: inst.algorithm,
      website: inst.website,
      contactName: inst.contactName,
      certificateCount: inst._count.certificates,
      createdAt: inst.createdAt,
    })),
  });
});
