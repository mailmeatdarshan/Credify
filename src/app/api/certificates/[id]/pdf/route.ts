import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateCertificatePDF } from '@/lib/pdf';
import { generateQRCode, createQRPayload } from '@/lib/qr';

export const dynamic = 'force-dynamic';

/**
 * GET handler to fetch and generate a PDF for a certificate.
 * 
 * @param request The Next.js request object
 * @param context Route context with params { id: string }
 * @returns PDF as a downloadable response
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        institution: true,
      },
    });

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    const qrPayload = createQRPayload(
      certificate.id,
      certificate.signature,
      certificate.dataHash,
      certificate.institution.algorithm
    );
    const qrCodeDataUrl = await generateQRCode(qrPayload);

    const pdfBuffer = await generateCertificatePDF({
      institutionName: certificate.institution.name,
      studentName: certificate.studentName,
      rollNo: certificate.rollNo,
      degree: certificate.degree,
      cgpa: String(certificate.cgpa),
      issueDate: certificate.issueDate.toISOString().split('T')[0],
      certificateId: certificate.id,
      qrCodeDataUrl,
      algorithm: certificate.institution.algorithm,
      dataHash: certificate.dataHash,
      signature: certificate.signature,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate_${certificate.id}.pdf"`,
      },
    });
  } catch (error: unknown) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
