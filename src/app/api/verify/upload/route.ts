import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyCertificate, CertificateData, AlgorithmType } from '@/lib/crypto';
import {
  extractTextFromPDF,
  extractCertificateIdFromText,
  extractCertificateFieldsFromText,
  analyzePDFForensics,
} from '@/lib/pdf';
import { apiHandler } from '@/lib/api-handler';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

function normalizeField(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

export const POST = apiHandler(async (request: NextRequest) => {
  const formData = await request.formData();
  
  const ip = getClientIp(request);
  const rateLimitResult = await rateLimit(ip, 'verify_upload');
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let certificateId = (formData.get('certificate_id') as string) || '';
  const file = formData.get('file') as File | null;

  if (!file || typeof file.arrayBuffer !== 'function') {
    return NextResponse.json({ error: 'Valid file is required' }, { status: 400 });
  }
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    return NextResponse.json({ error: 'Please upload a valid PDF document.' }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File size must not exceed 10MB' }, { status: 400 });
  }

  let buffer: Buffer | null = null;
  let extractedPdfText = '';
  let extractedFields: any = null;

  if (file && typeof file.arrayBuffer === 'function') {
    try {
      buffer = Buffer.from(await file.arrayBuffer());
      extractedPdfText = await extractTextFromPDF(buffer);
      const parsedId = extractCertificateIdFromText(extractedPdfText);
      if (parsedId) {
        certificateId = parsedId;
      }
      extractedFields = extractCertificateFieldsFromText(extractedPdfText);
    } catch (err) {
      console.error('Error parsing uploaded PDF text:', err);
    }
  }

  // 1. If we have a Certificate ID, try looking it up in the Cryptographic Registry
  let certificate = null;
  if (certificateId && certificateId !== 'extract-from-pdf') {
    certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
      include: { institution: true },
    });
  }

  // 2. Case A: Certificate Found in Cryptographic PKI Registry -> Verify Math Signature
  if (certificate) {
    let isPdfTextTampered = false;
    if (extractedFields) {
      if (
        (extractedFields.studentName && normalizeField(extractedFields.studentName) !== normalizeField(certificate.studentName)) ||
        (extractedFields.rollNo && normalizeField(extractedFields.rollNo) !== normalizeField(certificate.rollNo)) ||
        (extractedFields.cgpa && Math.abs(parseFloat(extractedFields.cgpa) - certificate.cgpa) > 0.001) ||
        (extractedFields.degree && normalizeField(extractedFields.degree) !== normalizeField(certificate.degree))
      ) {
        isPdfTextTampered = true;
      }
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
    if (!verificationResult.isValid || isPdfTextTampered) {
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
        method: 'pdf_upload',
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
  }

  // 3. Case B: Unsigned Legacy Document / Internship Certificate -> Perform Deep PDF Forensics
  if (buffer) {
    const forensicReport = analyzePDFForensics(buffer);

    return NextResponse.json({
      result: 'legacy_unverified',
      isLegacy: true,
      forensicReport,
      extractedTextSnippet: extractedPdfText.substring(0, 300),
      message: 'Document does not contain a Credify cryptographic signature. Performed deep PDF forensic analysis.',
    });
  }

  return NextResponse.json(
    { error: 'Could not process or read the uploaded document buffer.' },
    { status: 400 }
  );
});
