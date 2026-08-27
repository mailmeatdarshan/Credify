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

export const POST = apiHandler(async (request: NextRequest) => {
  const formData = await request.formData();
  let certificateId = (formData.get('certificate_id') as string) || '';
  const file = formData.get('file') as File | null;

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
        (extractedFields.studentName && !certificate.studentName.toLowerCase().includes(extractedFields.studentName.toLowerCase())) ||
        (extractedFields.rollNo && !certificate.rollNo.toLowerCase().includes(extractedFields.rollNo.toLowerCase())) ||
        (extractedFields.cgpa && Math.abs(parseFloat(extractedFields.cgpa) - certificate.cgpa) > 0.001)
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
