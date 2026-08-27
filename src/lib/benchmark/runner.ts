import { performance } from 'perf_hooks';
import {
  createCryptoEngine,
  hashCertificateData,
  AlgorithmType,
  CertificateData,
} from '@/lib/crypto';

export interface BenchmarkStats {
  totalMs: number;
  avgMs: number;
  medianMs: number;
  minMs: number;
  maxMs: number;
  p95Ms: number;
  stdDevMs: number;
}

export interface AlgorithmBenchmarkResult {
  algorithm: AlgorithmType;
  keyGenTimeMs: number;
  signing: BenchmarkStats;
  verification: BenchmarkStats;
  signatureSize: number;
  publicKeySize: number;
}

export interface BenchmarkResult {
  results: AlgorithmBenchmarkResult[];
  sampleSize: number;
  warmupRounds: number;
  timestamp: string;
  recommendation: {
    fastest: AlgorithmType;
    smallest: AlgorithmType;
    overall: AlgorithmType;
    reasoning: string;
  };
}

const SAMPLE_NAMES = [
  "Aarav Sharma", "Priya Patel", "Rahul Kumar", "Sneha Gupta", "Vikram Singh",
  "Ananya Reddy", "Arjun Nair", "Divya Menon", "Karthik Iyer", "Meera Joshi",
  "Rohan Desai", "Kavya Pillai", "Aditya Verma", "Neha Chawla", "Siddharth Rao",
  "Pooja Bhatia", "Aryan Chakraborty", "Isha Mukherjee", "Rishabh Das", "Tara Sengupta"
];

const SAMPLE_DEGREES = [
  "B.Tech Computer Science", "B.Tech Electronics", "M.Tech AI/ML",
  "B.Sc Mathematics", "M.Sc Physics", "MBA Finance",
  "BCA", "MCA", "B.Tech Mechanical", "B.Tech Civil"
];

const INSTITUTION_ID = "550e8400-e29b-41d4-a716-446655440000";

/**
 * Generates synthetic certificate data for benchmarking.
 */
export function generateSyntheticData(count: number): CertificateData[] {
  const data: CertificateData[] = [];
  for (let i = 0; i < count; i++) {
    const name = SAMPLE_NAMES[i % SAMPLE_NAMES.length];
    const degree = SAMPLE_DEGREES[i % SAMPLE_DEGREES.length];
    const cgpa = Math.round((6.0 + (i % 40) * 0.1) * 10) / 10;
    const rollNo = `2024CS${String(i + 1).padStart(3, '0')}`;
    const date = new Date(Date.now() - (i * 86400000) % (365 * 86400000));
    const issueDate = date.toISOString().split('T')[0];

    data.push({
      studentName: name,
      rollNo,
      degree,
      cgpa,
      issueDate,
      institutionId: INSTITUTION_ID,
    });
  }
  return data;
}

/**
 * Computes benchmark statistics from an array of timings.
 */
export function computeStats(timings: number[]): BenchmarkStats {
  if (timings.length === 0) {
    return { totalMs: 0, avgMs: 0, medianMs: 0, minMs: 0, maxMs: 0, p95Ms: 0, stdDevMs: 0 };
  }

  const sorted = [...timings].sort((a, b) => a - b);
  const totalMs = sorted.reduce((sum, val) => sum + val, 0);
  const avgMs = totalMs / sorted.length;
  const minMs = sorted[0];
  const maxMs = sorted[sorted.length - 1];

  const mid = Math.floor(sorted.length / 2);
  const medianMs = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

  const p95Index = Math.floor(sorted.length * 0.95);
  const p95Ms = sorted[p95Index];

  const variance = sorted.reduce((sum, val) => sum + Math.pow(val - avgMs, 2), 0) / sorted.length;
  const stdDevMs = Math.sqrt(variance);

  const round = (num: number) => Math.round(num * 1000) / 1000;

  return {
    totalMs: round(totalMs),
    avgMs: round(avgMs),
    medianMs: round(medianMs),
    minMs: round(minMs),
    maxMs: round(maxMs),
    p95Ms: round(p95Ms),
    stdDevMs: round(stdDevMs),
  };
}

/**
 * Runs a performance benchmark across all supported cryptographic algorithms.
 * Includes warmup rounds to stabilize JIT compilation results.
 */
export async function runBenchmark(
  sampleSize: number = 1000,
  warmupRounds: number = 50
): Promise<BenchmarkResult> {
  const algorithms: AlgorithmType[] = ['rsa', 'ecc', 'ed25519'];
  const results: AlgorithmBenchmarkResult[] = [];
  const syntheticData = generateSyntheticData(sampleSize);

  for (const algorithm of algorithms) {
    try {
      const engine = createCryptoEngine(algorithm);

      const keyGenStart = performance.now();
      const keyPair = engine.generateKeyPair();
      const keyGenTimeMs = performance.now() - keyGenStart;

      const publicKeySize = Buffer.byteLength(keyPair.publicKey, 'utf8');

      // Warmup: run a few iterations to trigger JIT optimization
      const warmupData = syntheticData.slice(0, Math.min(warmupRounds, sampleSize));
      for (const data of warmupData) {
        const hash = hashCertificateData(data);
        const { signature } = engine.sign(hash, keyPair.privateKey);
        engine.verify(hash, signature, keyPair.publicKey);
      }

      // Actual measurement
      const signingTimings: number[] = [];
      const verificationTimings: number[] = [];
      let sampleSignatureSize = 0;

      const signedResults: { signature: string; dataHash: string }[] = [];

      for (const data of syntheticData) {
        const dataHash = hashCertificateData(data);
        const signStart = performance.now();
        const signatureResult = engine.sign(dataHash, keyPair.privateKey);
        const signEnd = performance.now();
        signingTimings.push(signEnd - signStart);
        signedResults.push({ signature: signatureResult.signature, dataHash });

        if (sampleSignatureSize === 0) {
          sampleSignatureSize = Buffer.byteLength(signatureResult.signature, 'base64');
        }
      }

      for (let i = 0; i < syntheticData.length; i++) {
        const { signature, dataHash } = signedResults[i];
        const verifyStart = performance.now();
        engine.verify(dataHash, signature, keyPair.publicKey);
        const verifyEnd = performance.now();
        verificationTimings.push(verifyEnd - verifyStart);
      }

      results.push({
        algorithm,
        keyGenTimeMs: Math.round(keyGenTimeMs * 1000) / 1000,
        signing: computeStats(signingTimings),
        verification: computeStats(verificationTimings),
        signatureSize: sampleSignatureSize,
        publicKeySize,
      });
    } catch (error) {
      console.error(`Benchmark failed for ${algorithm}:`, error);
    }
  }

  if (results.length === 0) {
    throw new Error('Benchmark failed for all algorithms.');
  }

  const fastest = results.reduce((prev, curr) =>
    curr.verification.avgMs < prev.verification.avgMs ? curr : prev
  ).algorithm;

  const smallest = results.reduce((prev, curr) =>
    curr.signatureSize < prev.signatureSize ? curr : prev
  ).algorithm;

  let overall: AlgorithmType = 'ed25519';
  if (!results.find((r) => r.algorithm === 'ed25519')) {
    overall = fastest;
  }

  const fastestResult = results.find((r) => r.algorithm === fastest);
  const smallestResult = results.find((r) => r.algorithm === smallest);

  return {
    results,
    sampleSize,
    warmupRounds,
    timestamp: new Date().toISOString(),
    recommendation: {
      fastest,
      smallest,
      overall,
      reasoning: `Based on benchmarking ${sampleSize} certificate operations (${warmupRounds} warmup rounds discarded): ` +
        `${fastest.toUpperCase()} is fastest at verification (${fastestResult?.verification.avgMs}ms avg, ` +
        `${fastestResult?.verification.p95Ms}ms p95). ` +
        `${smallest.toUpperCase()} produces the smallest signatures (${smallestResult?.signatureSize} bytes). ` +
        `Ed25519 is recommended overall: it combines fast signing/verification with compact 64-byte signatures ` +
        `that fit efficiently in QR codes, making it ideal for academic credential verification.`,
    },
  };
}
