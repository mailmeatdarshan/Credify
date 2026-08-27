import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

export interface CertificatePDFData {
  institutionName: string;
  studentName: string;
  rollNo: string;
  degree: string;
  cgpa: string;
  issueDate: string;
  certificateId: string;
  qrCodeDataUrl: string;
  algorithm: string;
  dataHash: string;
  signature: string;
}

/**
 * Generates a professional-looking certificate PDF and returns it as a Buffer.
 * Adapts phrasing dynamically based on whether it is an Academic Degree, Internship, or Hackathon Certificate.
 * @param data - The certificate data.
 * @returns A promise that resolves to the PDF buffer.
 */
export async function generateCertificatePDF(data: CertificatePDFData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 50,
      });

      const stream = new PassThrough();
      const chunks: Buffer[] = [];

      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', (err) => reject(err));

      doc.pipe(stream);

      // Smart category detection for certificate phrasing
      const degreeLower = (data.degree || '').toLowerCase();
      const rollLower = (data.rollNo || '').toLowerCase();

      const isInternship = degreeLower.includes('intern') || rollLower.includes('int-') || rollLower.includes('emp-');
      const isHackathon = degreeLower.includes('hackathon') || degreeLower.includes('winner') || degreeLower.includes('runner') || degreeLower.includes('track') || rollLower.includes('team-') || rollLower.includes('hack-');

      let certTitle = 'Certificate of Graduation';
      let idPrefix = 'Roll No';
      let completionText = 'has successfully completed the degree requirements of';
      let scoreText = `with a CGPA of ${data.cgpa}`;

      if (isInternship) {
        certTitle = 'Certificate of Internship Completion';
        idPrefix = 'Intern / Employee ID';
        completionText = 'has successfully completed the professional internship as';
        scoreText = `with a Performance Score of ${data.cgpa} / 10.0`;
      } else if (isHackathon) {
        certTitle = 'Certificate of Excellence & Achievement';
        idPrefix = 'Team / Reg ID';
        completionText = 'has officially been awarded the distinction of';
        scoreText = `with an Evaluation Score of ${data.cgpa} / 10.0`;
      }

      // Certificate Double Border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
      doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50).stroke();

      // Header: Issuing Authority Name
      doc
        .fontSize(28)
        .font('Times-Bold')
        .text(data.institutionName, { align: 'center', continued: false });

      doc.moveDown(0.4);
      
      // Certificate Title
      doc
        .fontSize(22)
        .font('Times-Roman')
        .text(certTitle, { align: 'center' });

      doc.moveDown(1.5);

      // Body: Candidate Name
      doc
        .fontSize(15)
        .text(`This is to certify that`, { align: 'center' });

      doc.moveDown(0.4);
      
      doc
        .fontSize(22)
        .font('Times-BoldItalic')
        .text(data.studentName, { align: 'center' });

      doc.moveDown(0.4);

      // Roll No / Intern ID
      doc
        .fontSize(14)
        .font('Times-Roman')
        .text(`${idPrefix}: ${data.rollNo}`, { align: 'center' });

      doc.moveDown(0.8);

      // Completion Text
      doc
        .text(completionText, { align: 'center' });

      doc.moveDown(0.4);

      // Degree / Role / Distinction
      doc
        .fontSize(18)
        .font('Times-Bold')
        .text(data.degree, { align: 'center' });

      doc.moveDown(0.8);

      // Score / CGPA
      doc
        .fontSize(15)
        .font('Times-Roman')
        .text(scoreText, { align: 'center' });

      // Footer - Issue Date
      doc.moveDown(1.5);
      doc
        .fontSize(13)
        .text(`Date of Issue: ${data.issueDate}`, 80, doc.y, { align: 'left' });

      // QR Code Embedded
      if (data.qrCodeDataUrl) {
        const base64Data = data.qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        doc.image(imageBuffer, doc.page.width - 150, doc.page.height - 190, {
          fit: [95, 95],
        });
      }

      // Bottom Metadata and ID
      const bottomY = doc.page.height - 75;
      doc
        .fontSize(9.5)
        .font('Helvetica')
        .text(`Certificate ID: ${data.certificateId}`, 50, bottomY, { align: 'center' });

      doc
        .fontSize(9.5)
        .text('Verified by Credify Zero-Trust PKI', 50, bottomY + 14, { align: 'center' });

      // Digital Signature Metadata in small print
      const shortHash = data.dataHash.substring(0, 16);
      doc
        .fontSize(8)
        .fillColor('gray')
        .text(`Alg: ${data.algorithm.toUpperCase()} | Hash: ${shortHash}...`, 50, bottomY + 28, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
