import { describe, it, expect } from 'vitest';
import {
  registerInstitutionSchema,
  issueCertificateSchema,
  verifyQRSchema,
  benchmarkSchema,
  studentDataSchema,
} from '../validation';

describe('Validation Schemas', () => {
  describe('registerInstitutionSchema', () => {
    const valid = { name: 'MIT', email: 'admin@mit.edu', algorithm: 'ed25519' as const };

    it('accepts valid input', () => {
      const result = registerInstitutionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('trims and lowercases email', () => {
      const result = registerInstitutionSchema.parse({ ...valid, email: 'Admin@MIT.EDU' });
      expect(result.email).toBe('admin@mit.edu');
    });

    it('rejects missing name', () => {
      const result = registerInstitutionSchema.safeParse({ ...valid, name: '' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email', () => {
      const result = registerInstitutionSchema.safeParse({ ...valid, email: 'not-an-email' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid algorithm', () => {
      const result = registerInstitutionSchema.safeParse({ ...valid, algorithm: 'aes256' });
      expect(result.success).toBe(false);
    });

    it('accepts all valid algorithms', () => {
      for (const alg of ['rsa', 'ecc', 'ed25519']) {
        const result = registerInstitutionSchema.safeParse({ ...valid, algorithm: alg });
        expect(result.success).toBe(true);
      }
    });
  });

  describe('studentDataSchema', () => {
    const valid = {
      studentName: 'Alice',
      rollNo: '21CS001',
      degree: 'B.Tech CS',
      cgpa: 9.0,
      issueDate: '2025-05-15',
    };

    it('accepts valid student data', () => {
      expect(studentDataSchema.safeParse(valid).success).toBe(true);
    });

    it('accepts string CGPA and converts to number', () => {
      const result = studentDataSchema.parse({ ...valid, cgpa: '8.5' });
      expect(result.cgpa).toBe(8.5);
      expect(typeof result.cgpa).toBe('number');
    });

    it('rejects CGPA > 10', () => {
      const result = studentDataSchema.safeParse({ ...valid, cgpa: 11 });
      expect(result.success).toBe(false);
    });

    it('rejects negative CGPA', () => {
      const result = studentDataSchema.safeParse({ ...valid, cgpa: -1 });
      expect(result.success).toBe(false);
    });

    it('rejects empty student name', () => {
      const result = studentDataSchema.safeParse({ ...valid, studentName: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('issueCertificateSchema', () => {
    const valid = {
      institutionId: '550e8400-e29b-41d4-a716-446655440000',
      privateKey: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----',
      students: [
        { studentName: 'Alice', rollNo: '001', degree: 'BS', cgpa: 9.0, issueDate: '2025-01-01' },
      ],
    };

    it('accepts valid input', () => {
      expect(issueCertificateSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects invalid UUID for institutionId', () => {
      const result = issueCertificateSchema.safeParse({ ...valid, institutionId: 'not-a-uuid' });
      expect(result.success).toBe(false);
    });

    it('rejects empty students array', () => {
      const result = issueCertificateSchema.safeParse({ ...valid, students: [] });
      expect(result.success).toBe(false);
    });

    it('rejects more than 100 students', () => {
      const manyStudents = Array.from({ length: 101 }, () => valid.students[0]);
      const result = issueCertificateSchema.safeParse({ ...valid, students: manyStudents });
      expect(result.success).toBe(false);
    });
  });

  describe('verifyQRSchema', () => {
    it('accepts valid payload string', () => {
      expect(verifyQRSchema.safeParse({ payload: 'base64data' }).success).toBe(true);
    });

    it('rejects empty payload', () => {
      expect(verifyQRSchema.safeParse({ payload: '' }).success).toBe(false);
    });
  });

  describe('benchmarkSchema', () => {
    it('defaults sampleSize to 100', () => {
      const result = benchmarkSchema.parse({});
      expect(result.sampleSize).toBe(100);
    });

    it('accepts valid sample size', () => {
      const result = benchmarkSchema.parse({ sampleSize: 500 });
      expect(result.sampleSize).toBe(500);
    });

    it('rejects sample size < 10', () => {
      const result = benchmarkSchema.safeParse({ sampleSize: 5 });
      expect(result.success).toBe(false);
    });

    it('rejects sample size > 500', () => {
      const result = benchmarkSchema.safeParse({ sampleSize: 1000 });
      expect(result.success).toBe(false);
    });
  });
});
