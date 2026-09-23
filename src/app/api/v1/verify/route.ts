import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getInstitutionByApiKey } from '@/lib/api-key';
import { verifyCertificate, CertificateData, AlgorithmType } from '@/lib/crypto';
import { parseQRPayload } from '@/lib/qr';
import {
  extractTextFromPDF,
  extractCertificateIdFromText,
  extractCertificateFieldsFromText,
  analyzePDFForensics,
} from '@/lib/pdf';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, X-API-KEY, x-credify-key',
    'Access-Control-Max-Age': '86400',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}

function normalizeField(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function determineCertificateDetails(certificate: {
  id: string;
  studentName: string;
  rollNo: string;
  degree: string;
  cgpa: number;
  issueDate: Date | string;
  status: string;
}) {
  const degreeLower = (certificate.degree || '').toLowerCase();
  const rollLower = (certificate.rollNo || '').toLowerCase();
  const issueDateStr = certificate.issueDate instanceof Date 
    ? certificate.issueDate.toISOString() 
    : String(certificate.issueDate || '');
  const formattedDate = issueDateStr ? issueDateStr.split('T')[0] : 'Active Record';

  const isInternship =
    degreeLower.includes('intern') ||
    rollLower.includes('int-') ||
    rollLower.includes('emp-');

  const isHackathon =
    degreeLower.includes('hackathon') ||
    degreeLower.includes('winner') ||
    degreeLower.includes('runner') ||
    degreeLower.includes('track') ||
    degreeLower.includes('place') ||
    degreeLower.includes('prize') ||
    rollLower.includes('team-') ||
    rollLower.includes('hack-');

  if (isInternship) {
    return {
      certificateType: 'internship' as const,
      certificate: {
        id: certificate.id,
        studentName: certificate.studentName,
        rollNo: certificate.rollNo,
        degree: certificate.degree,
        role: certificate.degree,
        grade: `${certificate.cgpa.toFixed(2)} / 10.0`,
        duration: `Issued: ${formattedDate}`,
        cgpa: certificate.cgpa,
        issueDate: issueDateStr,
        status: certificate.status,
      },
    };
  }

  if (isHackathon) {
    let position = 'Distinction Awardee';
    if (degreeLower.includes('1st') || degreeLower.includes('first')) position = '1st Place (Champion)';
    else if (degreeLower.includes('2nd') || degreeLower.includes('second')) position = '2nd Place (Runner Up)';
    else if (degreeLower.includes('3rd') || degreeLower.includes('third')) position = '3rd Place (Finalist)';
    else if (degreeLower.includes('winner')) position = 'Prize Winner';

    return {
      certificateType: 'hackathon' as const,
      certificate: {
        id: certificate.id,
        studentName: certificate.studentName,
        rollNo: certificate.rollNo,
        teamName: certificate.rollNo.startsWith('TEAM-') ? certificate.rollNo : `Team ${certificate.rollNo}`,
        degree: certificate.degree,
        event: "Bhavan's National Hackathon 2026",
        track: certificate.degree,
        position,
        prize: 'Merit Trophy & Distinction',
        cgpa: certificate.cgpa,
        issueDate: issueDateStr,
        status: certificate.status,
      },
    };
  }

  return {
    certificateType: 'degree' as const,
    certificate: {
      id: certificate.id,
      studentName: certificate.studentName,
      rollNo: certificate.rollNo,
      degree: certificate.degree,
      cgpa: certificate.cgpa,
      issueDate: issueDateStr,
      status: certificate.status,
    },
  };
}

function extractApiKey(request: NextRequest): string | null {
  const headerKey =
    request.headers.get('x-api-key') ||
    request.headers.get('X-API-KEY') ||
    request.headers.get('x-credify-key');
  if (headerKey) return headerKey.trim();

  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  const url = new URL(request.url);
  const queryKey = url.searchParams.get('apiKey') || url.searchParams.get('api_key');
  if (queryKey) return queryKey.trim();

  return null;
}

export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders();

  // Rate Limiting
  const ip = getClientIp(request);
  const rateLimitResult = await rateLimit(ip, 'verify_qr');
  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Too many verification requests. Please try again later.',
        retryAfter: rateLimitResult.retryAfter,
      },
      { status: 429, headers: corsHeaders }
    );
  }

  // API Key Authentication
  const apiKey = extractApiKey(request);
  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication failed. Missing API Key. Pass your key in the "x-api-key" header or as "apiKey" query parameter.',
        documentation: '/developers',
      },
      { status: 401, headers: corsHeaders }
    );
  }

  const authInstitution = await getInstitutionByApiKey(apiKey);
  if (!authInstitution) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid API Key. Please check your developer credentials in the Credify dashboard.',
      },
      { status: 401, headers: corsHeaders }
    );
  }

  const contentType = request.headers.get('content-type') || '';

  // Mode 1: PDF File Upload (Multipart Form Data)
  if (contentType.includes('multipart/form-data')) {
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      let certificateId = (formData.get('certificateId') || formData.get('certificate_id') || formData.get('id')) as string || '';

      if (!file || typeof file.arrayBuffer !== 'function') {
        return NextResponse.json(
          { success: false, error: 'Valid PDF file is required in formData under "file"' },
          { status: 400, headers: corsHeaders }
        );
      }

      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        return NextResponse.json(
          { success: false, error: 'Invalid file format. Only PDF documents are accepted.' },
          { status: 400, headers: corsHeaders }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      let extractedPdfText = '';
      let extractedFields: any = null;

      try {
        extractedPdfText = await extractTextFromPDF(buffer);
        const parsedId = extractCertificateIdFromText(extractedPdfText);
        if (parsedId) certificateId = parsedId;
        extractedFields = extractCertificateFieldsFromText(extractedPdfText);
      } catch (err) {
        console.error('Error parsing PDF in API v1:', err);
      }

      let certificate = null;
      if (certificateId && certificateId !== 'extract-from-pdf') {
        certificate = await prisma.certificate.findUnique({
          where: { id: certificateId },
          include: { institution: true },
        });
      }

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

        let result: 'authentic' | 'tampered' | 'revoked';
        if (!verificationResult.isValid || isPdfTextTampered) {
          result = 'tampered';
        } else if (certificate.status === 'revoked') {
          result = 'revoked';
        } else {
          result = 'authentic';
        }

        await prisma.verification.create({
          data: {
            certificateId: certificate.id,
            result,
            method: 'api_pdf_upload',
            ipAddress: ip,
            userAgent: request.headers.get('user-agent') || null,
          },
        });

        const certDetails = determineCertificateDetails(certificate);

        return NextResponse.json(
          {
            success: true,
            result,
            verified: result === 'authentic',
            certificateType: certDetails.certificateType,
            certificate: certDetails.certificate,
            institution: {
              id: certificate.institution.id,
              name: certificate.institution.name,
              algorithm: certificate.institution.algorithm,
            },
            dataHash: certificate.dataHash,
            tamperDetails: isPdfTextTampered
              ? { detected: true, reason: 'Text content modified after cryptographic issuance' }
              : null,
            callerInstitution: authInstitution.name,
            verifiedAt: new Date().toISOString(),
          },
          { headers: corsHeaders }
        );
      }

      // Legacy document without registry record
      const forensicReport = analyzePDFForensics(buffer);
      return NextResponse.json(
        {
          success: true,
          result: 'legacy_unverified',
          verified: false,
          isLegacy: true,
          message: 'Document does not contain a registered digital signature. Performed forensic inspection.',
          forensicReport,
          callerInstitution: authInstitution.name,
          verifiedAt: new Date().toISOString(),
        },
        { headers: corsHeaders }
      );
    } catch (error) {
      console.error('API v1 PDF upload verification error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to process document upload' },
        { status: 500, headers: corsHeaders }
      );
    }
  }

  // Mode 2 & 3: JSON Payload (Certificate ID or QR Payload)
  try {
    const body = await request.json();
    const targetId = (body.id || body.certificateId || body.certId || '').trim();
    const qrPayload = (body.payload || body.qrPayload || '').trim();

    // Mode 2: QR Payload Verification
    if (qrPayload) {
      const parsed = parseQRPayload(qrPayload);
      if (!parsed) {
        return NextResponse.json(
          { success: false, error: 'Invalid QR payload format' },
          { status: 400, headers: corsHeaders }
        );
      }

      const certificate = await prisma.certificate.findUnique({
        where: { id: parsed.id },
        include: { institution: true },
      });

      if (!certificate) {
        return NextResponse.json(
          { success: true, result: 'not_found', verified: false, error: 'Certificate record not found in registry' },
          { status: 404, headers: corsHeaders }
        );
      }

      const hashMatches = !parsed.hash || parsed.hash === certificate.dataHash;
      const sigMatches = !parsed.sig || certificate.signature.startsWith(parsed.sig);

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

      let result: 'authentic' | 'tampered' | 'revoked';
      if (!verificationResult.isValid || !hashMatches || !sigMatches) {
        result = 'tampered';
      } else if (certificate.status === 'revoked') {
        result = 'revoked';
      } else {
        result = 'authentic';
      }

      await prisma.verification.create({
        data: {
          certificateId: certificate.id,
          result,
          method: 'api_qr_scan',
          ipAddress: ip,
          userAgent: request.headers.get('user-agent') || null,
        },
      });

      const certDetails = determineCertificateDetails(certificate);

      return NextResponse.json(
        {
          success: true,
          result,
          verified: result === 'authentic',
          certificateType: certDetails.certificateType,
          certificate: certDetails.certificate,
          institution: {
            id: certificate.institution.id,
            name: certificate.institution.name,
            algorithm: certificate.institution.algorithm,
          },
          dataHash: certificate.dataHash,
          callerInstitution: authInstitution.name,
          verifiedAt: new Date().toISOString(),
        },
        { headers: corsHeaders }
      );
    }

    // Mode 3: Direct Certificate ID Verification
    if (targetId) {
      const certificate = await prisma.certificate.findUnique({
        where: { id: targetId },
        include: { institution: true },
      });

      if (!certificate) {
        return NextResponse.json(
          { success: true, result: 'not_found', verified: false, error: 'Certificate ID not found in registry' },
          { status: 404, headers: corsHeaders }
        );
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

      let result: 'authentic' | 'tampered' | 'revoked';
      if (!verificationResult.isValid) {
        result = 'tampered';
      } else if (certificate.status === 'revoked') {
        result = 'revoked';
      } else {
        result = 'authentic';
      }

      await prisma.verification.create({
        data: {
          certificateId: certificate.id,
          result,
          method: 'api_id_lookup',
          ipAddress: ip,
          userAgent: request.headers.get('user-agent') || null,
        },
      });

      const certDetails = determineCertificateDetails(certificate);

      return NextResponse.json(
        {
          success: true,
          result,
          verified: result === 'authentic',
          certificateType: certDetails.certificateType,
          certificate: certDetails.certificate,
          institution: {
            id: certificate.institution.id,
            name: certificate.institution.name,
            algorithm: certificate.institution.algorithm,
          },
          dataHash: certificate.dataHash,
          callerInstitution: authInstitution.name,
          verifiedAt: new Date().toISOString(),
        },
        { headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid request body. Provide "id" (Certificate ID), "payload" (QR Payload), or upload a PDF "file".',
      },
      { status: 400, headers: corsHeaders }
    );
  } catch (error) {
    console.error('API v1 verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error processing verification' },
      { status: 500, headers: corsHeaders }
    );
  }
}
