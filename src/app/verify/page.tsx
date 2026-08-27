'use client';
import { useState, useRef, useCallback } from 'react';
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

  const handleScan = useCallback(async (data: string) => {
    setLoading(true);
    setVerification({ result: 'loading' });
    try {
      const res = await fetch('/api/verify/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: data }),
      });
      const json = await res.json();
      if (!res.ok || !json.result) throw new Error(json.error || 'Verification failed');
      setVerification(json);
    } catch (err) {
      setVerification({ result: 'not_found', error: err instanceof Error ? err.message : 'Invalid QR code' });
    } finally {
      setLoading(false);
    }
  }, []);

  const scanner = useQRScanner({ onScan: handleScan });

  const handleIdVerify = async (idToVerify?: string) => {
    const targetId = (idToVerify || certId).trim();
    if (!targetId) return;
    setLoading(true);
    setVerification({ result: 'loading' });
    try {
      const res = await fetch(`/api/certificates/${targetId}`);
      if (!res.ok) {
        setVerification({ result: 'not_found', error: 'Certificate ID not found in registry.' });
        return;
      }
      const json = await res.json();
      const cert = json.certificate;
      
      const verifyRes = await fetch('/api/verify/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: btoa(JSON.stringify({
            v: 1,
            id: cert.id,
            sig: cert.signature,
            hash: cert.dataHash,
            alg: cert.institution?.algorithm || 'ed25519',
          })),
        }),
      });
      const verifyJson = await verifyRes.json();
      if (!verifyRes.ok || !verifyJson.result) {
        setVerification({ result: 'not_found', error: verifyJson.error || 'Verification failed' });
        return;
      }
      setVerification(verifyJson);
    } catch (err) {
      setVerification({ result: 'not_found', error: err instanceof Error ? err.message : 'Verification request failed' });
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
      const json = await res.json();
      if (!res.ok || !json.result) {
        setVerification({ result: 'not_found', error: json.error || 'Failed to verify PDF document' });
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
              {!scanner.isActive ? (
                <div className="w-full max-w-sm aspect-square bg-[#FAF6EF] rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-[#D5C5AC] p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#FEF9E5] text-[#8A5D08] flex items-center justify-center mb-3">
                    <Camera className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-bold text-[#141619] mb-1">Camera Scanner Ready</h3>
                  <p className="text-xs text-[#716049] mb-5 max-w-xs leading-relaxed">
                    Point your camera at the QR code printed on the physical or digital academic credential.
                  </p>
                  <button
                    onClick={scanner.start}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#181A1D] text-white text-xs font-bold rounded-xl hover:bg-[#282B30] shadow-warm hover:-translate-y-0.5 transition-all"
                  >
                    <Camera className="w-4 h-4 text-[#FEF0C2]" />
                    <span>Launch Camera Scanner</span>
                  </button>
                </div>
              ) : (
                <div className="w-full max-w-sm space-y-3">
                  <div className="w-full aspect-square bg-[#141619] rounded-2xl overflow-hidden relative shadow-warm-lg">
                    <video
                      ref={scanner.videoRef}
                      autoPlay
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Viewfinder Target Frame with Golden Corner Guides */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8">
                      <div className="w-full h-full border-2 border-[#FEF0C2]/80 rounded-xl relative">
                        <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-[#FBC02D] -mt-1 -ml-1 rounded-tl" />
                        <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-[#FBC02D] -mt-1 -mr-1 rounded-tr" />
                        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-[#FBC02D] -mb-1 -ml-1 rounded-bl" />
                        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-[#FBC02D] -mb-1 -mr-1 rounded-br" />
                      </div>
                    </div>
                    <button
                      onClick={scanner.stop}
                      className="absolute top-3 right-3 p-2 bg-black/70 backdrop-blur-sm rounded-xl text-white hover:bg-black transition-colors"
                      title="Close Scanner"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-center text-xs text-[#716049]">
                    Align the QR code within the golden viewfinder guides to verify instantly.
                  </p>
                </div>
              )}

              {scanner.error && (
                <div className="w-full max-w-sm bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3.5 text-center">
                  {scanner.error}
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

          {/* Case 1: Cryptographic Authentic Certificate */}
          {verification.certificate && (
            <div className="space-y-4">
              <CertificateCard
                certificate={{
                  id: verification.certificate.id,
                  studentName: verification.certificate.studentName,
                  rollNo: verification.certificate.rollNo,
                  degree: verification.certificate.degree,
                  cgpa: verification.certificate.cgpa,
                  issueDate: verification.certificate.issueDate,
                  dataHash: verification.dataHash || '',
                  status: verification.certificate.status,
                }}
              />

              {/* Issuing Authority & Cryptographic Breakdown */}
              <div className="bg-white border border-[#EAE0CE] rounded-2xl p-6 space-y-4 shadow-warm-sm">
                <h4 className="text-xs font-bold text-[#141619] uppercase tracking-wider">
                  Cryptographic Authority &amp; Proof
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-[#FAF6EF] rounded-xl border border-[#EAE0CE]">
                    <span className="text-[10px] font-semibold text-[#948065] uppercase tracking-wider block mb-1">
                      Issuing Authority
                    </span>
                    <p className="font-bold text-[#141619]">
                      {verification.institution?.name || 'Verified University'}
                    </p>
                    <p className="text-[11px] font-mono text-[#716049] truncate mt-0.5">
                      ID: {verification.institution?.id}
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#FAF6EF] rounded-xl border border-[#EAE0CE]">
                    <span className="text-[10px] font-semibold text-[#948065] uppercase tracking-wider block mb-1">
                      Signature Primitive
                    </span>
                    <p className="font-mono font-bold text-[#8A5D08]">
                      {verification.algorithm?.toUpperCase() || 'ED25519'}
                    </p>
                    <p className="text-[11px] text-[#716049] mt-0.5">
                      Canonical SHA-256 Digest Validation
                    </p>
                  </div>
                </div>

                {verification.dataHash && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
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
                    <p className="font-mono text-xs text-[#4F4232] bg-[#FAF6EF] border border-[#EAE0CE] rounded-xl px-3.5 py-2 break-all select-all">
                      {verification.dataHash}
                    </p>
                  </div>
                )}
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
