import { PDFParse } from 'pdf-parse';
import jsQR from 'jsqr';
import { QRPayload } from '../qr/generate';

/**
 * Extracts text content from an uploaded PDF using PDFParse v2.
 * @param buffer - The PDF file buffer.
 * @returns A promise that resolves to the extracted text.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    await parser.destroy();
    return textResult.text || '';
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Searches extracted PDF text for a certificate ID pattern.
 * Matches patterns like "Certificate ID: <uuid>" or generic UUID regex.
 * @param text - The extracted PDF text.
 * @returns The certificate ID if found, null otherwise.
 */
export function extractCertificateIdFromText(text: string): string | null {
  if (!text) return null;
  const patterns = [
    /Certificate\s*ID:\s*([a-f0-9-]{36})/i,
    /Certificate\s*ID:\s*(CERT-[A-Za-z0-9-]+)/i,
    /certificate[_\s]*id[:\s]+([a-f0-9-]{36})/i,
    /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

/**
 * Extracts certificate fields from PDF text for verification.
 * Looks for labeled fields in the extracted text.
 * @param text - The extracted PDF text.
 * @returns An object with extracted fields, or null if insufficient data.
 */
export function extractCertificateFieldsFromText(text: string): {
  studentName?: string;
  rollNo?: string;
  degree?: string;
  cgpa?: string;
  issueDate?: string;
} | null {
  if (!text) return null;
  const fields: Record<string, string> = {};

  const nameMatch = text.match(/(?:This is to certify that|certify that)\s*\n?\s*([^\n]+)/i);
  if (nameMatch) fields.studentName = nameMatch[1].trim();

  const rollMatch = text.match(/Roll\s*No[:\s]*([^\n]+)/i);
  if (rollMatch) fields.rollNo = rollMatch[1].trim();

  const degreeMatch = text.match(/(?:degree of|completed the)\s*\n?\s*([^\n]+)/i);
  if (degreeMatch) fields.degree = degreeMatch[1].trim();

  const cgpaMatch = text.match(/CGPA\s*(?:of)?\s*[:\s]*([0-9.]+)/i);
  if (cgpaMatch) fields.cgpa = cgpaMatch[1].trim();

  const dateMatch = text.match(/Date\s*of\s*Issue[:\s]*([^\n]+)/i);
  if (dateMatch) fields.issueDate = dateMatch[1].trim();

  return Object.keys(fields).length >= 3 ? fields : null;
}

/**
 * Attempts to extract a QR payload from a PDF by finding embedded certificate data.
 * Uses text extraction to find the certificate ID, then constructs a minimal payload.
 *
 * @param buffer - The PDF file buffer.
 * @returns A promise that resolves to a QRPayload or null.
 */
export async function extractQRFromPDF(buffer: Buffer): Promise<QRPayload | null> {
  try {
    const text = await extractTextFromPDF(buffer);
    const id = extractCertificateIdFromText(text);
    const sigMatch = text.match(/Hash:\s*([a-f0-9]{16})/i);

    if (id) {
      return {
        v: 1,
        id,
        sig: sigMatch ? sigMatch[1] : '',
        hash: '',
        alg: '',
      };
    }

    return null;
  } catch (error) {
    console.error('Error extracting QR from PDF:', error);
    return null;
  }
}
