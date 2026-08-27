import { describe, it, expect } from 'vitest';
import { computeStats, generateSyntheticData, runBenchmark } from '../runner';

describe('Benchmark Runner', () => {
  describe('computeStats', () => {
    it('returns zeros for empty array', () => {
      const stats = computeStats([]);
      expect(stats).toEqual({ totalMs: 0, avgMs: 0, medianMs: 0, minMs: 0, maxMs: 0, p95Ms: 0, stdDevMs: 0 });
    });

    it('computes correct stats for known data', () => {
      const timings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const stats = computeStats(timings);
      expect(stats.minMs).toBe(1);
      expect(stats.maxMs).toBe(10);
      expect(stats.avgMs).toBe(5.5);
      expect(stats.medianMs).toBe(5.5);
      expect(stats.totalMs).toBe(55);
      expect(stats.p95Ms).toBe(10);
    });

    it('computes correct median for odd-length array', () => {
      const stats = computeStats([1, 3, 5]);
      expect(stats.medianMs).toBe(3);
    });

    it('computes correct median for even-length array', () => {
      const stats = computeStats([1, 2, 3, 4]);
      expect(stats.medianMs).toBe(2.5);
    });

    it('computes standard deviation as 0 for identical values', () => {
      const stats = computeStats([2, 2, 2, 2]);
      expect(stats.stdDevMs).toBe(0);
    });

    it('rounds values to 3 decimal places', () => {
      const stats = computeStats([1.123456]);
      expect(stats.avgMs).toBe(1.123);
    });
  });

  describe('generateSyntheticData', () => {
    it('generates the requested number of records', () => {
      const data = generateSyntheticData(100);
      expect(data).toHaveLength(100);
    });

    it('generates valid CertificateData objects', () => {
      const data = generateSyntheticData(5);
      for (const item of data) {
        expect(item.studentName).toBeTruthy();
        expect(item.rollNo).toBeTruthy();
        expect(item.degree).toBeTruthy();
        expect(item.cgpa).toBeGreaterThanOrEqual(6.0);
        expect(item.cgpa).toBeLessThanOrEqual(10.0);
        expect(item.issueDate).toBeTruthy();
        expect(item.institutionId).toBe('550e8400-e29b-41d4-a716-446655440000');
      }
    });

    it('generates unique roll numbers', () => {
      const data = generateSyntheticData(50);
      const rollNos = data.map((d) => d.rollNo);
      expect(new Set(rollNos).size).toBe(50);
    });
  });

  describe('runBenchmark', () => {
    it('produces results for all 3 algorithms', async () => {
      const result = await runBenchmark(10, 2);
      expect(result.results).toHaveLength(3);
      expect(result.results.map((r) => r.algorithm)).toEqual(['rsa', 'ecc', 'ed25519']);
    });

    it('includes valid stats for each algorithm', async () => {
      const result = await runBenchmark(10, 2);
      for (const r of result.results) {
        expect(r.signing.avgMs).toBeGreaterThanOrEqual(0);
        expect(r.verification.avgMs).toBeGreaterThanOrEqual(0);
        expect(r.signatureSize).toBeGreaterThan(0);
        expect(r.publicKeySize).toBeGreaterThan(0);
        expect(r.keyGenTimeMs).toBeGreaterThanOrEqual(0);
      }
    });

    it('includes a recommendation', async () => {
      const result = await runBenchmark(10, 2);
      expect(result.recommendation.fastest).toBeTruthy();
      expect(result.recommendation.smallest).toBeTruthy();
      expect(result.recommendation.overall).toBeTruthy();
      expect(result.recommendation.reasoning).toBeTruthy();
    });

    it('records the sample size and timestamp', async () => {
      const result = await runBenchmark(20, 2);
      expect(result.sampleSize).toBe(20);
      expect(result.warmupRounds).toBe(2);
      expect(result.timestamp).toBeTruthy();
    });

    it('ed25519 has smallest or equal signature size', async () => {
      const result = await runBenchmark(10, 2);
      const edResult = result.results.find((r) => r.algorithm === 'ed25519');
      for (const r of result.results) {
        expect(edResult!.signatureSize).toBeLessThanOrEqual(r.signatureSize);
      }
    });
  });
});
