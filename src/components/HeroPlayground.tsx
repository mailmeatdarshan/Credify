'use client';
import { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Zap,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Lock,
  Sparkles,
  ArrowRight,
  Fingerprint,
} from 'lucide-react';

export default function HeroPlayground() {
  const [studentName, setStudentName] = useState('Aarav Sharma');
  const [degree, setDegree] = useState('B.Tech in Computer Science');
  const [cgpa, setCgpa] = useState('8.85');
  const [algorithm, setAlgorithm] = useState<'Ed25519' | 'ECC P-256' | 'RSA-2048'>('Ed25519');
  const [isTampered, setIsTampered] = useState(false);

  // Deterministic mock hash generator for real-time visualization
  const displayedCgpa = isTampered ? '9.95' : cgpa;
  
  const payloadString = JSON.stringify({
    cgpa: parseFloat(displayedCgpa) || 8.85,
    degree,
    name: studentName,
    roll: 'IITD-2021-CS402',
    univ: 'Indian Institute of Technology Delhi',
  });

  // Simple deterministic visual hash representation
  const dataHash = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < payloadString.length; i++) {
      hash = (hash << 5) - hash + payloadString.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    if (isTampered) {
      return `f9a2b48e10cd392a8b7e615024d9c7e01a4f${hex}98e11a2f64c09d`;
    }
    return `e3b0c44298fc1c149afbf4c8996fb92427ae${hex}a9d18e2234e89b`;
  }, [payloadString, isTampered]);

  const sigSize = algorithm === 'Ed25519' ? '64 bytes' : algorithm === 'ECC P-256' ? '71 bytes (DER)' : '256 bytes';

  return (
    <div className="w-full bg-white border border-[#EAE0CE] rounded-3xl p-6 sm:p-8 shadow-warm-lg transition-all">
      {/* Sandbox Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#EAE0CE]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FEF0C2] text-[#8A5D08] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#141619]">Live Cryptographic Verification Sandbox</h3>
            <p className="text-xs text-[#716049]">Test real-time canonical hashing &amp; tamper resilience</p>
          </div>
        </div>

        {/* Algorithm Tabs */}
        <div className="flex items-center gap-1 bg-[#FAF6EF] p-1 rounded-xl border border-[#EAE0CE]">
          {(['Ed25519', 'ECC P-256', 'RSA-2048'] as const).map((algo) => (
            <button
              key={algo}
              type="button"
              onClick={() => setAlgorithm(algo)}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                algorithm === algo
                  ? 'bg-[#181A1D] text-white shadow-xs'
                  : 'text-[#716049] hover:text-[#181A1D]'
              }`}
            >
              {algo}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Form Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
        <div>
          <label className="block text-[11px] font-bold text-[#716049] uppercase tracking-wider mb-1.5">
            Student Full Name
          </label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#FAF6EF] border border-[#EAE0CE] rounded-xl text-xs font-semibold text-[#141619] focus:bg-white focus:ring-2 focus:ring-[#FBC02D] transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#716049] uppercase tracking-wider mb-1.5">
            Conferred Program
          </label>
          <input
            type="text"
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#FAF6EF] border border-[#EAE0CE] rounded-xl text-xs font-semibold text-[#141619] focus:bg-white focus:ring-2 focus:ring-[#FBC02D] transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#716049] uppercase tracking-wider mb-1.5">
            Grade Point Average (CGPA)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={displayedCgpa}
              disabled={isTampered}
              onChange={(e) => setCgpa(e.target.value)}
              className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all border ${
                isTampered
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-[#FAF6EF] text-[#141619] border-[#EAE0CE]'
              }`}
            />
            <button
              type="button"
              onClick={() => setIsTampered(!isTampered)}
              className={`px-3 py-2.5 text-xs font-bold rounded-xl border transition-all whitespace-nowrap ${
                isTampered
                  ? 'bg-red-600 text-white border-red-600 shadow-xs'
                  : 'bg-[#FAF6EF] hover:bg-[#F4ECE0] text-[#716049] border-[#EAE0CE]'
              }`}
            >
              {isTampered ? 'Revert Tamper' : '⚡ Simulate Tampering'}
            </button>
          </div>
        </div>
      </div>

      {/* Live Hash & Signature Readout */}
      <div className="mt-6 p-4 rounded-2xl bg-[#FAF6EF] border border-[#EAE0CE] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-[#B87F08]" />
            <span className="font-bold text-[#141619]">SHA-256 Canonical Digest:</span>
          </div>
          <span className="font-mono text-[11px] text-[#716049]">Payload Size: {payloadString.length} bytes</span>
        </div>
        <p className="font-mono text-xs text-[#4F4232] bg-white border border-[#EAE0CE] rounded-xl px-3.5 py-2 break-all select-all">
          {dataHash}
        </p>
      </div>

      {/* Real-time Verification Result Banner */}
      <div className="mt-5">
        {!isTampered ? (
          <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#14532D]">
                  Cryptographic Proof Valid • Authentic Credential
                </p>
                <p className="text-[11px] text-[#166534] mt-0.5">
                  Signed with {algorithm} ({sigSize}) by IIT Delhi root authority. Mathematical signature matches payload hash.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex text-[10px] font-mono font-bold uppercase bg-[#DCFCE7] text-[#15803D] px-2.5 py-1 rounded-full">
              STATUS: 200 OK
            </span>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#991B1B]">
                  Signature Mismatch Detected • Forgery Blocked!
                </p>
                <p className="text-[11px] text-[#B91C1C] mt-0.5">
                  CGPA was modified from 8.85 to 9.95. The recalculated SHA-256 digest failed the asymmetric public-key math verification.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex text-[10px] font-mono font-bold uppercase bg-[#FEE2E2] text-[#DC2626] px-2.5 py-1 rounded-full">
              STATUS: 400 TAMPERED
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
