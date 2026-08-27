import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { signCertificate, CertificateData, AlgorithmType } from '@/lib/crypto';
import { generateQRCode, createQRPayload } from '@/lib/qr';
import { generateCertificatePDF } from '@/lib/pdf';
import { bulkIssueCertificateSchema } from '@/lib/validation';
import { apiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

export const POST = apiHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { institutionId, privateKey, students } = bulkIssueCertificateSchema.parse(body);

  const institution = await prisma.institution.findUnique({
    where: { id: institutionId },
  });

  if (!institution) {
    return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
  }

  const algorithm = institution.algorithm as AlgorithmType;
  const startTime = Date.now();
  const issuedCertificates = [];

  for (const student of students) {
    const normalizedDate = typeof student.issueDate === 'string' && student.issueDate.includes('T')
      ? student.issueDate.split('T')[0]
      : String(student.issueDate);

    const certData: CertificateData = {
      studentName: student.studentName,
      rollNo: student.rollNo,
      degree: student.degree,
      cgpa: student.cgpa,
      issueDate: normalizedDate,
      institutionId,
    };

    const { signature, dataHash } = signCertificate(certData, privateKey, algorithm);

    const certificate = await prisma.certificate.create({
      data: {
        studentName: student.studentName,
        rollNo: student.rollNo,
        degree: student.degree,
        cgpa: student.cgpa,
        issueDate: new Date(student.issueDate),
        dataHash,
        signature,
        institutionId,
      },
    });

    const qrPayload = createQRPayload(certificate.id, signature, dataHash, algorithm);
    const qrCode = await generateQRCode(qrPayload);

    issuedCertificates.push({
      id: certificate.id,
      studentName: student.studentName,
      rollNo: student.rollNo,
      degree: student.degree,
      cgpa: student.cgpa,
      issueDate: normalizedDate,
      dataHash,
      signature,
      qrCode,
    });
  }

  const totalTimeMs = Date.now() - startTime;

  return NextResponse.json({
    success: true,
    totalIssued: issuedCertificates.length,
    timeTakenMs: totalTimeMs,
    institution: {
      id: institution.id,
      name: institution.name,
      algorithm,
    },
    certificates: issuedCertificates,
  });
});
