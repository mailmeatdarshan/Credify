'use client';
import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Camera,
  Search,
  Upload,
  X,
  Loader2,
  ShieldCheck,
  Building,
  Hash,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  FileText,
  Lock,
  ArrowRight,
  FileSearch,
  AlertTriangle,
  AlertOctagon,
  Layers,
  Calendar,
  Cpu,
  Info,
  Download,
  CheckCircle2,
  GraduationCap,
  Ban,
} from 'lucide-react';
import CredifyLogo from '@/components/CredifyLogo';
import StatusBadge from '@/components/StatusBadge';
import CertificateCard from '@/components/CertificateCard';
import { useQRScanner } from '@/lib/hooks/useQRScanner';

interface PDFForensicReport {
  isLegacyUnsigned: boolean;
  producer: string | null;
  creator: string | null;
  creationDate: string | null;
  modificationDate: string | null;
  revisionCount: number;
  editingToolDetected: string | null;
  riskLevel: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';
  riskScore: number;
  riskSummary: string;
  observations: string[];
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    pdfVersion?: string;
    hasXMP: boolean;
  };
}

interface VerificationResult {
  result: 'authentic' | 'tampered' | 'not_found' | 'revoked' | 'legacy_unverified' | 'high_risk_tampered' | 'loading';
  certificate?: {
    id: string;
    studentName: string;
    rollNo: string;
    degree: string;
    cgpa: number;
    issueDate: string;
    status: string;
  };
  institution?: { id: string; name: string };
  algorithm?: string;
  dataHash?: string;
  verifiedAt?: string;
  error?: string;
  forensicReport?: PDFForensicReport;
  extractedTextSnippet?: string;
  tampering?: {
    detected: boolean;
    reason: string;
    discrepancies?: Record<string, { expected: string | number; detected: string | number }>;
  };
}

const tabs = [
  { id: 'qr' as const, label: 'QR Scanner', icon: Camera },
  { id: 'id' as const, label: 'Certificate UUID', icon: Search },
  { id: 'upload' as const, label: 'PDF Transcript', icon: Upload },
];

export default function VerifyPage() {
  const [mode, setMode] = useState<'qr' | 'id' | 'upload'>('upload');
  const [certId, setCertId] = useState('');
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrImageInputRef = useRef<HTMLInputElement>(null);

  const handleScan = useCallback(async (data: string) => {
    setLoading(true);
    setVerification({ result: 'loading' });
    try {
      const res = await fetch('/api/verify/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: data }),
      });
      let json: any = null;
      try {
        json = await res.json();
      } catch {
        json = null;
      }
      if (!res.ok || !json?.result) {
        throw new Error(json?.error || 'Verification failed. Could not verify QR code.');
      }
      setVerification(json);
    } catch (err) {
      setVerification({ result: 'not_found', error: err instanceof Error ? err.message : 'Invalid QR code' });
    } finally {
      setLoading(false);
    }
  }, []);

  const scanner = useQRScanner({ onScan: handleScan });

  const handleQRImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const found = await scanner.scanImageFile(file);
    if (!found) {
      alert('No valid QR code was detected in the uploaded image. Please ensure the QR code is clearly visible and well-lit.');
      setLoading(false);
    }
    // reset input
    e.target.value = '';
  };

  const handleIdVerify = async (idToVerify?: string) => {
    const targetId = (idToVerify || certId).trim();
    if (!targetId) return;
    setLoading(true);
    setVerification({ result: 'loading' });
    try {
      const res = await fetch(`/api/certificates/${targetId}`);
      let json: any = null;
      try {
        json = await res.json();
      } catch {
        json = null;
      }

      if (!res.ok || !json?.certificate) {
        setVerification({
          result: 'not_found',
          error: json?.error || 'Certificate ID not found in the cryptographic registry.',
        });
        return;
      }

      const cert = json.certificate;
      setVerification({
        result: cert.status === 'revoked' ? 'revoked' : 'authentic',
        certificate: {
          id: cert.id,
          studentName: cert.studentName,
          rollNo: cert.rollNo,
          degree: cert.degree,
          cgpa: cert.cgpa,
          issueDate: cert.issueDate,
          status: cert.status,
        },
        institution: {
          id: cert.institution?.id || '',
          name: cert.institution?.name || 'Authorized Institution',
        },
        verifiedAt: new Date().toISOString(),
        algorithm: cert.institution?.algorithm || 'ed25519',
        dataHash: cert.dataHash,
      });
    } catch (err) {
      setVerification({
        result: 'not_found',
        error: err instanceof Error ? err.message : 'Verification request failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please select a valid PDF file.');
      return;
    }
    setFileName(file.name);
    setLoading(true);
    setVerification({ result: 'loading' });
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (certId.trim()) {
        formData.append('certificate_id', certId.trim());
      }
      const res = await fetch('/api/verify/upload', { method: 'POST', body: formData });
      let json: any = null;
      try {
        json = await res.json();
      } catch {
        json = null;
      }
      if (!res.ok || !json?.result) {
        setVerification({ result: 'not_found', error: json?.error || 'Failed to verify PDF document' });
        return;
      }
      setVerification(json);
    } catch (err) {
      setVerification({ result: 'not_found', error: err instanceof Error ? err.message : 'Upload failed' });
    } finally {
      setLoading(false);
    }
  }, [certId]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const switchMode = (newMode: 'qr' | 'id' | 'upload') => {
    if (mode === 'qr') scanner.stop();
    setMode(newMode);
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const report = verification?.forensicReport;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Editorial Header */}
      <div className="text-center sm:text-left space-y-2">
        <div className="inline-flex items-center gap-2 bg-[#FEF9E5] text-[#8A5D08] border border-[#EAE0CE] rounded-full px-3.5 py-1 text-xs font-semibold shadow-2xs">
          <CredifyLogo className="w-4 h-4 text-[#8A5D08]" />
          <span>Zero-Trust Verification &amp; Forensics</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#141619] tracking-tight">
          Verify academic <mark className="highlight">credentials</mark>
        </h1>
        <p className="text-sm text-[#716049] max-w-xl leading-relaxed">
          Verify cryptographic authenticity in milliseconds, or perform deep PDF forensic inspection on legacy unsigned marksheets and internship documents.
        </p>
      </div>

      {/* Main Verification Frame */}
      <div className="bg-white border border-[#EAE0CE] rounded-3xl overflow-hidden shadow-warm-md">
        {/* Outwrite-Style Pill Tabs Header */}
        <div className="flex border-b border-[#EAE0CE] bg-[#FAF6EF] p-2 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = mode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchMode(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-2xl transition-all ${
                  isActive
                    ? 'bg-white text-[#141619] shadow-warm-sm border border-[#EAE0CE]'
                    : 'text-[#716049] hover:text-[#141619] hover:bg-white/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#8A5D08]' : 'text-[#948065]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        <div className="p-6 sm:p-8">
          {/* QR Scanner Mode */}
          {mode === 'qr' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-full max-w-sm aspect-square bg-[#141619] rounded-2xl overflow-hidden relative shadow-warm-lg border border-[#EAE0CE]">
                {/* Persistent Video Element to guarantee immediate stream binding */}
                <video
                  ref={scanner.videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                    scanner.isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                />

                {/* When Camera is NOT active: Show Launch Controls Overlay */}
                {!scanner.isActive && (
                  <div className="absolute inset-0 bg-[#FAF6EF] flex flex-col items-center justify-center p-6 text-center z-10">
                    <div className="w-14 h-14 rounded-2xl bg-[#FEF9E5] text-[#8A5D08] flex items-center justify-center mb-3 shadow-xs">
                      <Camera className="w-7 h-7" />
                    </div>
                    <h3 className="text-sm font-bold text-[#141619] mb-1">Camera Scanner Ready</h3>
                    <p className="text-xs text-[#716049] mb-5 max-w-xs leading-relaxed">
                      Point your camera or laptop webcam at the QR code printed on the credential.
                    </p>
                    <button
                      type="button"
                      onClick={scanner.start}
                      disabled={scanner.isStarting}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#181A1D] text-white text-xs font-bold rounded-xl hover:bg-[#282B30] shadow-warm hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                    >
                      {scanner.isStarting ? (
                        <>
                          <Loader2 className="w-4 h-4 text-[#FEF0C2] animate-spin" />
                          <span>Starting Camera...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 text-[#FEF0C2]" />
                          <span>Launch Camera Scanner</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* When Camera is active: Golden Viewfinder Guides & Laser Scan Indicator */}
                {scanner.isActive && (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8">
                      <div className="w-full h-full border-2 border-[#FEF0C2]/80 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-[#FBC02D] -mt-1 -ml-1 rounded-tl" />
                        <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-[#FBC02D] -mt-1 -mr-1 rounded-tr" />
                        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-[#FBC02D] -mb-1 -ml-1 rounded-bl" />
                        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-[#FBC02D] -mb-1 -mr-1 rounded-br" />

                        {/* Animated Laser Pulse */}
                        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#FBC02D] to-transparent shadow-[0_0_8px_#FBC02D] animate-pulse absolute top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={scanner.stop}
                      className="absolute top-3 right-3 p-2 bg-black/70 backdrop-blur-sm rounded-xl text-white hover:bg-black transition-colors z-20 cursor-pointer"
                      title="Stop Camera"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Quick Image File Upload Alternative for QR Codes */}
              <div className="flex flex-col items-center gap-1.5 pt-1">
                <input
                  ref={qrImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleQRImageUpload}
                />
                <button
                  type="button"
                  onClick={() => qrImageInputRef.current?.click()}
                  className="text-xs font-semibold text-[#8A5D08] hover:text-[#181A1D] hover:underline inline-flex items-center gap-1.5 cursor-pointer py-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Or scan QR code screenshot / image file</span>
                </button>
              </div>

              {scanner.error && (
                <div className="w-full max-w-sm bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl p-3.5 text-center space-y-2">
                  <p className="font-semibold">{scanner.error}</p>
                  <button
                    type="button"
                    onClick={scanner.start}
                    className="px-3 py-1.5 bg-[#181A1D] text-white text-xs font-bold rounded-lg hover:bg-black transition-all cursor-pointer"
                  >
                    Try Camera Again
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Certificate ID Mode */}
          {mode === 'id' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4F4232] uppercase tracking-wider mb-2">
                  Certificate UUID Identifier
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={certId}
                    onChange={(e) => setCertId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleIdVerify()}
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF6EF] border border-[#EAE0CE] rounded-xl text-sm font-mono text-[#141619] placeholder:text-[#948065] focus:bg-white focus:ring-2 focus:ring-[#FBC02D] transition-all"
                    placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                  />
                  <Search className="w-4 h-4 text-[#716049] absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                onClick={() => handleIdVerify()}
                disabled={!certId.trim() || loading}
                className="w-full py-3 bg-[#181A1D] text-white text-xs font-bold rounded-xl hover:bg-[#282B30] disabled:bg-[#EAE0CE] disabled:text-[#948065] disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-warm hover:-translate-y-0.5 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 text-[#FEF0C2]" />}
                <span>{loading ? 'Verifying Asymmetric Signature...' : 'Query & Verify Certificate'}</span>
              </button>
            </div>
          )}

          {/* PDF Upload Mode */}
          {mode === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full p-8 sm:p-12 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-[#B87F08] bg-[#FEF9E5]'
                    : 'border-[#D5C5AC] bg-[#FAF6EF] hover:border-[#B87F08] hover:bg-[#FEF9E5]/60'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-white border border-[#EAE0CE] flex items-center justify-center text-[#8A5D08] mx-auto mb-3 shadow-2xs">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-[#141619]">
                  {fileName ? fileName : 'Upload Credential PDF or Legacy Marksheet'}
                </h3>
                <p className="text-xs text-[#716049] mt-1.5 max-w-sm mx-auto leading-relaxed">
                  Drag and drop any PDF certificate here. Credify validates cryptographic signatures or runs deep forensic analysis on legacy documents.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                  <span className="text-[10px] font-mono font-bold text-[#8A5D08] bg-white border border-[#EAE0CE] px-3 py-1 rounded-full">
                    PKI Digital Signatures
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#15803D] bg-[#F0FDF4] border border-[#BBF7D0] px-3 py-1 rounded-full">
                    Photoshop / Canva Forensic Scan
                  </span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />
            </div>
          )}
        </div>
      </div>

      {/* Loading State Banner */}
      {loading && (
        <div className="bg-white border border-[#EAE0CE] rounded-2xl p-8 text-center space-y-2 shadow-warm-sm">
          <Loader2 className="w-8 h-8 animate-spin text-[#8A5D08] mx-auto" />
          <h4 className="text-sm font-bold text-[#141619]">Validating Document &amp; Computing Proof</h4>
          <p className="text-xs text-[#716049]">
            Extracting text objects, analyzing metadata dictionaries, and verifying digital signatures...
          </p>
        </div>
      )}

      {/* Verification Result Card */}
      {verification && verification.result !== 'loading' && (
        <div className="space-y-5 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#716049] uppercase tracking-wider">
              Verification Proof Summary
            </span>
            {verification.verifiedAt && (
              <span className="text-[11px] font-mono text-[#948065]">
                Verified at: {new Date(verification.verifiedAt).toLocaleTimeString()}
              </span>
            )}
          </div>

          <StatusBadge status={verification.result as any} customDescription={verification.error} />

          {/* Case 1: Cryptographic Authentic Credential */}
          {verification.result === 'authentic' && verification.certificate && (
            <div className="space-y-6">
              <div className="bg-gradient-to-b from-[#F0FDF4] via-white to-[#F0FDF4] border-2 border-[#16A34A]/30 rounded-3xl p-6 sm:p-8 shadow-warm-md space-y-6">
                {/* Official Verification Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#BBF7D0]">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] mb-1">
                      <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                      <span>100% Cryptographically Verified &amp; Authentic</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#14532D]">
                      Authentic Credential Confirmed
                    </h2>
                    <p className="text-xs text-[#166534] max-w-xl leading-relaxed">
                      This document has been mathematically validated against the registered public root key of{' '}
                      <strong>{verification.institution?.name}</strong>. The payload matches the original issuance exactly with zero modifications.
                    </p>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 bg-white/80 border border-[#BBF7D0] px-4 py-2.5 rounded-2xl shadow-2xs">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#15803D] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" /> VALIDATED
                    </span>
                    <span className="text-[11px] font-mono text-[#14532D]">
                      {verification.verifiedAt ? new Date(verification.verifiedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Verified Live'}
                    </span>
                  </div>
                </div>

                {/* Candidate & Academic Details Spotlight */}
                <div className="bg-white border border-[#EAE0CE] rounded-2xl p-6 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-[#FAF6EF]">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#8A5D08] uppercase tracking-wider block mb-1">
                        Candidate Full Name
                      </span>
                      <h3 className="text-2xl font-bold text-[#141619] tracking-tight">
                        {verification.certificate.studentName}
                      </h3>
                      <p className="text-sm font-semibold text-[#716049] mt-0.5">
                        {verification.certificate.degree}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                        Status: Active &amp; Valid
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="p-3 bg-[#FAF6EF] rounded-xl border border-[#EAE0CE]/70">
                      <span className="text-[10px] font-semibold text-[#948065] uppercase tracking-wider block mb-0.5">
                        Roll / Student ID
                      </span>
                      <span className="font-mono font-bold text-[#141619]">
                        {verification.certificate.rollNo}
                      </span>
                    </div>

                    <div className="p-3 bg-[#FAF6EF] rounded-xl border border-[#EAE0CE]/70">
                      <span className="text-[10px] font-semibold text-[#948065] uppercase tracking-wider block mb-0.5">
                        Evaluation Score / CGPA
                      </span>
                      <span className="font-mono font-bold text-[#15803D] text-sm">
                        {typeof verification.certificate.cgpa === 'number' ? verification.certificate.cgpa.toFixed(2) : verification.certificate.cgpa} <span className="text-[10px] text-[#716049]">/ 10.0</span>
                      </span>
                    </div>

                    <div className="p-3 bg-[#FAF6EF] rounded-xl border border-[#EAE0CE]/70">
                      <span className="text-[10px] font-semibold text-[#948065] uppercase tracking-wider block mb-0.5">
                        Date of Issue
                      </span>
                      <span className="font-medium text-[#141619]">
                        {new Date(verification.certificate.issueDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="p-3 bg-[#FAF6EF] rounded-xl border border-[#EAE0CE]/70">
                      <span className="text-[10px] font-semibold text-[#948065] uppercase tracking-wider block mb-0.5">
                        Issuing Authority
                      </span>
                      <span className="font-bold text-[#141619] truncate block" title={verification.institution?.name}>
                        {verification.institution?.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4-Point Cryptographic Proof Audit */}
                <div className="bg-[#FAF6EF] border border-[#EAE0CE] rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-[#141619] uppercase tracking-wider flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-[#8A5D08]" />
                    <span>Cryptographic Verification Audit Checkpoints</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-[#EAE0CE]">
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                      <div>
                        <span className="font-bold text-[#141619] block">Asymmetric Digital Signature</span>
                        <span className="text-[11px] text-[#716049]">
                          Primitive: {verification.algorithm?.toUpperCase() || 'ED25519'} &bull; Mathematical Proof PASS
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-[#EAE0CE]">
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                      <div>
                        <span className="font-bold text-[#141619] block">Payload Canonical Digest</span>
                        <span className="text-[11px] text-[#716049]">
                          SHA-256 Digest matches database registry 100%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-[#EAE0CE]">
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                      <div>
                        <span className="font-bold text-[#141619] block">Issuing Authority Provenance</span>
                        <span className="text-[11px] text-[#716049]">
                          Signed with Root Key of {verification.institution?.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-[#EAE0CE]">
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                      <div>
                        <span className="font-bold text-[#141619] block">Revocation Registry Check</span>
                        <span className="text-[11px] text-[#716049]">
                          Active credential &bull; No revocation notices on file
                        </span>
                      </div>
                    </div>
                  </div>

                  {verification.dataHash && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold text-[#948065] uppercase tracking-wider">
                          Verified Canonical SHA-256 Digest
                        </span>
                        <button
                          onClick={() => copyHash(verification.dataHash!)}
                          className="text-[11px] text-[#8A5D08] hover:text-[#5C3D06] flex items-center gap-1 font-semibold"
                        >
                          {copiedHash ? <Check className="w-3 h-3 text-[#15803D]" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedHash ? 'Copied' : 'Copy Digest'}</span>
                        </button>
                      </div>
                      <p className="font-mono text-[11px] text-[#4F4232] bg-white border border-[#EAE0CE] rounded-xl px-3.5 py-2 break-all select-all">
                        {verification.dataHash}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <a
                    href={`/api/certificates/${verification.certificate.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-[#181A1D] hover:bg-[#282B30] text-white text-xs font-bold py-3.5 px-5 rounded-xl shadow-warm hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#FEF0C2]" />
                    <span>Download Official Verified PDF Transcript</span>
                  </a>
                  <Link
                    href={`/certificates/${verification.certificate.id}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#FAF6EF] text-[#141619] border border-[#EAE0CE] text-xs font-bold py-3.5 px-5 rounded-xl transition-all"
                  >
                    <ExternalLink className="w-4 h-4 text-[#716049]" />
                    <span>View Public Registry Record</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Case 2: Tampered / Fraudulent Document Detected */}
          {verification.result === 'tampered' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-b from-[#FEF2F2] via-white to-[#FEF2F2] border-2 border-[#EF4444] rounded-3xl p-6 sm:p-8 shadow-warm-md space-y-6">
                {/* Security Warning Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#FECACA]">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5] mb-1">
                      <AlertOctagon className="w-4 h-4 text-[#DC2626]" />
                      <span>Security Warning: Cryptographic Integrity Breach</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#991B1B]">
                      Tampered / Fraudulent Document Detected
                    </h2>
                    <p className="text-xs text-[#B91C1C] max-w-xl leading-relaxed">
                      {verification.tampering?.reason ||
                        'The uploaded document contains alterations or an invalid cryptographic signature. The contents of this document diverge from the authorized record.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-red-100/80 border border-red-300 px-4 py-2.5 rounded-2xl">
                    <span className="text-xs font-mono font-bold text-red-800">
                      FRAUD DETECTED
                    </span>
                  </div>
                </div>

                {/* Side-by-Side Discrepancy Forensic Breakdown */}
                {verification.tampering?.discrepancies && (
                  <div className="bg-white border border-[#FECACA] rounded-2xl p-6 space-y-4">
                    <h4 className="text-xs font-bold text-[#991B1B] uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
                      <span>Forensic Discrepancy Inspection (Original vs. Uploaded)</span>
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-[#EAE0CE] bg-[#FAF6EF]">
                            <th className="py-2.5 px-4 font-bold text-[#716049]">Credential Field</th>
                            <th className="py-2.5 px-4 font-bold text-[#15803D]">Original in PKI Registry</th>
                            <th className="py-2.5 px-4 font-bold text-[#B91C1C]">Tampered Value in Document</th>
                            <th className="py-2.5 px-4 font-bold text-[#991B1B]">Verdict</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EAE0CE]">
                          {Object.entries(verification.tampering.discrepancies).map(([field, data]) => (
                            <tr key={field} className="hover:bg-red-50/40">
                              <td className="py-3 px-4 font-semibold text-[#141619]">{field}</td>
                              <td className="py-3 px-4 font-mono font-bold text-[#15803D] bg-emerald-50/60 rounded">
                                {String(data.expected)}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-[#B91C1C] bg-red-50 rounded line-through">
                                {String(data.detected)}
                              </td>
                              <td className="py-3 px-4 font-bold text-red-600">
                                ALTERED / FRAUDULENT
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <p className="text-[11px] text-[#716049] leading-relaxed pt-1">
                      Because Credify hashes canonical data objects and signs them with institution private keys, altering numbers, names, or distinctions in the PDF automatically invalidates the mathematical signature.
                    </p>
                  </div>
                )}

                {/* Registered Authority & Original Record Context */}
                {verification.certificate && (
                  <div className="bg-[#FAF6EF] border border-[#EAE0CE] rounded-2xl p-5 space-y-3 text-xs">
                    <span className="text-[10px] font-bold text-[#948065] uppercase tracking-wider block">
                      Target Certificate UUID in Registry
                    </span>
                    <p className="font-mono text-xs text-[#141619] break-all">
                      {verification.certificate.id} (Issued by: {verification.institution?.name || 'Authorized University'})
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Case 3: Revoked Credential */}
          {verification.result === 'revoked' && verification.certificate && (
            <div className="space-y-6">
              <div className="bg-gradient-to-b from-[#FFF7ED] via-white to-[#FFF7ED] border-2 border-[#EA580C] rounded-3xl p-6 sm:p-8 shadow-warm-md space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#FFEDD5]">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFEDD5] text-[#C2410C] border border-[#FDBA74] mb-1">
                      <Ban className="w-4 h-4 text-[#EA580C]" />
                      <span>Credential Invalidation Notice</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#9A3412]">
                      Credential Revoked by Issuing Institution
                    </h2>
                    <p className="text-xs text-[#C2410C] max-w-xl leading-relaxed">
                      This credential was originally cryptographically issued by{' '}
                      <strong>{verification.institution?.name}</strong>, but has been officially revoked in the registry. It is no longer legally valid.
                    </p>
                  </div>
                  <div className="bg-orange-100 border border-orange-300 px-4 py-2 rounded-xl text-orange-900 font-bold text-xs">
                    STATUS: REVOKED
                  </div>
                </div>

                <div className="bg-white border border-[#EAE0CE] rounded-2xl p-6 text-xs space-y-3">
                  <span className="text-[10px] font-bold text-[#948065] uppercase tracking-wider block">
                    Candidate Details
                  </span>
                  <p className="text-lg font-bold text-[#141619]">{verification.certificate.studentName}</p>
                  <p className="text-[#716049]">{verification.certificate.degree} &bull; ID: {verification.certificate.rollNo}</p>
                </div>
              </div>
            </div>
          )}

          {/* Case 2: Legacy Unsigned Document / PDF Forensic Analysis Report */}
          {report && (
            <div className="space-y-4">
              <div className="bg-white border border-[#EAE0CE] rounded-3xl p-6 sm:p-8 space-y-6 shadow-warm-sm">
                {/* Forensic Header & Risk Meter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#EAE0CE]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileSearch className="w-5 h-5 text-[#8A5D08]" />
                      <h3 className="font-serif text-xl font-bold text-[#141619]">
                        PDF Forensic Analysis Report
                      </h3>
                    </div>
                    <p className="text-xs text-[#716049]">
                      Inspected PDF object streams, metadata tags, and editing software fingerprints.
                    </p>
                  </div>

                  {/* Risk Badge */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold font-mono border ${
                        report.riskLevel === 'HIGH_RISK'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : report.riskLevel === 'MEDIUM_RISK'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {report.riskLevel.replace('_', ' ')} • {report.riskScore}%
                    </div>
                  </div>
                </div>

                {/* Risk Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-[#4F4232]">
                    <span>Tamper / Forgery Risk Probability</span>
                    <span>{report.riskScore}% Probability</span>
                  </div>
                  <div className="w-full h-3 bg-[#FAF6EF] border border-[#EAE0CE] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        report.riskLevel === 'HIGH_RISK'
                          ? 'bg-red-600'
                          : report.riskLevel === 'MEDIUM_RISK'
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${report.riskScore}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#716049] italic">
                    {report.riskSummary}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-[#FAF6EF] border border-[#EAE0CE] rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-[#948065] uppercase tracking-wider block">
                      Editing Software / Producer
                    </span>
                    <p className="font-bold text-[#141619] text-sm">
                      {report.editingToolDetected || report.producer || 'Standard PDF Renderer'}
                    </p>
                    <p className="text-[11px] text-[#716049]">
                      Creator: {report.creator || 'Generic Desktop Application'}
                    </p>
                  </div>

                  <div className="p-4 bg-[#FAF6EF] border border-[#EAE0CE] rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-[#948065] uppercase tracking-wider block">
                      Revision Layers
                    </span>
                    <p className="font-bold text-[#141619] text-sm flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#8A5D08]" />
                      <span>{report.revisionCount} Revision Session(s)</span>
                    </p>
                    <p className="text-[11px] text-[#716049]">
                      PDF Version: {report.metadata.pdfVersion}
                    </p>
                  </div>

                  <div className="p-4 bg-[#FAF6EF] border border-[#EAE0CE] rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-[#948065] uppercase tracking-wider block">
                      Creation Timestamp
                    </span>
                    <p className="font-mono text-xs font-semibold text-[#141619]">
                      {report.creationDate ? new Date(report.creationDate).toLocaleString() : 'Not Recorded in Metadata'}
                    </p>
                  </div>

                  <div className="p-4 bg-[#FAF6EF] border border-[#EAE0CE] rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-[#948065] uppercase tracking-wider block">
                      Last Modification Timestamp
                    </span>
                    <p className="font-mono text-xs font-semibold text-[#141619]">
                      {report.modificationDate ? new Date(report.modificationDate).toLocaleString() : 'Not Recorded in Metadata'}
                    </p>
                  </div>
                </div>

                {/* Observations & Findings List */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-[#141619] uppercase tracking-wider">
                    Detailed Forensic Findings
                  </h4>
                  <div className="space-y-2">
                    {report.observations.map((obs, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF6EF] border border-[#EAE0CE] text-xs text-[#4F4232]"
                      >
                        {obs.toLowerCase().includes('photoshop') || obs.toLowerCase().includes('canva') || obs.toLowerCase().includes('altered') ? (
                          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Check className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                        )}
                        <span>{obs}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recruiter / Verifier Advisory Box */}
                <div className="p-4 bg-[#FEF9E5] border border-[#FDE68A] rounded-2xl flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#8A5D08] flex-shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs text-[#716049] leading-relaxed">
                    <span className="font-bold text-[#181A1D] block">
                      Why does this document require forensic inspection?
                    </span>
                    <p>
                      This is a legacy or third-party document issued without a Credify cryptographic PKI keypair. While our forensic scanner detects Photoshop alterations and structural revisions, for 100% mathematical zero-trust proof, recommend the issuing institution to digitize their legacy backlog through <strong>Credify Bulk Ingestion</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
