import { z } from 'zod';

export const algorithmEnum = z.enum(['rsa', 'ecc', 'ed25519']);
export type AlgorithmEnum = z.infer<typeof algorithmEnum>;

export const registerInstitutionSchema = z.object({
  name: z.string().min(1, 'Institution name is required').max(200).trim(),
  email: z.string().email('Invalid email address').max(200).trim().toLowerCase(),
  algorithm: algorithmEnum,
});

export const studentDataSchema = z.object({
  studentName: z.string().min(1, 'Student name is required').max(200).trim(),
  rollNo: z.string().min(1, 'Roll number is required').max(50).trim(),
  degree: z.string().min(1, 'Degree is required').max(200).trim(),
  cgpa: z.coerce.number().min(0, 'CGPA must be >= 0').max(10, 'CGPA must be <= 10'),
  issueDate: z.string().min(1, 'Issue date is required').refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Invalid date format'),
});

export const issueCertificateSchema = z.object({
  institutionId: z.string().uuid('Invalid institution ID'),
  privateKey: z.string().min(1, 'Private key is required'),
  students: z.array(studentDataSchema).min(1, 'At least one student is required').max(100),
});

export const bulkIssueCertificateSchema = z.object({
  institutionId: z.string().uuid('Invalid institution ID'),
  privateKey: z.string().min(1, 'Private key is required'),
  students: z.array(studentDataSchema).min(1, 'At least one student is required').max(500),
});

export const verifyQRSchema = z.object({
  payload: z.string().min(1, 'QR payload is required'),
});

export const verifyUploadSchema = z.object({
  certificate_id: z.string().min(1, 'Certificate ID is required'),
});

export const benchmarkSchema = z.object({
  sampleSize: z.coerce.number().int().min(10).max(10000).default(1000),
});

export const updateCertificateSchema = z.object({
  status: z.enum(['active', 'revoked']),
});

export type RegisterInstitutionInput = z.infer<typeof registerInstitutionSchema>;
export type IssueCertificateInput = z.infer<typeof issueCertificateSchema>;
export type BulkIssueCertificateInput = z.infer<typeof bulkIssueCertificateSchema>;
export type StudentDataInput = z.infer<typeof studentDataSchema>;
export type VerifyQRInput = z.infer<typeof verifyQRSchema>;
export type VerifyUploadInput = z.infer<typeof verifyUploadSchema>;
export type BenchmarkInput = z.infer<typeof benchmarkSchema>;
