import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { updateCertificateSchema } from '@/lib/validation';
import { apiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const certificate = await prisma.certificate.findUnique({
    where: { id: params.id },
    include: { institution: { select: { id: true, name: true, algorithm: true, publicKey: true } } },
  });

  if (!certificate) {
    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
  }

  // Return only non-sensitive fields (exclude full signature and qrPayload)
  return NextResponse.json({
    certificate: {
      id: certificate.id,
      studentName: certificate.studentName,
      rollNo: certificate.rollNo,
      degree: certificate.degree,
      cgpa: certificate.cgpa,
      issueDate: certificate.issueDate,
      dataHash: certificate.dataHash,
      status: certificate.status,
      createdAt: certificate.createdAt,
      institution: certificate.institution,
    },
  });
});

export const PATCH = apiHandler(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { status } = updateCertificateSchema.parse(body);

  const certificate = await prisma.certificate.findUnique({
    where: { id: params.id },
    include: { institution: { select: { ownerId: true } } },
  });

  if (!certificate) {
    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
  }

  // Only the institution that registered this certificate may change its status
  if (!certificate.institution.ownerId || certificate.institution.ownerId !== userId) {
    return NextResponse.json(
      { error: 'You are not authorized to manage certificates for this institution.' },
      { status: 403 }
    );
  }

  const updated = await prisma.certificate.update({
    where: { id: params.id },
    data: { status },
    include: { institution: true },
  });

  return NextResponse.json({ certificate: updated });
});
