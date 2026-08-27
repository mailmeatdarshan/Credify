import { describe, it, expect } from 'vitest';
import { createCryptoEngine, signCertificate, verifyCertificate, CertificateData } from '../index';

const ALGORITHMS = ['rsa', 'ecc', 'ed25519'] as const;

const baseCertData: CertificateData = {
  studentName: 'Tamper Test Student',
  rollNo: 'TAMPER-001',
  degree: 'B.Tech Computer Science',
  cgpa: 9.0,
  issueDate: '2025-06-01',
  institutionId: '550e8400-e29b-41d4-a716-446655440000',
};

describe('Tamper detection across all algorithms', () => {
  for (const alg of ALGORITHMS) {
    describe(`${alg.toUpperCase()}`, () => {
      const engine = createCryptoEngine(alg);
      const { publicKey, privateKey } = engine.generateKeyPair();

      it('rejects modified student name', () => {
        const { signature, dataHash } = signCertificate(baseCertData, privateKey, alg);
        const tamperedData = { ...baseCertData, studentName: 'Fake Student' };
        const result = verifyCertificate(tamperedData, signature, publicKey, alg);
        expect(result.isValid).toBe(false);
      });

      it('rejects modified roll number', () => {
        const { signature } = signCertificate(baseCertData, privateKey, alg);
        const tamperedData = { ...baseCertData, rollNo: 'FAKE-999' };
        const result = verifyCertificate(tamperedData, signature, publicKey, alg);
        expect(result.isValid).toBe(false);
      });

      it('rejects modified degree', () => {
        const { signature } = signCertificate(baseCertData, privateKey, alg);
        const tamperedData = { ...baseCertData, degree: 'PhD Quantum Physics' };
        const result = verifyCertificate(tamperedData, signature, publicKey, alg);
        expect(result.isValid).toBe(false);
      });

      it('rejects modified CGPA', () => {
        const { signature } = signCertificate(baseCertData, privateKey, alg);
        const tamperedData = { ...baseCertData, cgpa: 10.0 };
        const result = verifyCertificate(tamperedData, signature, publicKey, alg);
        expect(result.isValid).toBe(false);
      });

      it('rejects modified issue date', () => {
        const { signature } = signCertificate(baseCertData, privateKey, alg);
        const tamperedData = { ...baseCertData, issueDate: '2030-01-01' };
        const result = verifyCertificate(tamperedData, signature, publicKey, alg);
        expect(result.isValid).toBe(false);
      });

      it('rejects modified institution ID', () => {
        const { signature } = signCertificate(baseCertData, privateKey, alg);
        const tamperedData = { ...baseCertData, institutionId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' };
        const result = verifyCertificate(tamperedData, signature, publicKey, alg);
        expect(result.isValid).toBe(false);
      });

      it('verifies original unmodified data succeeds', () => {
        const { signature } = signCertificate(baseCertData, privateKey, alg);
        const result = verifyCertificate(baseCertData, signature, publicKey, alg);
        expect(result.isValid).toBe(true);
      });
    });
  }
});

describe('Cross-algorithm isolation', () => {
  it('RSA signature is rejected by Ed25519 verifier', () => {
    const rsa = createCryptoEngine('rsa');
    const ed = createCryptoEngine('ed25519');
    const rsaKeys = rsa.generateKeyPair();
    const edKeys = ed.generateKeyPair();

    const { signature } = rsa.sign('test data', rsaKeys.privateKey);
    const result = ed.verify('test data', signature, edKeys.publicKey);
    expect(result.isValid).toBe(false);
  });

  it('ECC signature is rejected by RSA verifier', () => {
    const ecc = createCryptoEngine('ecc');
    const rsa = createCryptoEngine('rsa');
    const eccKeys = ecc.generateKeyPair();
    const rsaKeys = rsa.generateKeyPair();

    const { signature } = ecc.sign('test data', eccKeys.privateKey);
    const result = rsa.verify('test data', signature, rsaKeys.publicKey);
    expect(result.isValid).toBe(false);
  });
});
