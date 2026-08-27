import { describe, it, expect } from 'vitest';
import { ECCEngine } from '../ecc';

describe('ECCEngine', () => {
  const engine = new ECCEngine();

  it('has correct algorithm identifier', () => {
    expect(engine.algorithm).toBe('ecc');
  });

  describe('generateKeyPair', () => {
    it('returns PEM-encoded keys', () => {
      const { publicKey, privateKey } = engine.generateKeyPair();
      expect(publicKey).toContain('-----BEGIN PUBLIC KEY-----');
      expect(privateKey).toContain('-----BEGIN PRIVATE KEY-----');
    });
  });

  describe('sign and verify roundtrip', () => {
    const { publicKey, privateKey } = engine.generateKeyPair();
    const testData = 'ecc certificate data';

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
      const result = engine.verify('tampered', signature, publicKey);
      expect(result.isValid).toBe(false);
    });

    it('rejects signature from different key', () => {
      const { signature } = engine.sign(testData, privateKey);
      const { publicKey: otherPub } = engine.generateKeyPair();
      const result = engine.verify(testData, signature, otherPub);
      expect(result.isValid).toBe(false);
    });

    it('rejects tampered signature bytes', () => {
      const { signature } = engine.sign(testData, privateKey);
      const chars = signature.split('');
      chars[5] = chars[5] === 'A' ? 'B' : 'A';
      const result = engine.verify(testData, chars.join(''), publicKey);
      expect(result.isValid).toBe(false);
    });
  });
});
