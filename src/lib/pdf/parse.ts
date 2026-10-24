import '@/lib/polyfills';
import jsQR from 'jsqr';
import { QRPayload } from '../qr/generate';

/**
 * Extracts text content from an uploaded PDF using PDFParse v2 with resilient buffer fallback.
 * @param buffer - The PDF file buffer.
 * @returns A promise that resolves to the extracted text.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    await parser.destroy();
    if (textResult.text && textResult.text.trim().length > 0) {
      return textResult.text;
    }
  } catch (error) {
    console.warn('Primary pdf-parse extraction encountered an issue, falling back to stream parsing:', error);
  }

  // Resilient fallback: extract literal text streams from raw PDF buffer
  try {
    const raw = buffer.toString('binary');
    const matches: string[] = [];
    const textTokenRegex = /\(([^)]+)\)\s*Tj/g;
    let match;
    while ((match = textTokenRegex.exec(raw)) !== null) {
      matches.push(match[1]);
    }
    if (matches.length > 0) {
      return matches.join('\n');
    }
  } catch {
    // ignore
  }

  return '';
}

/**
 * Extracts certificate ID directly from raw PDF buffer metadata streams.
 * Inspects PDF trailer dictionaries, /Subject, /Keywords, and uncompressed literals.
 * Operates with 0 external dependencies and 100% resilience against DOM/worker errors.
 */
export function extractCertificateIdFromPDFBuffer(buffer: Buffer): string | null {
  if (!buffer || buffer.length === 0) return null;
  try {
    const raw = buffer.toString('binary');
    const rawUtf8 = buffer.toString('utf8');

    // 1. Check /Subject (Credify Certificate ID: <uuid>)
    const subjectMatch = raw.match(/\/Subject\s*\([^)]*([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i) ||
                         rawUtf8.match(/\/Subject\s*\([^)]*([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
    if (subjectMatch && subjectMatch[1]) {
      return subjectMatch[1].trim();
    }

    // 2. Check /Keywords (credify,<uuid>...)
    const keywordsMatch = raw.match(/\/Keywords\s*\([^)]*([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i) ||
                          rawUtf8.match(/\/Keywords\s*\([^)]*([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
    if (keywordsMatch && keywordsMatch[1]) {
      return keywordsMatch[1].trim();
    }

    // 3. Check XMP description tags
    const xmpMatch = raw.match(/<dc:description>[^<]*([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i) ||
                     rawUtf8.match(/<dc:description>[^<]*([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
    if (xmpMatch && xmpMatch[1]) {
      return xmpMatch[1].trim();
    }

    // 4. Check uncompressed text: "Certificate ID: <uuid>"
    const literalMatch = raw.match(/Certificate\s*ID:\s*([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i) ||
                         rawUtf8.match(/Certificate\s*ID:\s*([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
    if (literalMatch && literalMatch[1]) {
      return literalMatch[1].trim();
    }
  } catch (err) {
    console.error('Error in extractCertificateIdFromPDFBuffer:', err);
  }
  return null;
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

  const rollMatch = text.match(/(?:Roll\s*No|Intern\s*\/\s*Employee\s*ID|Team\s*\/\s*Reg\s*ID|Employee\s*ID|Team\s*ID|Reg\s*ID|Enrollment\s*No|ID)[:\s]*([^\n]+)/i);
  if (rollMatch) fields.rollNo = rollMatch[1].trim();

  const degreeMatch = text.match(/(?:degree requirements of|professional internship as|awarded the distinction of|degree of)[:\s]*\n\s*([^\n]+)/i);
  if (degreeMatch) fields.degree = degreeMatch[1].trim();


  const cgpaMatch = text.match(/(?:CGPA|Performance\s*Score|Evaluation\s*Score|Score)\s*(?:of)?\s*[:\s]*([0-9.]+)/i);
  if (cgpaMatch) fields.cgpa = cgpaMatch[1].trim();

  const dateMatch = text.match(/(?:Date\s*of\s*Issue|Date|Issued\s*on)[:\s]*([^\n]+)/i);
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
