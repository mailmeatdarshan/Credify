'use client';
import Link from 'next/link';
import CredifyHeroCard from '@/components/CredifyHeroCard';
import CredifyLogo from '@/components/CredifyLogo';
import {
  ShieldCheck,
  FileText,
  QrCode,
  Globe,
  Lock,
  Cpu,
  Zap,
  ArrowRight,
  Building,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* 1. HERO SECTION (FULLSCREEN PALE BUTTER YELLOW LIKE OUTWRITE) */}
      <section className="min-h-[calc(100vh-5.5rem)] flex items-center bg-[#FDE98A] py-16 sm:py-24 px-6 sm:px-10 lg:px-12 border-b border-black/10">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left Column: Big Editorial Headline & CTA */}
            <div className="lg:col-span-7 space-y-7 text-left">
              <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-normal text-[#181A1D] tracking-normal leading-[1.12]">
                Verify with<br />
                <span className="font-normal italic">impact.</span>
              </h1>
              <p className="text-lg sm:text-xl text-[#2B3037] max-w-lg leading-relaxed font-normal">
                Turn academic degrees and graduation transcripts into tamper-proof cryptographic proofs with Credify&apos;s zero-trust PKI engine.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/verify"
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-[#1E2229] hover:bg-[#2B303A] text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all"
                >
                  Verify a Certificate
                </Link>
                <Link
                  href="/university/dashboard"
                  className="inline-flex items-center justify-center px-6 py-3.5 bg-black/5 hover:bg-black/10 text-[#181A1D] text-sm font-semibold rounded-lg border border-black/10 transition-all"
                >
                  University Portal &rarr;
                </Link>
              </div>

              {/* 5 Star Trust Rating */}
              <div className="flex items-center gap-2.5 pt-2 text-[#181A1D]">
                <div className="flex text-[#181A1D] text-sm tracking-widest">
                  ★★★★★
                </div>
                <span className="text-xs font-semibold font-sans">
                  Verified Academic PKI Infrastructure
                </span>
              </div>
            </div>

            {/* Right Column: Floating Mock UI Card with Tamper Simulator */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <CredifyHeroCard />
            </div>
          </div>
        </div>
      </section>

      {/* 2. ROLE-BASED QUICK START (UNIVERSITIES / EMPLOYERS / STUDENTS) */}
      <section className="bg-[#FAF6EF] py-20 sm:py-28 border-b border-[#EAE0CE]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#181A1D] tracking-normal leading-tight">
              Designed for <span className="highlight-natural-yellow">universities</span>, <br className="hidden sm:inline" />
              trusted by employers
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Everything you need to issue, verify, and audit academic qualifications with cryptographic certainty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {/* Card 1: For Universities */}
            <div className="bg-white border border-[#EAE0CE] rounded-3xl p-8 shadow-warm-sm flex flex-col justify-between space-y-6 hover:shadow-warm transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FEF9E5] text-[#8A5D08] border border-[#FDE68A] flex items-center justify-center">
                  <Building className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl font-normal text-[#181A1D] tracking-normal">
                  Universities &amp; Colleges
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  Provision unforgeable Ed25519 root keys, batch-sign graduation degrees with embedded QR codes, and manage revocation logs.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  href="/university/dashboard"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#181A1D] hover:bg-[#282B30] text-white text-xs font-bold rounded-xl transition-all shadow-warm-sm active:scale-98"
                >
                  <span>Open University Console</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#FDE98A]" />
                </Link>
                <Link
                  href="/university/register"
                  className="w-full inline-flex items-center justify-center py-2.5 px-4 text-xs font-bold text-[#8A5D08] hover:underline"
                >
                  + Register New Authority
                </Link>
              </div>
            </div>

            {/* Card 2: For Employers & Verifiers */}
            <div className="bg-white border border-[#EAE0CE] rounded-3xl p-8 shadow-warm-sm flex flex-col justify-between space-y-6 hover:shadow-warm transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl font-normal text-[#181A1D] tracking-normal">
                  Recruiters &amp; HR Teams
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  Verify graduation certificates in milliseconds. Scan via device camera, drag-and-drop official PDF transcripts, or query UUIDs.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/verify"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold rounded-xl transition-all shadow-warm-sm active:scale-98"
                >
                  <span>Verify a Candidate Now</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </Link>
              </div>
            </div>

            {/* Card 3: For Hackathon & Researchers */}
            <div className="bg-white border border-[#EAE0CE] rounded-3xl p-8 shadow-warm-sm flex flex-col justify-between space-y-6 hover:shadow-warm transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF6EF] text-[#716049] border border-[#EAE0CE] flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-[#8A5D08]" />
                </div>
                <h3 className="font-serif text-2xl font-normal text-[#181A1D] tracking-normal">
                  Crypto Research Lab
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  Compare real-time signing latencies, verification throughput, and QR code density across RSA-2048, ECC P-256, and Ed25519.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/benchmark"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#FAF6EF] hover:bg-[#EAE0CE] text-[#181A1D] border border-[#EAE0CE] text-xs font-bold rounded-xl transition-all active:scale-98"
                >
                  <span>Run Live Benchmarks</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#716049]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WORKS WHEREVER CREDENTIALS ARE USED */}
      <section className="bg-white py-20 sm:py-28 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-14">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#181A1D] tracking-normal">
            Works <span className="highlight-natural-yellow">wherever</span> credentials are used
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 pt-2">
            {/* Platform 1: PDF Transcripts */}
            <Link
              href="/verify"
              className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <FileText className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold text-slate-800">PDF Transcripts</span>
            </Link>

            {/* Platform 2: QR Code Scanners */}
            <Link
              href="/verify"
              className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <QrCode className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold text-slate-800">QR Diplomas</span>
            </Link>

            {/* Platform 3: University Portals */}
            <Link
              href="/university/dashboard"
              className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Building className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold text-slate-800">University SIS</span>
            </Link>

            {/* Platform 4: Public Registry */}
            <Link
              href="/university/dashboard"
              className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold text-slate-800">Public Registry</span>
            </Link>

            {/* Platform 5: Verification API */}
            <Link
              href="/benchmark"
              className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Zap className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold text-slate-800">REST Webhooks</span>
            </Link>

            {/* Platform 6: HR & Embassies */}
            <Link
              href="/verify"
              className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Globe className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold text-slate-800">HR &amp; Embassies</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. ALTERNATING FEATURE SECTIONS (EXACT OUTWRITE 2-COLUMN ROWS) */}
      <section className="bg-white py-20 sm:py-28 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-28 sm:space-y-36">
        {/* ROW 1: "Verify with accuracy" (NATURAL GREEN HIGHLIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Mock Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-7 border border-slate-100 max-w-md w-full relative">
              {/* Header Bar */}
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
                <div className="w-5 h-5 rounded bg-red-50 text-red-600 flex items-center justify-center text-[10px] font-bold">
                  M
                </div>
                <div className="space-y-1">
                  <div className="w-24 h-2 bg-slate-200 rounded-full" />
                  <div className="w-14 h-1.5 bg-slate-100 rounded-full" />
                </div>
              </div>

              <p className="text-sm text-slate-800 leading-relaxed font-sans mb-4">
                Dear Hiring Team, please find attached the verified transcript for candidate{' '}
                <span className="font-semibold text-slate-900">Rohan Verma</span> with CGPA{' '}
                <span className="highlight-natural-green font-semibold">
                  9.45
                </span>{' '}
                conferred by IIT Delhi.
              </p>

              {/* Floating Tooltip */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-lg space-y-2 max-w-xs">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>SHA-256 Digest Match</span>
                </div>
                <div className="font-mono text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                  ✓ Verified: Ed25519 Signature
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Origin: IIT Delhi Root Key
                </div>
              </div>

              {/* Logo Stamp */}
              <div className="w-8 h-8 rounded-full bg-[#181A1D] flex items-center justify-center text-[#FDE98A] absolute -bottom-3 -right-3 shadow-md border-2 border-white p-1.5">
                <CredifyLogo className="w-full h-full text-[#FDE98A]" />
              </div>
            </div>
          </div>

          {/* Right Text Column */}
          <div className="lg:col-span-6 space-y-5 text-left">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#181A1D] tracking-normal leading-tight">
              Verify with <span className="highlight-natural-green">accuracy</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Validate graduation credentials with zero-knowledge cryptographic certainty. Mathematical public-key cryptography makes degree tampering impossible.
            </p>
            <div className="pt-2">
              <Link
                href="/verify"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#181A1D] hover:underline"
              >
                <span>Learn more about verification</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* ROW 2: "Protect with clarity" (NATURAL PURPLE HIGHLIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-5 text-left order-2 lg:order-1">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#181A1D] tracking-normal leading-tight">
              Protect with <span className="highlight-natural-purple">clarity</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Empower registrars and academic boards to sign batch transcripts securely. Universities retain 100% control of their cryptographic roots.
            </p>
            <div className="pt-2">
              <Link
                href="/university/dashboard"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#181A1D] hover:underline"
              >
                <span>Explore the university console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Mock Card */}
          <div className="lg:col-span-6 flex justify-center order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-7 border border-slate-100 max-w-md w-full relative">
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                    U
                  </div>
                  <span className="text-xs font-semibold text-slate-800 font-sans">
                    Academic Registrar Portal
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  ECC P-256
                </span>
              </div>

              <div className="space-y-2 mb-4 font-sans text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                  <span className="text-slate-600">Student</span>
                  <span className="font-semibold text-slate-900">Ananya Gupta</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                  <span className="text-slate-600">Degree</span>
                  <span className="font-semibold text-slate-900 highlight-natural-purple">
                    M.Tech Artificial Intelligence
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                  <span className="text-slate-600">Status</span>
                  <span className="font-semibold text-emerald-700">✓ Cryptographically Signed</span>
                </div>
              </div>

              {/* Logo Stamp */}
              <div className="w-8 h-8 rounded-full bg-[#181A1D] flex items-center justify-center text-[#FDE98A] absolute -bottom-3 -right-3 shadow-md border-2 border-white p-1.5">
                <CredifyLogo className="w-full h-full text-[#FDE98A]" />
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3: "Scale with efficiency" (NATURAL PINK HIGHLIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Mock Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-7 border border-slate-100 max-w-md w-full relative">
              {/* Header Bar */}
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
                <div className="w-5 h-5 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-bold">
                  ⚡
                </div>
                <span className="text-xs font-semibold text-slate-800 font-sans">
                  Real-time Asymmetric Benchmarking
                </span>
              </div>

              <div className="space-y-2 mb-4 font-sans text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                  <span className="text-slate-600">Ed25519 Signing</span>
                  <span className="font-mono font-bold text-emerald-700 highlight-natural-pink">
                    0.05 ms
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                  <span className="text-slate-600">ECC P-256 Signing</span>
                  <span className="font-mono font-bold text-slate-900">0.82 ms</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                  <span className="text-slate-600">RSA-2048 Signing</span>
                  <span className="font-mono font-bold text-slate-900">2.41 ms</span>
                </div>
              </div>

              {/* Logo Stamp */}
              <div className="w-8 h-8 rounded-full bg-[#181A1D] flex items-center justify-center text-[#FDE98A] absolute -bottom-3 -right-3 shadow-md border-2 border-white p-1.5">
                <CredifyLogo className="w-full h-full text-[#FDE98A]" />
              </div>
            </div>
          </div>

          {/* Right Text Column */}
          <div className="lg:col-span-6 space-y-5 text-left">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#181A1D] tracking-normal leading-tight">
              Scale with <span className="highlight-natural-pink">efficiency</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Sub-millisecond verification throughput ready for millions of students. Designed with native Node.js crypto primitives for maximum performance.
            </p>
            <div className="pt-2">
              <Link
                href="/benchmark"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#181A1D] hover:underline"
              >
                <span>View algorithm benchmarks</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
