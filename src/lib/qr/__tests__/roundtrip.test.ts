import { describe, it, expect } from 'vitest';
import { createQRPayload, encodePayload, generateQRCode } from '../generate';
import { parseQRPayload } from '../decode';

describe('QR Module', () => {
  describe('createQRPayload', () => {
    it('creates a valid payload with all fields', () => {
      const payload = createQRPayload('cert-id-123', 'sig-data', 'hash-data', 'ed25519');
      expect(payload).toEqual({
        v: 1,
        id: 'cert-id-123',
        sig: 'sig-data',
        hash: 'hash-data',
        alg: 'ed25519',
      });
    });

    it('truncates long signatures to 128 chars', () => {
      const longSig = 'a'.repeat(300);
      const payload = createQRPayload('id', longSig, 'hash', 'rsa');
      expect(payload.sig).toHaveLength(128);
      expect(payload.sig).toBe(longSig.substring(0, 128));
    });
  });

  describe('encodePayload', () => {
    it('returns a base64-encoded string', () => {
      const payload = createQRPayload('id', 'sig', 'hash', 'ed25519');
      const encoded = encodePayload(payload);
      expect(typeof encoded).toBe('string');
      // Verify it's valid base64
      const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
      expect(decoded).toContain('"id":"id"');
    });

    it('produces different output for different payloads', () => {
      const p1 = createQRPayload('id-1', 'sig', 'hash', 'ed25519');
      const p2 = createQRPayload('id-2', 'sig', 'hash', 'ed25519');
      expect(encodePayload(p1)).not.toBe(encodePayload(p2));
    });
  });

  describe('generateQRCode', () => {
    it('returns a base64 data URL of a PNG image', async () => {
      const payload = createQRPayload('test-id', 'test-sig', 'test-hash', 'ed25519');
      const dataUrl = await generateQRCode(payload);
      expect(dataUrl).toMatch(/^data:image\/png;base64,/);
      expect(dataUrl.length).toBeGreaterThan(100);
    });
  });

  describe('parseQRPayload', () => {
    it('parses a valid base64-encoded payload', () => {
      const original = createQRPayload('cert-abc', 'sig-data', 'hash-data', 'ecc');
      const encoded = encodePayload(original);
      const parsed = parseQRPayload(encoded);
      expect(parsed).toEqual(original);
    });

    it('returns null for invalid base64', () => {
      const result = parseQRPayload('not-valid-base64!!!');
      expect(result).toBeNull();
    });

    it('returns null for valid base64 but invalid JSON', () => {
      const encoded = Buffer.from('not json').toString('base64');
      const result = parseQRPayload(encoded);
      expect(result).toBeNull();
    });

    it('returns null if required fields are missing', () => {
      const incomplete = Buffer.from(JSON.stringify({ v: 1 })).toString('base64');
      const result = parseQRPayload(incomplete);
      expect(result).toBeNull();
    });
  });

  describe('full roundtrip', () => {
    it('create → encode → generate QR → parse → original payload', async () => {
      const original = createQRPayload(
        '550e8400-e29b-41d4-a716-446655440000',
        'base64signature==',
        'abc123def456',
        'ed25519'
      );

      const encoded = encodePayload(original);
      const qrDataUrl = await generateQRCode(original);
      expect(qrDataUrl).toContain('data:image/png');

      // Simulate scanning: decode the base64 we encoded
      const parsed = parseQRPayload(encoded);
      expect(parsed).not.toBeNull();
      expect(parsed!.id).toBe(original.id);
      expect(parsed!.alg).toBe(original.alg);
      expect(parsed!.hash).toBe(original.hash);
    });
  });
});
