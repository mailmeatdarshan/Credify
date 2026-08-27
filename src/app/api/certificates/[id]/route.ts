import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { updateCertificateSchema } from '@/lib/validation';
import { apiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const certificate = await prisma.certificate.findUnique({
    where: { id: params.id },
    include: { institution: true },
  });

  if (!certificate) {
    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
  }

  return NextResponse.json({ certificate });
});

export const PATCH = apiHandler(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const body = await request.json();
  const { status } = updateCertificateSchema.parse(body);

  const certificate = await prisma.certificate.findUnique({
    where: { id: params.id },
  });

  if (!certificate) {
    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
  }

  const updated = await prisma.certificate.update({
    where: { id: params.id },
    data: { status },
    include: { institution: true },
  });

  return NextResponse.json({ certificate: updated });
});
