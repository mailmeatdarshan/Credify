'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Download,
  ArrowLeft,
  User,
  Hash,
  BookOpen,
  ShieldCheck,
  Calendar,
  Building,
  Copy,
  Check,
  Share2,
  Lock,
  Ban,
  Loader2,
  FileText,
  KeyRound,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

interface CertificateDetail {
  id: string;
  studentName: string;
  rollNo: string;
  degree: string;
  cgpa: number;
  issueDate: string;
  dataHash: string;
  signature: string;
  status: string;
  createdAt: string;
  institution: {
    id: string;
    name: string;
    algorithm: string;
    publicKey: string;
  };
}

export default function CertificateDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [cert, setCert] = useState<CertificateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/certificates/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Certificate not found');
        const json = await res.json();
        setCert(json.certificate);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRevoke = async () => {
    if (!cert) return;
    if (!confirm('Are you sure you want to revoke this certificate? This action will mark it as revoked on all public verifiers.')) {
      return;
    }
    setRevoking(true);
    try {
      const res = await fetch(`/api/certificates/${cert.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'revoked' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to revoke certificate');
      setCert(json.certificate);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Revocation failed');
    } finally {
      setRevoking(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center px-4 space-y-3">
        <Loader2 className="w-8 h-8 text-[#8A5D08] animate-spin mx-auto" />
        <h3 className="font-serif text-base font-bold text-[#141619]">Fetching Credential Record...</h3>
        <p className="text-xs text-[#716049]">Loading certificate data and cryptographic public keys</p>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <Ban className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-serif text-lg font-bold text-[#141619]">Certificate Not Found</h2>
          <p className="text-xs text-[#716049] mt-1">{error || 'No certificate exists with the specified UUID.'}</p>
        </div>
        <Link
          href="/verify"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#181A1D] text-white text-xs font-bold rounded-xl hover:bg-[#282B30] shadow-warm transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Verification
        </Link>
      </div>
    );
  }

  const isRevoked = cert.status === 'revoked';

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/verify"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#716049] hover:text-[#141619] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Verification
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => copyToClipboard(window.location.href, 'share')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#EAE0CE] hover:bg-[#FAF6EF] text-[#141619] text-xs font-bold rounded-xl shadow-2xs transition-all"
          >
            {copiedField === 'share' ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Share2 className="w-3.5 h-3.5 text-[#716049]" />}
            <span>{copiedField === 'share' ? 'Link Copied' : 'Share Proof'}</span>
          </button>
        </div>
      </div>

      {/* Main Certificate Card */}
      <div className="bg-white border border-[#EAE0CE] rounded-3xl overflow-hidden shadow-warm-md">
        {/* Certificate Banner */}
        <div className="bg-[#181A1D] text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FEF0C2]">
                Official Credential Record
              </span>
              <span className="text-[#4B505B]">&bull;</span>
              <span className="text-[10px] font-mono text-[#A0A5B1]">
                {cert.institution.name}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {cert.studentName}
            </h1>
            <p className="text-xs sm:text-sm text-[#D5C5AC] font-medium">{cert.degree}</p>
          </div>

          <div className="flex flex-col sm:items-end gap-2 self-start sm:self-auto">
            <span
              className={`text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                isRevoked
                  ? 'bg-red-950/80 text-red-300 border-red-800'
                  : 'bg-[#15803D]/30 text-[#86EFAC] border-[#15803D]'
              }`}
            >
              {isRevoked ? 'Revoked' : 'Authentic Record'}
            </span>
            <span className="text-[10px] font-mono text-[#A0A5B1]">
              {cert.institution.algorithm.toUpperCase()} SIGNATURE
            </span>
          </div>
        </div>

        {/* Certificate Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Status Message */}
          <StatusBadge status={isRevoked ? 'revoked' : 'authentic'} />

          {/* Academic Info Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#141619] uppercase tracking-wider">
              Student Academic Record
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#FAF6EF] border border-[#EAE0CE] rounded-2xl flex items-start gap-3.5">
                <User className="w-4 h-4 text-[#8A5D08] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-[#948065] uppercase tracking-wider block">
                    Student Full Name
                  </span>
                  <span className="text-sm font-bold text-[#141619]">{cert.studentName}</span>
                </div>
              </div>

              <div className="p-4 bg-[#FAF6EF] border border-[#EAE0CE] rounded-2xl flex items-start gap-3.5">
                <Hash className="w-4 h-4 text-[#8A5D08] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-[#948065] uppercase tracking-wider block">
                    Roll Number / Student ID
                  </span>
                  <span className="text-sm font-mono font-bold text-[#141619]">{cert.rollNo}</span>
                </div>
              </div>

              <div className="p-4 bg-[#FAF6EF] border border-[#EAE0CE] rounded-2xl flex items-start gap-3.5">
                <BookOpen className="w-4 h-4 text-[#8A5D08] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-[#948065] uppercase tracking-wider block">
                    Conferred Degree / Program
                  </span>
                  <span className="text-sm font-bold text-[#141619]">{cert.degree}</span>
                </div>
              </div>

              <div className="p-4 bg-[#FAF6EF] border border-[#EAE0CE] rounded-2xl flex items-start gap-3.5">
                <ShieldCheck className="w-4 h-4 text-[#15803D] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-[#948065] uppercase tracking-wider block">
                    Cumulative GPA (CGPA)
                  </span>
                  <span className="text-sm font-bold text-[#141619]">{cert.cgpa.toFixed(2)} / 10.0</span>
                </div>
              </div>

              <div className="p-4 bg-[#FAF6EF] border border-[#EAE0CE] rounded-2xl flex items-start gap-3.5">
                <Calendar className="w-4 h-4 text-[#8A5D08] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-[#948065] uppercase tracking-wider block">
                    Conferral / Issue Date
                  </span>
                  <span className="text-sm font-semibold text-[#141619]">
                    {new Date(cert.issueDate).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-[#FAF6EF] border border-[#EAE0CE] rounded-2xl flex items-start gap-3.5">
                <Building className="w-4 h-4 text-[#8A5D08] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-[#948065] uppercase tracking-wider block">
                    Issuing Authority
                  </span>
                  <span className="text-sm font-semibold text-[#141619]">{cert.institution.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cryptographic Technical Breakdown */}
          <div className="border-t border-[#EAE0CE] pt-6 space-y-4">
            <h3 className="text-xs font-bold text-[#141619] uppercase tracking-wider">
              Cryptographic Provenance
            </h3>

            {/* Certificate UUID */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-[#948065] uppercase tracking-wider">
                  Certificate UUID
                </span>
                <button
                  onClick={() => copyToClipboard(cert.id, 'id')}
                  className="text-[11px] text-[#8A5D08] hover:text-[#5C3D06] flex items-center gap-1 font-bold"
                >
                  {copiedField === 'id' ? <Check className="w-3 h-3 text-[#15803D]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'id' ? 'Copied' : 'Copy UUID'}</span>
                </button>
              </div>
              <p className="font-mono text-xs text-[#141619] bg-[#FAF6EF] border border-[#EAE0CE] rounded-xl px-4 py-2.5 select-all">
                {cert.id}
              </p>
            </div>

            {/* SHA-256 Data Hash */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-[#948065] uppercase tracking-wider">
                  SHA-256 Canonical Payload Digest
                </span>
                <button
                  onClick={() => copyToClipboard(cert.dataHash, 'hash')}
                  className="text-[11px] text-[#8A5D08] hover:text-[#5C3D06] flex items-center gap-1 font-bold"
                >
                  {copiedField === 'hash' ? <Check className="w-3 h-3 text-[#15803D]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'hash' ? 'Copied' : 'Copy Digest'}</span>
                </button>
              </div>
              <p className="font-mono text-xs text-[#4F4232] bg-[#FAF6EF] border border-[#EAE0CE] rounded-xl px-4 py-2.5 break-all select-all">
                {cert.dataHash}
              </p>
            </div>

            {/* Digital Signature */}
            {cert.signature && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-[#948065] uppercase tracking-wider">
                    Asymmetric Digital Signature ({cert.institution.algorithm.toUpperCase()})
                  </span>
                  <button
                    onClick={() => copyToClipboard(cert.signature, 'sig')}
                    className="text-[11px] text-[#8A5D08] hover:text-[#5C3D06] flex items-center gap-1 font-bold"
                  >
                    {copiedField === 'sig' ? <Check className="w-3 h-3 text-[#15803D]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'sig' ? 'Copied' : 'Copy Signature'}</span>
                  </button>
                </div>
                <p className="font-mono text-[11px] text-[#716049] bg-[#FAF6EF] border border-[#EAE0CE] rounded-xl px-4 py-2.5 break-all select-all max-h-24 overflow-y-auto leading-relaxed">
                  {cert.signature}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="border-t border-[#EAE0CE] pt-6 flex flex-col sm:flex-row items-center gap-3">
            <a
              href={`/api/certificates/${cert.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-[#181A1D] hover:bg-[#282B30] text-white text-xs font-bold py-3.5 px-5 rounded-xl shadow-warm hover:-translate-y-0.5 transition-all"
            >
              <Download className="w-4 h-4 text-[#FEF0C2]" /> Download Official PDF Transcript
            </a>

            {!isRevoked && (
              <button
                onClick={handleRevoke}
                disabled={revoking}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold py-3.5 px-5 rounded-xl transition-all"
              >
                {revoking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                <span>Revoke Certificate</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


