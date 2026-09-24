import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { signCertificate, verifyCertificate, CertificateData, AlgorithmType } from '@/lib/crypto';
import { generateQRCode, createQRPayload } from '@/lib/qr';
import { generateCertificatePDF } from '@/lib/pdf';
import { bulkIssueCertificateSchema } from '@/lib/validation';
import { apiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export const POST = apiHandler(async (request: NextRequest) => {
  console.log('[BULK] === Request received ===');

  let body: any;
  try {
    body = await request.json();
    console.log('[BULK] Body parsed OK, institutionId:', body?.institutionId, 'students:', body?.students?.length);
  } catch (parseErr: any) {
    console.error('[BULK] Failed to parse request body:', parseErr.message);
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  const { institutionId, privateKey, students } = bulkIssueCertificateSchema.parse(body);
  console.log('[BULK] Zod validation passed');

  const institution = await prisma.institution.findUnique({
    where: { id: institutionId },
  });

  if (!institution) {
    console.log('[BULK] Institution not found:', institutionId);
    return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
  }
  console.log('[BULK] Institution found:', institution.name, 'algo:', institution.algorithm);

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
    console.log('[BULK] Test sign OK');

    const verification = verifyCertificate(testData, testSign.signature, institution.publicKey, algorithm);
    if (!verification.isValid) {
      console.log('[BULK] Key mismatch detected');
      return NextResponse.json(
        {
          error: `Cryptographic Key Mismatch: The provided private key does not match the public root key registered for "${institution.name}". Please ensure you are using the private key generated for this institution.`,
        },
        { status: 400 }
      );
    }
    console.log('[BULK] Key verification passed');
  } catch (keyError: any) {
    console.error('[BULK] Key validation error:', keyError.message);
    return NextResponse.json(
      {
        error: `Invalid Private Key Format: Could not sign using algorithm ${algorithm.toUpperCase()}. (${keyError?.message || 'Invalid PEM key format'})`,
      },
      { status: 400 }
    );
  }

  const startTime = Date.now();
  const issuedCertificates = [];

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    console.log(`[BULK] Processing student ${i + 1}/${students.length}: ${student.studentName}`);

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

    let signature: string, dataHash: string;
    try {
      const result = signCertificate(certData, privateKey, algorithm);
      signature = result.signature;
      dataHash = result.dataHash;
    } catch (signErr: any) {
      console.error(`[BULK]   Sign FAILED:`, signErr.message);
      return NextResponse.json({ error: `Failed to sign certificate for ${student.studentName}: ${signErr.message}` }, { status: 500 });
    }

    let certificate: any;
    try {
      certificate = await prisma.certificate.create({
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
    } catch (dbErr: any) {
      console.error(`[BULK]   DB create FAILED:`, dbErr.message);
      return NextResponse.json({ error: `Database error for ${student.studentName}: ${dbErr.message}` }, { status: 500 });
    }

    let qrCode: string;
    try {
      const qrPayload = createQRPayload(certificate.id, signature, dataHash, algorithm);
      qrCode = await generateQRCode(qrPayload);
    } catch (qrErr: any) {
      console.error(`[BULK]   QR generation FAILED:`, qrErr.message);
      return NextResponse.json({ error: `QR code generation failed for ${student.studentName}: ${qrErr.message}` }, { status: 500 });
    }

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generateCertificatePDF({
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
    } catch (pdfErr: any) {
      console.error(`[BULK]   PDF generation FAILED:`, pdfErr.message, pdfErr.stack);
      return NextResponse.json({ error: `PDF generation failed for ${student.studentName}: ${pdfErr.message}` }, { status: 500 });
    }

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
  console.log(`[BULK] === Success! ${issuedCertificates.length} certificates in ${totalTimeMs}ms ===`);

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

