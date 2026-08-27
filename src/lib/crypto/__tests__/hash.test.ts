import { describe, it, expect } from 'vitest';
import { hashString, hashCertificateData, CertificateData } from '../hash';

describe('hashString', () => {
  it('produces a 64-character hex SHA-256 hash', () => {
    const hash = hashString('hello world');
    expect(hash).toHaveLength(64);
    expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
  });

  it('is deterministic — same input always produces same hash', () => {
    const input = 'deterministic test string';
    const hash1 = hashString(input);
    const hash2 = hashString(input);
    expect(hash1).toBe(hash2);
  });

  it('produces different hashes for different inputs', () => {
    const hash1 = hashString('input_a');
    const hash2 = hashString('input_b');
    expect(hash1).not.toBe(hash2);
  });

  it('matches known SHA-256 for empty string', () => {
    const hash = hashString('');
    expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });
});

describe('hashCertificateData', () => {
  const baseData: CertificateData = {
    studentName: 'Alice Johnson',
    rollNo: '21CS101',
    degree: 'B.Tech Computer Science',
    cgpa: 9.2,
    issueDate: '2025-05-15',
    institutionId: '550e8400-e29b-41d4-a716-446655440000',
  };

  it('produces a valid hex hash', () => {
    const hash = hashCertificateData(baseData);
    expect(hash).toHaveLength(64);
    expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
  });

  it('is deterministic', () => {
    const hash1 = hashCertificateData(baseData);
    const hash2 = hashCertificateData(baseData);
    expect(hash1).toBe(hash2);
  });

  it('normalizes case — same hash regardless of casing', () => {
    const upperData = { ...baseData, studentName: 'ALICE JOHNSON', degree: 'B.TECH COMPUTER SCIENCE' };
    expect(hashCertificateData(baseData)).toBe(hashCertificateData(upperData));
  });

  it('normalizes whitespace — trims leading/trailing spaces', () => {
    const paddedData = { ...baseData, studentName: '  Alice Johnson  ', rollNo: '  21CS101  ' };
    expect(hashCertificateData(baseData)).toBe(hashCertificateData(paddedData));
  });

  it('produces different hashes for different student data', () => {
    const data2: CertificateData = { ...baseData, studentName: 'Bob Smith' };
    expect(hashCertificateData(baseData)).not.toBe(hashCertificateData(data2));
  });

  it('produces different hashes for different CGPA', () => {
    const data2: CertificateData = { ...baseData, cgpa: 8.0 };
    expect(hashCertificateData(baseData)).not.toBe(hashCertificateData(data2));
  });

  it('handles string and number CGPA identically', () => {
    const numCgpa = { ...baseData, cgpa: 9.2 };
    const strCgpa = { ...baseData, cgpa: '9.2' };
    expect(hashCertificateData(numCgpa)).toBe(hashCertificateData(strCgpa));
  });
});
