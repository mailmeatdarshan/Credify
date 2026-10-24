import '@/lib/polyfills';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyCertificate, CertificateData, AlgorithmType } from '@/lib/crypto';
import {
  extractTextFromPDF,
  extractCertificateIdFromText,
  extractCertificateIdFromPDFBuffer,
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

      // 1. First priority: Fast and resilient binary metadata extraction
      const bufferId = extractCertificateIdFromPDFBuffer(buffer);
      if (bufferId) {
        certificateId = bufferId;
      }

      // 2. Second priority: Full text extraction for field-level forensic inspection
      try {
        extractedPdfText = await extractTextFromPDF(buffer);
        const parsedId = extractCertificateIdFromText(extractedPdfText);
        if (parsedId && !certificateId) {
          certificateId = parsedId;
        }
        extractedFields = extractCertificateFieldsFromText(extractedPdfText);
      } catch (err) {
        console.error('Error parsing uploaded PDF text:', err);
      }
    } catch (err) {
      console.error('Error reading uploaded file buffer:', err);
    }
  }

  // 1. If we have a Certificate ID, look it up in the Cryptographic Registry
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
    const discrepancies: Record<string, { expected: string | number; detected: string | number }> = {};

    if (extractedFields) {
      if (extractedFields.studentName && normalizeField(extractedFields.studentName) !== normalizeField(certificate.studentName)) {
        isPdfTextTampered = true;
        discrepancies['Student Name'] = {
          expected: certificate.studentName,
          detected: extractedFields.studentName,
        };
      }
      if (extractedFields.rollNo && normalizeField(extractedFields.rollNo) !== normalizeField(certificate.rollNo)) {
        isPdfTextTampered = true;
        discrepancies['Roll / ID Number'] = {
          expected: certificate.rollNo,
          detected: extractedFields.rollNo,
        };
      }
      if (extractedFields.cgpa && Math.abs(parseFloat(extractedFields.cgpa) - certificate.cgpa) > 0.001) {
        isPdfTextTampered = true;
        discrepancies['CGPA / Evaluation Score'] = {
          expected: certificate.cgpa,
          detected: parseFloat(extractedFields.cgpa),
        };
      }
      if (extractedFields.degree && normalizeField(extractedFields.degree) !== normalizeField(certificate.degree)) {
        isPdfTextTampered = true;
        discrepancies['Degree / Distinction'] = {
          expected: certificate.degree,
          detected: extractedFields.degree,
        };
      }
    }

    const candidateData: CertificateData = {
      studentName: extractedFields?.studentName || certificate.studentName,
      rollNo: extractedFields?.rollNo || certificate.rollNo,
      degree: extractedFields?.degree || certificate.degree,
      cgpa: extractedFields?.cgpa && !isNaN(parseFloat(extractedFields.cgpa))
        ? parseFloat(extractedFields.cgpa)
        : certificate.cgpa,
      issueDate: certificate.issueDate,
      institutionId: certificate.institutionId,
    };

    const verificationResult = verifyCertificate(
      candidateData,
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
      tampering: isPdfTextTampered || !verificationResult.isValid ? {
        detected: true,
        reason: isPdfTextTampered
          ? 'Document field modification detected: Text extracted from uploaded PDF diverges from PKI registered state.'
          : 'Asymmetric signature check failed: Data does not match the authority public root key.',
        discrepancies: Object.keys(discrepancies).length > 0 ? discrepancies : undefined,
      } : undefined,
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
