import { createHash } from 'crypto';

export interface CertificateData {
  studentName: string;
  rollNo: string;
  degree: string;
  cgpa: string | number;
  issueDate: string | Date;
  institutionId: string;
}

/**
 * Normalizes date inputs to standard YYYY-MM-DD string format
 */
export function normalizeDate(dateInput: string | Date): string {
  if (!dateInput) return '';
  if (typeof dateInput === 'string') {
    if (dateInput.includes('T')) {
      return dateInput.split('T')[0].trim().toLowerCase();
    }
    return dateInput.trim().toLowerCase();
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

/**
 * Deterministically hashes a given string using SHA-256.
 * @param input The string to hash.
 * @returns The hex-encoded SHA-256 hash.
 */
export function hashString(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

/**
 * Deterministically hashes CertificateData.
 * Canonicalization: sorts keys, converts strings to lowercase, trims whitespace.
 * @param data The CertificateData to hash.
 * @returns The hex-encoded SHA-256 hash.
 */
export function hashCertificateData(data: CertificateData): string {
  const canonicalObj = {
    cgpa: String(data.cgpa).trim().toLowerCase(),
    degree: data.degree.trim().toLowerCase(),
    institutionId: data.institutionId.trim().toLowerCase(),
    issueDate: normalizeDate(data.issueDate),
    rollNo: data.rollNo.trim().toLowerCase(),
    studentName: data.studentName.trim().toLowerCase(),
  };

  const canonicalString = JSON.stringify(canonicalObj);
  return hashString(canonicalString);
}

