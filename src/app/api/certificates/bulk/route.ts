import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { signCertificate, verifyCertificate, CertificateData, AlgorithmType } from '@/lib/crypto';
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

  // Validate private key and algorithm compatibility before processing
  try {
    const testData: CertificateData = {
      studentName: 'Test',
      rollNo: 'Test',
      degree: 'Test',
      cgpa: 10,
      issueDate: '2026-01-01',
      institutionId,
    };
    const testSign = signCertificate(testData, privateKey, algorithm);

    // Verify test signature against institution's public root key
    const verification = verifyCertificate(testData, testSign.signature, institution.publicKey, algorithm);
    if (!verification.isValid) {
      return NextResponse.json(
        {
          error: `Cryptographic Key Mismatch: The provided private key does not match the public root key registered for "${institution.name}". Please ensure you are using the private key generated for this institution.`,
        },
        { status: 400 }
      );
    }
  } catch (keyError: any) {
    return NextResponse.json(
      {
        error: `Invalid Private Key Format: Could not sign using algorithm ${algorithm.toUpperCase()}. (${keyError?.message || 'Invalid PEM key format'})`,
      },
      { status: 400 }
    );
  }

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

    const pdfBuffer = await generateCertificatePDF({
      institutionName: institution.name,
      studentName: student.studentName,
      rollNo: student.rollNo,
      degree: student.degree,
      cgpa: String(student.cgpa),
      issueDate: normalizedDate,
      certificateId: certificate.id,
      qrCodeDataUrl: qrCode,
      algorithm,
      dataHash,
      signature,
    });

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
      pdfBase64: pdfBuffer.toString('base64'),
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
