import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { parseQRPayload } from '@/lib/qr';
import { verifyCertificate, CertificateData, AlgorithmType } from '@/lib/crypto';
import { verifyQRSchema } from '@/lib/validation';
import { apiHandler } from '@/lib/api-handler';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const POST = apiHandler(async (request: NextRequest) => {
  const ip = getClientIp(request);
  const rateLimitResult = await rateLimit(ip, 'verify_qr');
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter) } }
    );
  }

  const body = await request.json();
  const { payload } = verifyQRSchema.parse(body);

  const parsedPayload = parseQRPayload(payload);
  if (!parsedPayload) {
    return NextResponse.json(
      { error: 'Invalid QR payload format' },
      { status: 400 }
    );
  }

  const certificate = await prisma.certificate.findUnique({
    where: { id: parsedPayload.id },
    include: { institution: true },
  });

  if (!certificate) {
    prisma.verification
      .create({
        data: {
          result: 'not_found',
          method: 'qr_scan',
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
          userAgent: request.headers.get('user-agent') || null,
        },
      })
      .catch(() => {});
    return NextResponse.json({ result: 'not_found' });
  }

  // Cross-check QR-embedded values against DB record
  if (parsedPayload.hash && parsedPayload.hash !== certificate.dataHash) {
    await prisma.verification.create({
      data: {
        certificateId: certificate.id,
        result: 'tampered',
        method: 'qr_scan',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        userAgent: request.headers.get('user-agent') || null,
      },
    });
    return NextResponse.json({
      result: 'tampered',
      message: 'QR code hash does not match the certificate record.',
      certificate: {
        id: certificate.id,
        studentName: certificate.studentName,
        rollNo: certificate.rollNo,
        degree: certificate.degree,
        cgpa: certificate.cgpa,
        issueDate: certificate.issueDate,
        status: certificate.status,
      },
      institution: {
        id: certificate.institution.id,
        name: certificate.institution.name,
      },
      verifiedAt: new Date(),
      algorithm: certificate.institution.algorithm,
      dataHash: certificate.dataHash,
    });
  }

  // Verify QR signature prefix matches DB signature
  if (parsedPayload.sig && !certificate.signature.startsWith(parsedPayload.sig)) {
    await prisma.verification.create({
      data: {
        certificateId: certificate.id,
        result: 'tampered',
        method: 'qr_scan',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        userAgent: request.headers.get('user-agent') || null,
      },
    });
    return NextResponse.json({
      result: 'tampered',
      message: 'QR code signature does not match the certificate record.',
      certificate: {
        id: certificate.id,
        studentName: certificate.studentName,
        rollNo: certificate.rollNo,
        degree: certificate.degree,
        cgpa: certificate.cgpa,
        issueDate: certificate.issueDate,
        status: certificate.status,
      },
      institution: {
        id: certificate.institution.id,
        name: certificate.institution.name,
      },
      verifiedAt: new Date(),
      algorithm: certificate.institution.algorithm,
      dataHash: certificate.dataHash,
    });
  }

  const certData: CertificateData = {
    studentName: certificate.studentName,
    rollNo: certificate.rollNo,
    degree: certificate.degree,
    cgpa: certificate.cgpa,
    issueDate: certificate.issueDate,
    institutionId: certificate.institutionId,
  };

  const verificationResult = verifyCertificate(
    certData,
    certificate.signature,
    certificate.institution.publicKey,
    certificate.institution.algorithm as AlgorithmType
  );

  let result: string;
  if (!verificationResult.isValid) {
    result = 'tampered';
  } else if (certificate.status === 'revoked') {
    result = 'revoked';
  } else {
    result = 'authentic';
  }

  const verification = await prisma.verification.create({
    data: {
      certificateId: certificate.id,
      result,
      method: 'qr_scan',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      userAgent: request.headers.get('user-agent') || null,
    },
  });

  return NextResponse.json({
    result,
    certificate: {
      id: certificate.id,
      studentName: certificate.studentName,
      rollNo: certificate.rollNo,
      degree: certificate.degree,
      cgpa: certificate.cgpa,
      issueDate: certificate.issueDate,
      status: certificate.status,
    },
    institution: {
      id: certificate.institution.id,
      name: certificate.institution.name,
    },
    verifiedAt: verification.verifiedAt,
    algorithm: certificate.institution.algorithm,
    dataHash: certificate.dataHash,
  });
});
