import { describe, it, expect } from 'vitest';
import { Ed25519Engine } from '../ed25519';

describe('Ed25519Engine', () => {
  const engine = new Ed25519Engine();

  it('has correct algorithm identifier', () => {
    expect(engine.algorithm).toBe('ed25519');
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
    const testData = 'ed25519 certificate payload';

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
      const result = engine.verify('wrong data', signature, publicKey);
      expect(result.isValid).toBe(false);
    });

    it('rejects signature from different key', () => {
      const { signature } = engine.sign(testData, privateKey);
      const { publicKey: otherPub } = engine.generateKeyPair();
      const result = engine.verify(testData, signature, otherPub);
      expect(result.isValid).toBe(false);
    });

    it('is deterministic — same data + key produces same signature', () => {
      const sig1 = engine.sign(testData, privateKey);
      const sig2 = engine.sign(testData, privateKey);
      expect(sig1.signature).toBe(sig2.signature);
    });
  });
});
