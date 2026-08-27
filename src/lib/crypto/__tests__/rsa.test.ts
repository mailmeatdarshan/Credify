import { describe, it, expect } from 'vitest';
import { RSAEngine } from '../rsa';

describe('RSAEngine', () => {
  const engine = new RSAEngine();

  it('has correct algorithm identifier', () => {
    expect(engine.algorithm).toBe('rsa');
  });

  describe('generateKeyPair', () => {
    it('returns PEM-encoded public and private keys', () => {
      const { publicKey, privateKey } = engine.generateKeyPair();
      expect(publicKey).toContain('-----BEGIN PUBLIC KEY-----');
      expect(publicKey).toContain('-----END PUBLIC KEY-----');
      expect(privateKey).toContain('-----BEGIN PRIVATE KEY-----');
      expect(privateKey).toContain('-----END PRIVATE KEY-----');
    });

    it('generates different keys each time', () => {
      const kp1 = engine.generateKeyPair();
      const kp2 = engine.generateKeyPair();
      expect(kp1.publicKey).not.toBe(kp2.publicKey);
    });
  });

  describe('sign and verify roundtrip', () => {
    const { publicKey, privateKey } = engine.generateKeyPair();
    const testData = 'certificate hash data for signing';

    it('produces a base64 signature', () => {
      const { signature, dataHash } = engine.sign(testData, privateKey);
      expect(typeof signature).toBe('string');
      expect(signature.length).toBeGreaterThan(0);
      expect(dataHash).toHaveLength(64);
    });

    it('verifies a valid signature', () => {
      const { signature } = engine.sign(testData, privateKey);
      const result = engine.verify(testData, signature, publicKey);
      expect(result.isValid).toBe(true);
    });

    it('rejects signature on different data', () => {
      const { signature } = engine.sign(testData, privateKey);
      const result = engine.verify('different data', signature, publicKey);
      expect(result.isValid).toBe(false);
    });

    it('rejects signature from different key', () => {
      const { signature } = engine.sign(testData, privateKey);
      const { publicKey: otherPub } = engine.generateKeyPair();
      const result = engine.verify(testData, signature, otherPub);
      expect(result.isValid).toBe(false);
    });

    it('rejects tampered signature', () => {
      const { signature } = engine.sign(testData, privateKey);
      const chars = signature.split('');
      chars[10] = chars[10] === 'A' ? 'B' : 'A';
      const tampered = chars.join('');
      const result = engine.verify(testData, tampered, publicKey);
      expect(result.isValid).toBe(false);
    });

    it('returns error message on invalid signature format', () => {
      const result = engine.verify(testData, 'not-a-valid-signature', publicKey);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Signature is invalid');
    });
  });
});
