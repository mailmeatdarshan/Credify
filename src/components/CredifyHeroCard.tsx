import { useState, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import CredifyLogo from '@/components/CredifyLogo';

export default function CredifyHeroCard() {
  const [tampered, setTampered] = useState(false);
  const [activeTab, setActiveTab] = useState<'ed25519' | 'p256' | 'rsa'>('ed25519');

  // Simulated live hash
  const hash = useMemo(() => {
    return tampered
      ? 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      : '7d1a2f4c9e8b0a3d5f6e7c8b9a0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d';
  }, [tampered]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-7 border border-black/5 max-w-md w-full relative text-left">
      {/* Top Header Mock: App Bar */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
            📄
          </div>
          <div className="space-y-1">
            <div className="w-20 h-2 bg-slate-200 rounded-full" />
            <div className="w-12 h-1.5 bg-slate-100 rounded-full" />
          </div>
        </div>

        {/* Algorithm Pill */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-mono font-bold text-slate-700">
          {(['ed25519', 'p256', 'rsa'] as const).map((algo) => (
            <button
              key={algo}
              type="button"
              onClick={() => setActiveTab(algo)}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeTab === algo ? 'bg-white text-slate-950 shadow-xs font-bold' : 'hover:text-slate-950'
              }`}
            >
              {algo.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Document Body */}
      <div className="space-y-4 text-sm text-slate-800 leading-relaxed font-sans">
        <p>
          Conferred to student <span className="font-semibold text-slate-900">Aarav Sharma</span> for completing{' '}
          <span className="font-semibold text-slate-900">B.Tech Computer Science</span> with Cumulative GPA{' '}
          {tampered ? (
            <span className="relative inline-block bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-semibold underline decoration-wavy decoration-red-500">
              9.95
            </span>
          ) : (
            <span className="relative inline-block bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold underline decoration-emerald-500">
              8.85
            </span>
          )}
          .
        </p>

        {/* Interactive Floating Suggestion Box (Outwrite-style popover) */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2 shadow-sm text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${tampered ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
              <span className="font-bold text-slate-900">
                {tampered ? 'Cryptographic Mismatch' : 'Signature Verified'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {activeTab === 'ed25519' ? '64B ED25519' : activeTab === 'p256' ? 'DER ECDSA' : '256B RSA'}
            </span>
          </div>

          <div className="font-mono text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200/60 truncate">
            SHA-256: {hash}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className={`font-semibold ${tampered ? 'text-red-600' : 'text-emerald-700'}`}>
              {tampered ? '❌ Proof Invalid' : '✓ Authentic Record'}
            </span>
            <button
              type="button"
              onClick={() => setTampered(!tampered)}
              className="text-[11px] font-bold text-slate-700 hover:text-slate-950 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              {tampered ? 'Reset to Authentic' : 'Simulate Tamper'}
            </button>
          </div>
        </div>
      </div>

      {/* Outwrite-style yellow badge in bottom right corner */}
      <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-[#181A1D] border-2 border-white shadow-md flex items-center justify-center p-1.5 text-[#FDE98A]">
        <CredifyLogo className="w-full h-full text-[#FDE98A]" />
      </div>
    </div>
  );
}

