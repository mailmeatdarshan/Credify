import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { signCertificate, verifyCertificate, CertificateData, AlgorithmType } from '@/lib/crypto';
import { generateQRCode, createQRPayload } from '@/lib/qr';
import { generateCertificatePDF } from '@/lib/pdf';
import { issueCertificateSchema } from '@/lib/validation';
import { apiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export const POST = apiHandler(async (request: NextRequest) => {
  console.log('[ISSUE] === Request received ===');
  
  let body: any;
  try {
    body = await request.json();
    console.log('[ISSUE] Body parsed OK, institutionId:', body?.institutionId, 'students:', body?.students?.length);
  } catch (parseErr: any) {
    console.error('[ISSUE] Failed to parse request body:', parseErr.message);
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  const { institutionId, privateKey, students } = issueCertificateSchema.parse(body);
  console.log('[ISSUE] Zod validation passed');

  const institution = await prisma.institution.findUnique({
    where: { id: institutionId },
  });

  if (!institution) {
    console.log('[ISSUE] Institution not found:', institutionId);
    return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
  }
  console.log('[ISSUE] Institution found:', institution.name, 'algo:', institution.algorithm);

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
    console.log('[ISSUE] Test sign OK');

    const verification = verifyCertificate(testData, testSign.signature, institution.publicKey, algorithm);
    if (!verification.isValid) {
      console.log('[ISSUE] Key mismatch detected');
      return NextResponse.json(
        {
          error: `Cryptographic Key Mismatch: The provided private key does not match the public root key registered for "${institution.name}". Please ensure you are using the private key generated for this institution.`,
        },
        { status: 400 }
      );
    }
    console.log('[ISSUE] Key verification passed');
  } catch (keyError: any) {
    console.error('[ISSUE] Key validation error:', keyError.message);
    return NextResponse.json(
      {
        error: `Invalid Private Key Format: Could not sign using algorithm ${algorithm.toUpperCase()}. (${keyError?.message || 'Invalid PEM key format'})`,
      },
      { status: 400 }
    );
  }

  const issuedCertificates = [];

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    console.log(`[ISSUE] Processing student ${i + 1}/${students.length}: ${student.studentName}`);

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

    // Step 1: Sign
    let signature: string, dataHash: string;
    try {
      const result = signCertificate(certData, privateKey, algorithm);
      signature = result.signature;
      dataHash = result.dataHash;
      console.log(`[ISSUE]   Signed OK, hash: ${dataHash.substring(0, 16)}...`);
    } catch (signErr: any) {
      console.error(`[ISSUE]   Sign FAILED:`, signErr.message);
      return NextResponse.json({ error: `Failed to sign certificate for ${student.studentName}: ${signErr.message}` }, { status: 500 });
    }

    // Step 2: DB create
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
      console.log(`[ISSUE]   DB record created: ${certificate.id}`);
    } catch (dbErr: any) {
      console.error(`[ISSUE]   DB create FAILED:`, dbErr.message);
      return NextResponse.json({ error: `Database error for ${student.studentName}: ${dbErr.message}` }, { status: 500 });
    }

    // Step 3: QR code
    let qrCode: string;
    try {
      const qrPayload = createQRPayload(certificate.id, signature, dataHash, algorithm);
      qrCode = await generateQRCode(qrPayload);
      console.log(`[ISSUE]   QR generated OK, length: ${qrCode.length}`);
    } catch (qrErr: any) {
      console.error(`[ISSUE]   QR generation FAILED:`, qrErr.message);
      return NextResponse.json({ error: `QR code generation failed for ${student.studentName}: ${qrErr.message}` }, { status: 500 });
    }

    // Step 4: PDF
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generateCertificatePDF({
        institutionName: institution.name,
        studentName: certData.studentName,
        rollNo: certData.rollNo,
        degree: certData.degree,
        cgpa: String(certData.cgpa),
        issueDate: normalizedDate,
        certificateId: certificate.id,
        qrCodeDataUrl: qrCode,
        algorithm,
        dataHash,
        signature,
      });
      console.log(`[ISSUE]   PDF generated OK, size: ${pdfBuffer.length} bytes`);
    } catch (pdfErr: any) {
      console.error(`[ISSUE]   PDF generation FAILED:`, pdfErr.message, pdfErr.stack);
      return NextResponse.json({ error: `PDF generation failed for ${student.studentName}: ${pdfErr.message}` }, { status: 500 });
    }

    issuedCertificates.push({
      id: certificate.id,
      studentName: student.studentName,
      dataHash,
      signature,
      qrCode,
      pdfBase64: pdfBuffer.toString('base64'),
    });
  }

  console.log(`[ISSUE] === Success! ${issuedCertificates.length} certificates issued ===`);
  return NextResponse.json({ certificates: issuedCertificates });
});
