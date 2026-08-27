'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Loader2,
  Play,
  Zap,
  ShieldCheck,
  Cpu,
  BarChart3,
  Scale,
  Award,
  Sparkles,
  Info,
  HardDrive,
  Lock,
} from 'lucide-react';

interface BenchmarkResult {
  algorithm: string;
  keyGenTimeMs: number;
  signing: { totalMs: number; avgMs: number; medianMs: number; minMs: number; maxMs: number; p95Ms: number };
  verification: { totalMs: number; avgMs: number; medianMs: number; minMs: number; maxMs: number; p95Ms: number };
  signatureSize: number;
}

interface BenchmarkResponse {
  results: BenchmarkResult[];
  sampleSize: number;
  timestamp: string;
  recommendation: {
    fastest: string;
    smallest: string;
    overall: string;
    reasoning: string;
  };
}

const PRESET_SIZES = [100, 500, 1000, 2500];

export default function BenchmarkDashboard() {
  const [sampleSize, setSampleSize] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BenchmarkResponse | null>(null);
  const [error, setError] = useState('');

  const runBenchmark = useCallback(async (size?: number) => {
    const targetSize = size || sampleSize;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/benchmark/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleSize: targetSize }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Benchmark execution failed');
      setResults(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Benchmark execution failed');
    } finally {
      setLoading(false);
    }
  }, [sampleSize]);

  // Run automatically on first visit
  useEffect(() => {
    runBenchmark(500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signData = results?.results.map((r) => ({
    name: r.algorithm.toUpperCase(),
    'Avg Latency (ms)': parseFloat(r.signing.avgMs.toFixed(3)),
    'P95 Latency (ms)': parseFloat(r.signing.p95Ms.toFixed(3)),
  })) ?? [];

  const verifyData = results?.results.map((r) => ({
    name: r.algorithm.toUpperCase(),
    'Avg Latency (ms)': parseFloat(r.verification.avgMs.toFixed(3)),
    'P95 Latency (ms)': parseFloat(r.verification.p95Ms.toFixed(3)),
  })) ?? [];

  const sizeData = results?.results.map((r) => ({
    name: r.algorithm.toUpperCase(),
    'Signature Size (Bytes)': r.signatureSize,
  })) ?? [];

  const radarData = results?.results.map((r) => ({
    algorithm: r.algorithm.toUpperCase(),
    signSpeed: Math.min(100, Math.max(1, (1 / (r.signing.avgMs || 0.001)) * 5)),
    verifySpeed: Math.min(100, Math.max(1, (1 / (r.verification.avgMs || 0.001)) * 5)),
    sizeEfficiency: Math.round((256 / r.signatureSize) * 25),
  })) ?? [];

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-[#FEF9E5] text-[#8A5D08] border border-[#EAE0CE] rounded-full px-3.5 py-1 text-xs font-semibold shadow-2xs">
          <Cpu className="w-4 h-4 text-[#FBC02D]" />
          <span>Cryptographic Performance &amp; Benchmark Lab</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#141619] tracking-tight">
          Cryptographic <mark className="highlight">benchmark laboratory</mark>
        </h1>
        <p className="text-sm text-[#716049] max-w-xl leading-relaxed">
          Comparative empirical performance analysis of RSA-2048, ECC P-256 (ECDSA), and Ed25519 (EdDSA) in the Node.js crypto runtime.
        </p>
      </div>

      {/* Benchmark Control Bar */}
      <div className="bg-white border border-[#EAE0CE] rounded-3xl p-6 sm:p-8 shadow-warm-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#4F4232] uppercase tracking-wider">
            Iteration Sample Size
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {PRESET_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setSampleSize(size);
                  runBenchmark(size);
                }}
                disabled={loading}
                className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded-xl border transition-all ${
                  sampleSize === size
                    ? 'bg-[#181A1D] text-white border-[#181A1D] shadow-warm-sm'
                    : 'bg-[#FAF6EF] text-[#716049] border-[#EAE0CE] hover:bg-[#F4ECE0]'
                }`}
              >
                {size.toLocaleString()} runs
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => runBenchmark()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#181A1D] hover:bg-[#282B30] text-white text-xs font-bold rounded-xl shadow-warm hover:-translate-y-0.5 disabled:bg-[#EAE0CE] disabled:text-[#948065] disabled:cursor-not-allowed transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white text-[#FEF0C2]" />}
            <span>{loading ? 'Executing Test Harness...' : 'Execute Benchmark Suite'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-4">
          {error}
        </div>
      )}

      {/* Loading Banner */}
      {loading && (
        <div className="bg-white border border-[#EAE0CE] rounded-3xl p-16 text-center space-y-3 shadow-warm-sm">
          <Loader2 className="w-9 h-9 animate-spin text-[#8A5D08] mx-auto" />
          <h3 className="font-serif text-lg font-bold text-[#141619]">Running Benchmark Iterations</h3>
          <p className="text-xs text-[#716049] max-w-sm mx-auto leading-relaxed">
            Generating keys, signing digests, and verifying {sampleSize.toLocaleString()} signatures across RSA-2048, ECC P-256, and Ed25519...
          </p>
        </div>
      )}

      {/* Results View */}
      {results && !loading && (
        <div className="space-y-8">
          {/* Recommendation & Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white border border-[#EAE0CE] rounded-3xl p-6 shadow-warm-sm space-y-1">
              <span className="text-[10px] font-bold text-[#948065] uppercase tracking-wider block">
                Fastest Signing
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl font-extrabold text-[#141619]">
                  {results.recommendation.fastest.toUpperCase()}
                </span>
                <span className="text-xs text-[#15803D] font-bold font-mono">Sub-ms</span>
              </div>
              <p className="text-[11px] text-[#716049]">Blazing fast asymmetric signer</p>
            </div>

            <div className="bg-white border border-[#EAE0CE] rounded-3xl p-6 shadow-warm-sm space-y-1">
              <span className="text-[10px] font-bold text-[#948065] uppercase tracking-wider block">
                Smallest Signature Payload
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl font-extrabold text-[#15803D]">
                  {results.recommendation.smallest.toUpperCase()}
                </span>
                <span className="text-xs text-[#716049] font-mono font-bold">64 Bytes</span>
              </div>
              <p className="text-[11px] text-[#716049]">Highest QR code density</p>
            </div>

            <div className="bg-white border border-[#EAE0CE] rounded-3xl p-6 shadow-warm-sm space-y-1">
              <span className="text-[10px] font-bold text-[#948065] uppercase tracking-wider block">
                Sample Operations Run
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl font-extrabold text-[#141619] font-mono">
                  {results.sampleSize.toLocaleString()}
                </span>
                <span className="text-xs text-[#716049]">per algo</span>
              </div>
              <p className="text-[11px] text-[#716049]">Warmup + P95 empirical latency</p>
            </div>

            <div className="bg-[#181A1D] text-white rounded-3xl p-6 shadow-warm-md space-y-1">
              <span className="text-[10px] font-bold text-[#FEF0C2] uppercase tracking-wider block">
                Credify Top Recommendation
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl font-extrabold text-white">
                  {results.recommendation.overall.toUpperCase()}
                </span>
                <Award className="w-5 h-5 text-[#FEF0C2]" />
              </div>
              <p className="text-[11px] text-[#A0A5B1]">Optimal speed, size &amp; security</p>
            </div>
          </div>

          {/* Latency Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Signing Latency */}
            <div className="bg-white border border-[#EAE0CE] rounded-3xl p-6 sm:p-7 shadow-warm-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAE0CE] pb-3.5">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#B87F08]" />
                  <h3 className="text-sm font-bold text-[#141619]">Signing Latency (Lower is Better)</h3>
                </div>
                <span className="text-xs font-mono text-[#948065]">ms / op</span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={signData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#FAF6EF" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#716049', fontWeight: 600 }} />
                    <YAxis tick={{ fontSize: 11, fill: '#716049' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#EAE0CE',
                        borderRadius: 12,
                        fontSize: 12,
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    <Bar dataKey="Avg Latency (ms)" fill="#181A1D" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="P95 Latency (ms)" fill="#D5C5AC" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Verification Latency */}
            <div className="bg-white border border-[#EAE0CE] rounded-3xl p-6 sm:p-7 shadow-warm-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAE0CE] pb-3.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                  <h3 className="text-sm font-bold text-[#141619]">Verification Latency (Lower is Better)</h3>
                </div>
                <span className="text-xs font-mono text-[#948065]">ms / op</span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={verifyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#FAF6EF" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#716049', fontWeight: 600 }} />
                    <YAxis tick={{ fontSize: 11, fill: '#716049' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#EAE0CE',
                        borderRadius: 12,
                        fontSize: 12,
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    <Bar dataKey="Avg Latency (ms)" fill="#15803D" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="P95 Latency (ms)" fill="#86EFAC" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Secondary Charts: Signature Size & Multi-Dimensional Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Signature Payload Size */}
            <div className="bg-white border border-[#EAE0CE] rounded-3xl p-6 sm:p-7 shadow-warm-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAE0CE] pb-3.5">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#716049]" />
                  <h3 className="text-sm font-bold text-[#141619]">Signature Footprint (Bytes)</h3>
                </div>
                <span className="text-xs font-mono text-[#948065]">bytes</span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sizeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#FAF6EF" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#716049', fontWeight: 600 }} />
                    <YAxis tick={{ fontSize: 11, fill: '#716049' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#EAE0CE',
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    <Bar dataKey="Signature Size (Bytes)" fill="#B87F08" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Multi-Dimensional Radar Matrix */}
            <div className="bg-white border border-[#EAE0CE] rounded-3xl p-6 sm:p-7 shadow-warm-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAE0CE] pb-3.5">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#8A5D08]" />
                  <h3 className="text-sm font-bold text-[#141619]">Efficiency Scorecard</h3>
                </div>
                <span className="text-xs font-mono text-[#948065]">Score / 100</span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#EAE0CE" />
                    <PolarAngleAxis dataKey="algorithm" tick={{ fontSize: 11, fill: '#716049', fontWeight: 600 }} />
                    <PolarRadiusAxis tick={{ fontSize: 9, fill: '#948065' }} />
                    <Radar name="Sign Latency Score" dataKey="signSpeed" stroke="#181A1D" fill="#181A1D" fillOpacity={0.2} strokeWidth={2} />
                    <Radar name="Verify Latency Score" dataKey="verifySpeed" stroke="#15803D" fill="#15803D" fillOpacity={0.2} strokeWidth={2} />
                    <Radar name="Size Compactness" dataKey="sizeEfficiency" stroke="#B87F08" fill="#B87F08" fillOpacity={0.2} strokeWidth={2} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #EAE0CE', borderRadius: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Full Metrics Data Table */}
          <div className="bg-white border border-[#EAE0CE] rounded-3xl overflow-hidden shadow-warm-sm">
            <div className="px-6 py-4.5 border-b border-[#EAE0CE] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#141619] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#8A5D08]" />
                <span>Empirical Benchmark Dataset</span>
              </h3>
              <span className="text-xs font-mono text-[#948065]">
                Timestamp: {new Date(results.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#FAF6EF] border-b border-[#EAE0CE]">
                  <tr>
                    {[
                      'Algorithm',
                      'Key Gen (ms)',
                      'Avg Sign (ms)',
                      'P95 Sign (ms)',
                      'Avg Verify (ms)',
                      'P95 Verify (ms)',
                      'Signature Size',
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-[11px] font-bold text-[#716049] uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE0CE] text-xs font-mono">
                  {results.results.map((r) => (
                    <tr key={r.algorithm} className="hover:bg-[#FAF6EF]/60 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-[#141619]">{r.algorithm.toUpperCase()}</td>
                      <td className="px-4 py-3.5 text-[#716049]">{r.keyGenTimeMs.toFixed(2)} ms</td>
                      <td className="px-4 py-3.5 text-[#141619] font-bold">{r.signing.avgMs.toFixed(3)} ms</td>
                      <td className="px-4 py-3.5 text-[#948065]">{r.signing.p95Ms.toFixed(3)} ms</td>
                      <td className="px-4 py-3.5 text-[#141619] font-bold">{r.verification.avgMs.toFixed(3)} ms</td>
                      <td className="px-4 py-3.5 text-[#948065]">{r.verification.p95Ms.toFixed(3)} ms</td>
                      <td className="px-4 py-3.5 text-[#8A5D08] font-bold">{r.signatureSize} bytes</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Research Synthesis Card */}
          <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-3xl p-6 sm:p-8 shadow-warm-sm flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-[#FEF0C2] text-[#8A5D08] flex items-center justify-center flex-shrink-0 shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-2.5">
              <h4 className="font-serif text-base font-bold text-[#92400E]">
                Empirical Research Synthesis &amp; Architectural Recommendation
              </h4>
              <p className="text-xs text-[#92400E] leading-relaxed">
                {results.recommendation.reasoning}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-[11px] font-mono font-bold bg-white border border-[#FDE68A] text-[#92400E] rounded-xl px-3 py-1 shadow-2xs">
                  Fastest Signing: {results.recommendation.fastest.toUpperCase()}
                </span>
                <span className="text-[11px] font-mono font-bold bg-white border border-[#FDE68A] text-[#92400E] rounded-xl px-3 py-1 shadow-2xs">
                  Smallest Payload: {results.recommendation.smallest.toUpperCase()}
                </span>
                <span className="text-[11px] font-mono font-bold bg-[#181A1D] text-white rounded-xl px-3.5 py-1 shadow-warm-sm">
                  Recommended Primitive: {results.recommendation.overall.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


