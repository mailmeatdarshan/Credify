'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Code2,
  Copy,
  Check,
  Terminal,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  FileCode2,
  GraduationCap,
  Briefcase,
  Trophy,
} from 'lucide-react';

export default function DevelopersPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'fetch' | 'curl' | 'widget'>('fetch');

  const copyCode = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const codeSnippets = {
    fetch: `// Multi-Credential Verification via JavaScript (Degrees, Internships, Hackathons)
const formData = new FormData();
formData.append('file', credentialPdfBlob);

const response = await fetch('http://localhost:3000/api/v1/verify', {
  method: 'POST',
  headers: {
    'x-api-key': 'crdf_live_YOUR_INSTITUTION_API_KEY',
  },
  body: formData,
});

const data = await response.json();

if (data.verified && data.result === 'authentic') {
  // Cryptographic signature verified against the Root Keypair
  console.log('Recipient Authenticated:', data.certificate.studentName);
  console.log('Credential Type:', data.certificate.degree || data.certificate.role || data.certificate.event);
  console.log('Issuing Authority:', data.institution.name);
} else if (data.result === 'tampered') {
  // Hash mismatch or signature verification failure
  console.error('Tampered Document Alert:', data.tamperDetails?.reason);
} else {
  console.warn('Document status:', data.result);
}`,

    curl: `# Verify PDF Document (Marksheet / Internship / Hackathon) via cURL
curl -X POST http://localhost:3000/api/v1/verify \\
  -H "x-api-key: crdf_live_YOUR_INSTITUTION_API_KEY" \\
  -F "file=@/path/to/document.pdf"

# Verify by Certificate UUID
curl -X POST http://localhost:3000/api/v1/verify \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: crdf_live_YOUR_INSTITUTION_API_KEY" \\
  -d '{"id": "fac22f5f-0170-460a-881d-9d315eaa9b28"}'`,

    widget: `<!-- Drop-in Verification Widget for University & Company Portals -->
<div 
  id="credify-verify-widget" 
  data-api-key="crdf_live_YOUR_INSTITUTION_API_KEY"
  data-college-name="Examination & Certification Cell"
  data-endpoint="http://localhost:3000/api/v1/verify">
</div>

<!-- Credify Client SDK -->
<script src="http://localhost:3000/embed.js"></script>`,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header Banner */}
      <div className="text-center sm:text-left space-y-3">
        <div className="inline-flex items-center gap-2 bg-[#FEF9E5] text-[#8A5D08] border border-[#EAE0CE] rounded-full px-3.5 py-1 text-xs font-semibold shadow-2xs">
          <Code2 className="w-3.5 h-3.5 text-[#8A5D08]" />
          <span>Developer API &amp; Integration SDK</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#141619] tracking-tight">
          Integrate Credify into your <mark className="highlight">college &amp; portal</mark>
        </h1>
        <p className="text-sm sm:text-base text-[#716049] max-w-2xl leading-relaxed">
          Zero-trust cryptographic verification API. Validate student degrees, academic marksheets, industrial internships, and hackathon certificates programmatically using Ed25519 PKI.
        </p>

        {/* Supported Credential Types Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6EF] border border-[#EAE0CE] text-xs font-bold text-[#141619]">
            <GraduationCap className="w-3.5 h-3.5 text-[#8A5D08]" />
            <span>Academic Marksheets &amp; Degrees</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6EF] border border-[#EAE0CE] text-xs font-bold text-[#141619]">
            <Briefcase className="w-3.5 h-3.5 text-[#1E3A8A]" />
            <span>Internship Completion Letters</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6EF] border border-[#EAE0CE] text-xs font-bold text-[#141619]">
            <Trophy className="w-3.5 h-3.5 text-[#B45309]" />
            <span>Hackathon &amp; Competition Awards</span>
          </span>
        </div>
      </div>

      {/* Quickstep Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-[#EAE0CE] rounded-3xl p-6 shadow-warm-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#181A1D] text-[#FEF0C2] flex items-center justify-center font-mono font-bold text-sm">
            01
          </div>
          <h3 className="font-bold text-base text-[#141619]">Obtain API Key</h3>
          <p className="text-xs text-[#716049] leading-relaxed">
            Register your institution or organization to provision an Ed25519 root keypair and retrieve your <code className="font-mono bg-[#FAF6EF] px-1.5 py-0.5 rounded text-[#181A1D]">crdf_live_...</code> key.
          </p>
          <Link
            href="/university/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8A5D08] hover:text-[#5B3E05] pt-1"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white border border-[#EAE0CE] rounded-3xl p-6 shadow-warm-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#181A1D] text-[#FEF0C2] flex items-center justify-center font-mono font-bold text-sm">
            02
          </div>
          <h3 className="font-bold text-base text-[#141619]">Invoke Verification API</h3>
          <p className="text-xs text-[#716049] leading-relaxed">
            Pass PDF files or certificate UUIDs to <code className="font-mono bg-[#FAF6EF] px-1.5 py-0.5 rounded text-[#181A1D]">/api/v1/verify</code> with the <code className="font-mono bg-[#FAF6EF] px-1.5 py-0.5 rounded text-[#181A1D]">x-api-key</code> header.
          </p>
          <div className="text-xs font-bold text-[#15803D] pt-1">
            CORS Enabled for Web Clients
          </div>
        </div>

        <div className="bg-white border border-[#EAE0CE] rounded-3xl p-6 shadow-warm-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#181A1D] text-[#FEF0C2] flex items-center justify-center font-mono font-bold text-sm">
            03
          </div>
          <h3 className="font-bold text-base text-[#141619]">Cryptographic Verdict</h3>
          <p className="text-xs text-[#716049] leading-relaxed">
            Receive authenticated JSON payloads containing candidate identity, verified achievements, and tamper status.
          </p>
          <div className="text-xs font-bold text-[#15803D] pt-1">
            Ed25519 &bull; RSA &bull; ECDSA
          </div>
        </div>
      </div>

      {/* Code Integration Sandbox */}
      <div className="bg-[#181A1D] border border-[#2E333D] rounded-3xl overflow-hidden shadow-warm-lg">
        {/* Header tabs */}
        <div className="border-b border-[#2E333D] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#FEF0C2]" />
            <span className="text-xs font-mono font-bold text-white tracking-wide uppercase">
              Integration Code Samples
            </span>
          </div>

          <div className="flex items-center gap-2 bg-[#282B30] p-1 rounded-xl border border-[#3A3F4A]">
            <button
              onClick={() => setSelectedLanguage('fetch')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedLanguage === 'fetch'
                  ? 'bg-[#FEF0C2] text-[#181A1D] shadow-xs'
                  : 'text-[#A0A5B1] hover:text-white'
              }`}
            >
              JavaScript / Fetch
            </button>
            <button
              onClick={() => setSelectedLanguage('curl')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedLanguage === 'curl'
                  ? 'bg-[#FEF0C2] text-[#181A1D] shadow-xs'
                  : 'text-[#A0A5B1] hover:text-white'
              }`}
            >
              cURL
            </button>
            <button
              onClick={() => setSelectedLanguage('widget')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedLanguage === 'widget'
                  ? 'bg-[#FEF0C2] text-[#181A1D] shadow-xs'
                  : 'text-[#A0A5B1] hover:text-white'
              }`}
            >
              Drop-in Widget
            </button>
          </div>
        </div>

        {/* Code area */}
        <div className="p-6 sm:p-8 relative">
          <button
            onClick={() => copyCode(codeSnippets[selectedLanguage], 1)}
            className="absolute top-6 right-6 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#282B30] hover:bg-[#3A3F4A] text-white border border-[#4B505B] rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#D5C5AC]" />}
            <span>{copiedIndex === 1 ? 'Copied' : 'Copy'}</span>
          </button>

          <pre className="font-mono text-xs sm:text-sm text-[#EAE0CE] leading-relaxed overflow-x-auto select-all">
            <code>{codeSnippets[selectedLanguage]}</code>
          </pre>
        </div>

        {/* Footer of code card */}
        <div className="bg-[#121417] border-t border-[#2E333D] px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#A0A5B1]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Endpoint: <strong className="text-white font-mono">POST /api/v1/verify</strong></span>
          </div>
          <span>PDF Upload &bull; QR Payload &bull; Certificate ID &bull; Multi-Credential Support</span>
        </div>
      </div>

      {/* API Response Reference */}
      <div className="bg-white border border-[#EAE0CE] rounded-3xl p-6 sm:p-8 shadow-warm-md space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FEF9E5] text-[#8A5D08] flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-[#141619]">API Response Schema</h2>
            <p className="text-xs text-[#716049]">Structured JSON responses for verification states across all credential types.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* 200 Authentic */}
          <div className="border border-[#86EFAC] bg-[#F0FDF4] rounded-2xl p-5 space-y-2 font-mono text-xs text-[#14532D]">
            <div className="flex items-center justify-between pb-2 border-b border-[#BBF7D0]">
              <span className="font-bold uppercase tracking-wider text-[11px] text-[#15803D]">Response: Authentic</span>
              <span className="bg-[#DCFCE7] text-[#14532D] px-2 py-0.5 rounded text-[10px] font-bold">HTTP 200</span>
            </div>
            <pre className="text-[11px] leading-relaxed overflow-x-auto text-[#166534]">
{`{
  "success": true,
  "result": "authentic",
  "verified": true,
  "certificate": {
    "id": "fac22f5f-0170-460a-881d-9d315eaa9b28",
    "studentName": "Aarav Sharma",
    "rollNo": "2021CS10234",
    "degree": "B.Tech in Computer Science and Engineering",
    "cgpa": 9.45,
    "issueDate": "2025-06-15"
  },
  "institution": {
    "name": "Bhavan's College",
    "algorithm": "ed25519"
  },
  "dataHash": "7d1a2f9c4b8e01da3f...",
  "verifiedAt": "2026-09-23T20:00:00.000Z"
}`}
            </pre>
          </div>

          {/* 200 Tampered */}
          <div className="border border-[#FCA5A5] bg-[#FEF2F2] rounded-2xl p-5 space-y-2 font-mono text-xs text-[#991B1B]">
            <div className="flex items-center justify-between pb-2 border-b border-[#FECACA]">
              <span className="font-bold uppercase tracking-wider text-[11px] text-[#DC2626]">Response: Tampered</span>
              <span className="bg-[#FEE2E2] text-[#991B1B] px-2 py-0.5 rounded text-[10px] font-bold">HTTP 200</span>
            </div>
            <pre className="text-[11px] leading-relaxed overflow-x-auto text-[#7F1D1D]">
{`{
  "success": true,
  "result": "tampered",
  "verified": false,
  "certificate": {
    "studentName": "Darshan Dubey",
    "cgpa": 9.95
  },
  "tamperDetails": {
    "detected": true,
    "reason": "Document parameters altered post-issuance"
  },
  "dataHash": "7d1a2f9c4b8e01da3f...",
  "verifiedAt": "2026-09-23T20:00:00.000Z"
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
