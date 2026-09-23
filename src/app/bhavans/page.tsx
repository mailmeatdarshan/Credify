/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Search,
  Upload,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Loader2,
  X,
  XCircle,
  Award,
  Briefcase,
  GraduationCap,
  Trophy,
  Building,
  Building2,
  FileEdit,
  Scroll,
  Laptop,
  CreditCard,
  BookOpen,
  BookMarked,
  Calendar,
  PenTool,
  Settings,
  Users,
  ClipboardList,
  Image as ImageIcon,
  Newspaper,
  Microscope,
  Mic,
  Star,
} from 'lucide-react';

export default function BhavansCollegePortal() {
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'id'>('upload');
  const [certId, setCertId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [showNoticeModal, setShowNoticeModal] = useState(true);
  const [selectedProgramTab, setSelectedProgramTab] = useState<'aided' | 'sfc' | 'pg' | 'cert'>('aided');
  const [selectedNoticeFilter, setSelectedNoticeFilter] = useState('all');

  // Bhavan's College API key for direct integration
  const API_KEY = 'crdf_live_a56a853dd93d34af2f01decd81e1568c1ff5f534528c081d';

  // Listen for hash changes (e.g. #verify or #verification-portal)
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#verify' || window.location.hash === '#verification-portal') {
        setIsVerificationModalOpen(true);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Handle ESC key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVerificationModalOpen(false);
        setShowNoticeModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleVerifyId = async (idToUse?: string) => {
    const id = (idToUse || certId).trim();
    if (!id) return;
    setLoading(true);
    setVerificationResult(null);

    try {
      const res = await fetch('/api/v1/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      setVerificationResult(data);
    } catch (err) {
      setVerificationResult({
        success: false,
        result: 'error',
        error: err instanceof Error ? err.message : 'Network error during verification',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a valid PDF document (Marksheet, Internship, or Hackathon Certificate).');
      return;
    }
    setFileName(file.name);
    setLoading(true);
    setVerificationResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/v1/verify', {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
        },
        body: formData,
      });
      const data = await res.json();
      setVerificationResult(data);
    } catch (err) {
      setVerificationResult({
        success: false,
        result: 'error',
        error: err instanceof Error ? err.message : 'Upload verification failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const openVerificationModal = () => {
    setIsVerificationModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#121C2A] font-sans antialiased">
      {/* Top Academic Sub-Bar */}
      <div className="w-full bg-[#F3F4F6] text-[#4B5563] border-b border-[#E5E7EB] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-x-auto py-0.5 text-[11px] font-medium">
            <span className="font-bold text-[#801815]">NAAC &lsquo;A&rsquo; Grade</span>
            <span className="text-[#D1D5DB]">|</span>
            <a href="#academics" className="hover:text-[#801815] transition-colors whitespace-nowrap">NIRF</a>
            <span className="text-[#D1D5DB]">|</span>
            <a href="#autonomy" className="hover:text-[#801815] transition-colors whitespace-nowrap">IQAC</a>
            <span className="text-[#D1D5DB]">|</span>
            <a href="#notices" className="hover:text-[#801815] transition-colors whitespace-nowrap">Examinations</a>
            <span className="text-[#D1D5DB]">|</span>
            <a href="#alumni" className="hover:text-[#801815] transition-colors whitespace-nowrap">Alumni</a>
            <span className="text-[#D1D5DB]">|</span>
            <a href="#facilities" className="hover:text-[#801815] transition-colors whitespace-nowrap">Facilities</a>
            <span className="text-[#D1D5DB]">|</span>
            <a href="#programs" className="hover:text-[#801815] transition-colors whitespace-nowrap">NEP 2020</a>
          </div>
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <span className="bg-[#FEF3C7] text-[#B45309] border border-[#B45309]/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              Autonomous Status 2026–36
            </span>
            <Link
              href="/"
              className="text-[#801815] font-bold hover:underline flex items-center gap-1 text-[11px]"
            >
              <span>Credify Engine</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main College Header Banner */}
      <header className="w-full bg-white border-b border-[#E8DFD8] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src="https://lh3.googleusercontent.com/aida/AEtjO1UOwn-8b4kGAJns8lVpVS-ALZEEketVxcejlVtxkWn-xkxHvFMRmK4qBxI0k7VtPxsSU7le0A1uH26OH7poonfEyDa-bCeXzbjsrclO6s5dNbMOHX_5SR9U9ALM__Jx5Ll_i-HCKpDp5i3_tX3dyzfqhj8b2ecXE52ayVCtAvMUCGXKKf-ynoRbcoUwxncJdkMgZzkzDlsFK6vKYVFpmhWzHJYEFcQwGQa-eAI9hF9Z9ChLjrSBckSD6Q"
              alt="Bhavan's College Logo"
              className="h-16 w-auto object-contain flex-shrink-0"
            />
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-bold text-[#801815] uppercase tracking-wider">
                Bharatiya Vidya Bhavan&apos;s
              </span>
              <h1 className="font-serif text-sm sm:text-lg font-bold text-[#121C2A] leading-tight">
                M. M. College Of Arts, N. M. Institute Of Science &amp; Commerce
              </h1>
              <p className="text-xs text-[#801815] font-bold mt-0.5">
                Bhavan&apos;s College <span className="text-[#4B5563] font-normal text-[11px]">(Empowered Autonomous 2026–36)</span>
              </p>
              <p className="text-[10px] text-[#6B7280] hidden sm:block">
                Established 1946 | Re-accredited &ldquo;A&rdquo; Grade by NAAC | Munshi Nagar, Andheri (W), Mumbai – 400058
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-right flex-shrink-0">
            <div className="hidden lg:flex flex-col items-end pr-4 border-r border-[#E5E7EB]">
              <span className="text-[10px] text-[#6B7280] uppercase font-semibold">Affiliated to</span>
              <span className="text-sm font-bold text-[#1E3A8A]">University of Mumbai</span>
            </div>
            <button
              onClick={openVerificationModal}
              className="px-4 py-2 bg-[#801815] hover:bg-[#63100E] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#FEF3C7]" />
              <span>E-Verification Portal</span>
            </button>
          </div>
        </div>

        {/* Maroon Navigation Bar */}
        <div className="w-full bg-[#801815] text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between overflow-x-auto text-xs font-semibold py-1">
            <nav className="flex items-center gap-1">
              <a href="#" className="px-3.5 py-1.5 rounded bg-[#D97706] text-white font-bold">Home</a>
              <a href="#about" className="px-3 py-1.5 rounded hover:bg-[#63100E] text-white/90 transition-colors">About</a>
              <a href="#admissions" className="px-3 py-1.5 rounded hover:bg-[#63100E] text-white/90 transition-colors">Admission</a>
              <a href="#academics" className="px-3 py-1.5 rounded hover:bg-[#63100E] text-white/90 transition-colors">Academics</a>
              <a href="#programs" className="px-3 py-1.5 rounded hover:bg-[#63100E] text-white/90 transition-colors">Programs</a>
              <a href="#autonomy" className="px-3 py-1.5 rounded hover:bg-[#63100E] text-white/90 transition-colors">Autonomy</a>
              <a href="#facilities" className="px-3 py-1.5 rounded hover:bg-[#63100E] text-white/90 transition-colors">Facilities</a>
              <a href="#notices" className="px-3 py-1.5 rounded hover:bg-[#63100E] text-white/90 transition-colors">Notices</a>
              <a href="#alumni" className="px-3 py-1.5 rounded hover:bg-[#63100E] text-white/90 transition-colors">Alumni</a>
              <button
                onClick={openVerificationModal}
                className="px-3.5 py-1.5 rounded bg-white/15 text-[#FEF3C7] hover:bg-white/25 font-bold flex items-center gap-1.5 ml-1 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#FEF3C7]" />
                <span>Verify Credentials</span>
                <span className="w-2 h-2 rounded-full bg-[#86EFAC] animate-ping"></span>
              </button>
            </nav>
            <div className="hidden md:flex items-center gap-2">
              <span className="px-3 py-1 rounded bg-[#B45309] text-white text-[11px] font-bold">Portal Login</span>
            </div>
          </div>
        </div>
      </header>

      {/* Notice Circular Popup Modal */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-[#801815] px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FEF3C7]" />
                <h3 className="font-serif font-bold text-base">Examination &amp; Credential Circulars</h3>
              </div>
              <button
                onClick={() => setShowNoticeModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-[#4B5563] leading-relaxed">
                Direct institutional admission portals for academic session 2026–2027 are open. E-Verification Gateway is live for <strong>Marksheets, Degrees, Internships &amp; Hackathon Awards</strong>.
              </p>
              <div className="flex flex-col gap-2.5 pt-1">
                <button
                  onClick={() => {
                    setShowNoticeModal(false);
                    openVerificationModal();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#801815] hover:bg-[#63100E] text-white text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#FEF3C7]" />
                  <span>Verify Marksheets, Internships &amp; Hackathon Certificates</span>
                </button>
                <a
                  href="#admissions"
                  onClick={() => setShowNoticeModal(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <span>Register on Mastersoft Portal (Admissions 2026–27)</span>
                </a>
              </div>
            </div>
            <div className="bg-[#F9FAFB] px-6 py-3 flex justify-end border-t border-[#E5E7EB]">
              <button
                onClick={() => setShowNoticeModal(false)}
                className="px-4 py-1.5 rounded-lg bg-[#801815] text-white text-xs font-bold hover:bg-[#63100E] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED E-VERIFICATION POPUP MODAL (Triggered only when clicking "Verify Credentials") */}
      {isVerificationModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsVerificationModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#E8DFD8] my-8 animate-in zoom-in-95 duration-200">
            {/* Modal Top Header */}
            <div className="bg-[#801815] text-white px-6 py-4.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm sm:text-base">
                    Bhavan&apos;s College Examination Controller
                  </h4>
                  <p className="text-[11px] text-[#FEF3C7] font-mono">
                    Zero-Knowledge Public Verifier Network &bull; API v1 Connected
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsVerificationModalOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close Verification Portal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Heading & Subtitle */}
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-[#FEF3C7] text-[#B45309] border border-[#B45309]/30 rounded-full text-[11px] font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Marksheets &bull; Degrees &bull; Internships &bull; Hackathons</span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#121C2A]">
                  Student Credential Verification Gateway
                </h3>
                <p className="text-xs text-[#4B5563] max-w-lg mx-auto leading-relaxed">
                  Employers, Companies, Universities &amp; Hackathon Organizers can validate transcripts, internship completion, and competition awards in real time.
                </p>
              </div>

              {/* Tabs */}
              <div className="flex bg-[#F3F4F6] border border-[#E5E7EB] rounded-2xl p-1 gap-1.5">
                <button
                  onClick={() => {
                    setActiveTab('upload');
                    setVerificationResult(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'upload'
                      ? 'bg-white text-[#121C2A] shadow-sm border border-[#E5E7EB]'
                      : 'text-[#4B5563] hover:text-[#121C2A]'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Document (PDF)</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('id');
                    setVerificationResult(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'id'
                      ? 'bg-white text-[#121C2A] shadow-sm border border-[#E5E7EB]'
                      : 'text-[#4B5563] hover:text-[#121C2A]'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Enter Certificate UUID</span>
                </button>
              </div>

              {/* Tab 1: File Upload */}
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <label
                    htmlFor="marksheet-upload"
                    className="block border-2 border-dashed border-[#D1D5DB] hover:border-[#801815] bg-[#F9FAFB] hover:bg-[#FFFBEB] rounded-2xl p-7 text-center cursor-pointer transition-all group"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[#801815]/10 text-[#801815] flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm text-[#121C2A] block">
                      {fileName || 'Drop official student credential (PDF) here'}
                    </span>
                    <span className="text-xs text-[#6B7280] mt-1 block">
                      Supports Marksheets, Degree Certificates, Internship Letters, &amp; Hackathon Awards
                    </span>
                    <input
                      id="marksheet-upload"
                      type="file"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(f);
                      }}
                    />
                  </label>
                </div>
              )}

              {/* Tab 2: ID Search */}
              {activeTab === 'id' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. fac22f5f-0170-460a-881d-9d315eaa9b28"
                      value={certId}
                      onChange={(e) => setCertId(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm font-mono text-[#121C2A] focus:bg-white focus:ring-2 focus:ring-[#801815] outline-none"
                    />
                    <button
                      onClick={() => handleVerifyId()}
                      disabled={loading || !certId.trim()}
                      className="px-5 py-2.5 bg-[#801815] hover:bg-[#63100E] disabled:bg-gray-300 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      Verify
                    </button>
                  </div>
                  <p className="text-[11px] text-[#6B7280]">
                    Enter the unique cryptographic identifier printed at the footer of the marksheet, internship letter, or hackathon certificate.
                  </p>
                </div>
              )}

              {/* Loading Indicator */}
              {loading && (
                <div className="py-6 text-center space-y-2">
                  <Loader2 className="w-6 h-6 text-[#801815] animate-spin mx-auto" />
                  <p className="text-xs font-bold text-[#121C2A]">
                    Querying PKI Root Authority &amp; Validating Mathematical Signature...
                  </p>
                </div>
              )}

              {/* Live Verification Result Box */}
              {verificationResult && (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  {/* CASE A: Authentic Record */}
                  {verificationResult.result === 'authentic' && (
                    <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-2xl p-5 space-y-3.5 shadow-xs text-[#14532D]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-[#BBF7D0] gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-[#15803D] flex-shrink-0" />
                          <div>
                            <h5 className="text-xs sm:text-sm font-extrabold text-[#14532D] uppercase tracking-wide">
                              100% Authentic &amp; Cryptographically Validated
                            </h5>
                            <span className="text-[10px] text-[#166534]">
                              Verified with Bhavan&apos;s College Root Public Key (Ed25519)
                            </span>
                          </div>
                        </div>
                        <span className="bg-[#DCFCE7] border border-[#86EFAC] text-[#15803D] font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full w-fit">
                          {verificationResult.certificateType === 'internship'
                            ? 'INTERNSHIP VERIFIED'
                            : verificationResult.certificateType === 'hackathon'
                            ? 'HACKATHON AWARD VERIFIED'
                            : 'DEGREE / MARKSHEET VERIFIED'}
                        </span>
                      </div>

                      {/* Dynamic Record Grid based on type */}
                      {verificationResult.certificateType === 'internship' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="bg-white/80 p-3 rounded-xl border border-[#BBF7D0]">
                            <span className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider block">Student Name</span>
                            <strong className="text-xs sm:text-sm text-[#14532D] mt-0.5 block">
                              {verificationResult.certificate?.studentName}
                            </strong>
                          </div>
                          <div className="bg-white/80 p-3 rounded-xl border border-[#BBF7D0]">
                            <span className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider block">Roll / Enrollment No</span>
                            <strong className="text-xs sm:text-sm font-mono text-[#14532D] mt-0.5 block">
                              {verificationResult.certificate?.rollNo}
                            </strong>
                          </div>
                          <div className="bg-white/80 p-3 rounded-xl border border-[#BBF7D0] sm:col-span-2">
                            <span className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider block">Internship Role / Title</span>
                            <span className="font-semibold text-xs text-[#14532D] mt-0.5 block">
                              {verificationResult.certificate?.role || verificationResult.certificate?.degree}
                            </span>
                          </div>
                          <div className="bg-white/80 p-3 rounded-xl border border-[#BBF7D0]">
                            <span className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider block">Performance Rating</span>
                            <strong className="text-sm sm:text-base text-[#15803D] mt-0.5 block">
                              {verificationResult.certificate?.grade || `${verificationResult.certificate?.cgpa} / 10.0`}
                            </strong>
                          </div>
                          <div className="bg-white/80 p-3 rounded-xl border border-[#BBF7D0]">
                            <span className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider block">Internship Duration</span>
                            <span className="font-mono text-xs text-[#14532D] mt-0.5 block">
                              {verificationResult.certificate?.duration || (verificationResult.certificate?.issueDate ? `Issued: ${verificationResult.certificate.issueDate.split('T')[0]}` : 'Active Record')}
                            </span>
                          </div>
                        </div>
                      ) : verificationResult.certificateType === 'hackathon' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="bg-white/80 p-3 rounded-xl border border-[#BBF7D0]">
                            <span className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider block">Winner Candidate</span>
                            <strong className="text-xs sm:text-sm text-[#14532D] mt-0.5 block">
                              {verificationResult.certificate?.studentName}
                            </strong>
                          </div>
                          <div className="bg-white/80 p-3 rounded-xl border border-[#BBF7D0]">
                            <span className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider block">Team &amp; Roll No</span>
                            <strong className="text-xs sm:text-sm font-mono text-[#14532D] mt-0.5 block">
                              {verificationResult.certificate?.teamName || verificationResult.certificate?.rollNo} {verificationResult.certificate?.teamName && verificationResult.certificate?.rollNo ? `(${verificationResult.certificate?.rollNo})` : ''}
                            </strong>
                          </div>
                          <div className="bg-white/80 p-3 rounded-xl border border-[#BBF7D0] sm:col-span-2">
                            <span className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider block">Hackathon Event &amp; Track</span>
                            <span className="font-semibold text-xs text-[#14532D] mt-0.5 block">
                              {verificationResult.certificate?.event || "National Hackathon"} &bull; {verificationResult.certificate?.track || verificationResult.certificate?.degree}
                            </span>
                          </div>
                          <div className="bg-white/80 p-3 rounded-xl border border-[#BBF7D0]">
                            <span className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider block">Award Position</span>
                            <strong className="text-sm sm:text-base text-[#15803D] mt-0.5 block">
                              {verificationResult.certificate?.position || 'Distinction Awardee'}
                            </strong>
                          </div>
                          <div className="bg-white/80 p-3 rounded-xl border border-[#BBF7D0]">
                            <span className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider block">Prize / Grant</span>
                            <span className="font-mono text-xs text-[#14532D] mt-0.5 block">
                              {verificationResult.certificate?.prize || 'Certificate of Merit'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="bg-white/80 p-3 rounded-xl border border-[#BBF7D0]">
                            <span className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider block">Candidate Name</span>
                            <strong className="text-xs sm:text-sm text-[#14532D] mt-0.5 block">
                              {verificationResult.certificate?.studentName}
                            </strong>
                          </div>
                          <div className="bg-white/80 p-3 rounded-xl border border-[#BBF7D0]">
                            <span className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider block">Roll / Enrollment No</span>
                            <strong className="text-xs sm:text-sm font-mono text-[#14532D] mt-0.5 block">
                              {verificationResult.certificate?.rollNo}
                            </strong>
                          </div>
                          <div className="bg-white/80 p-3 rounded-xl border border-[#BBF7D0] sm:col-span-2">
                            <span className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider block">Degree / Award Program</span>
                            <span className="font-semibold text-xs text-[#14532D] mt-0.5 block">
                              {verificationResult.certificate?.degree}
                            </span>
                          </div>
                          <div className="bg-white/80 p-3 rounded-xl border border-[#BBF7D0]">
                            <span className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider block">Cumulative GPA</span>
                            <strong className="text-sm sm:text-base text-[#15803D] mt-0.5 block">
                              {verificationResult.certificate?.cgpa} / 10.0
                            </strong>
                          </div>
                          <div className="bg-white/80 p-3 rounded-xl border border-[#BBF7D0]">
                            <span className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider block">Date of Issue</span>
                            <span className="font-mono text-xs text-[#14532D] mt-0.5 block">
                              {verificationResult.certificate?.issueDate ? verificationResult.certificate.issueDate.split('T')[0] : 'Official Record'}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="pt-2 text-[10px] font-mono text-[#15803D] border-t border-[#BBF7D0]/60 flex items-center justify-between">
                        <span>SHA-256 Digest: {verificationResult.dataHash?.substring(0, 24)}...</span>
                        <span>Status: REGISTERED_ACTIVE</span>
                      </div>
                    </div>
                  )}

                  {/* CASE B: Tampered / Forged Record */}
                  {verificationResult.result === 'tampered' && (
                    <div className="bg-[#FEF2F2] border border-[#F87171] rounded-2xl p-5 space-y-3.5 shadow-xs text-[#991B1B]">
                      <div className="flex items-center gap-2 pb-2.5 border-b border-[#FECACA]">
                        <AlertTriangle className="w-5 h-5 text-[#DC2626] flex-shrink-0" />
                        <div>
                          <h5 className="text-xs sm:text-sm font-extrabold text-[#991B1B] uppercase tracking-wide">
                            Fraudulent / Tampered Document Alert
                          </h5>
                          <span className="text-[10px] text-[#B91C1C]">
                            Cryptographic Signature Mismatch &bull; Text Modified After Issuance
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-[#7F1D1D] leading-relaxed">
                        {verificationResult.tamperDetails?.reason ||
                          'The digital signature does not match the parameters extracted from this document. This indicates unauthorized grade manipulation, internship claim forgery, or student identity fraud.'}
                      </p>

                      <div className="bg-white/80 p-2.5 rounded-xl border border-[#FECACA] font-mono text-[10px] sm:text-[11px] text-[#991B1B]">
                        <strong>Security Verdict:</strong> REJECTED — Forged credential reported to Examination Controller.
                      </div>
                    </div>
                  )}

                  {/* CASE C: Not Found */}
                  {verificationResult.result === 'not_found' && (
                    <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-4 text-[#991B1B] text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                        <XCircle className="w-4 h-4 text-[#991B1B]" />
                        <span>No Record Found</span>
                      </div>
                      <p>No credential (marksheet, degree, internship, or hackathon award) matching this identifier has been issued by Bhavan&apos;s College.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#F9FAFB] border-t border-[#E5E7EB] px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#6B7280] gap-2">
              <span>Powered by <strong>Credify Zero-Trust PKI API</strong></span>
              <div className="flex items-center gap-3">
                <span>API Key: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#E5E7EB]">crdf_live_a56a853...</code></span>
                <button
                  onClick={() => setIsVerificationModalOpen(false)}
                  className="px-3 py-1 rounded-lg bg-[#801815] text-white text-xs font-bold hover:bg-[#63100E] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: HERO CAMPUS SCENIC BANNER */}
      <section className="relative w-full overflow-hidden bg-[#27313F]">
        <div
          className="relative w-full h-[440px] md:h-[500px] bg-cover bg-center"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDKOTAJOvxeSa0SpO1uz-FjmzhpI7KvyMJkTu_qU22Q4ctXeklocE3GPEPQMRZbliJAikWCEnpf4WslcMOKNu5wcboGHSMIG9-osvHQO28I5N8DEwWr3JOL8PnH7GZABn2TkqEN-GqPVPnbYPRAT5MvwbbUY2CwjKt4YwCqm5636ep6b6xpOo8uJ9EoS5lgDfOglWeCPvTRN9bacpMUICMFkdjHo4V6EdRKUmFlIBbzeT4kXV7bs4E')`,
          }}
        >
          {/* Dark scrim gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141619] via-[#141619]/50 to-black/30"></div>

          {/* Overlay Content */}
          <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 flex flex-col justify-end pb-24 md:pb-28">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF3C7]/90 backdrop-blur-xs text-[#B45309] text-xs uppercase tracking-wider font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#B45309]" />
                <span>UGC Autonomous Status 2026–36 &bull; NAAC &lsquo;A&rsquo; Grade</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-white font-extrabold tracking-tight drop-shadow-md">
                Empowering Minds, Preserving Heritage Since 1946
              </h2>
              <p className="text-xs sm:text-sm text-white/90 max-w-2xl leading-relaxed drop-shadow">
                Spread across a serene 45-acre green botanical campus in the heart of Mumbai, imparting comprehensive education in Arts, Science, and Commerce.
              </p>
            </div>
          </div>
        </div>

        {/* Floating Admissions 2026-2027 Access Deck */}
        <div id="admissions" className="max-w-6xl mx-auto px-4 sm:px-6 -mt-16 relative z-20">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-[#E8DFD8]">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 gap-4 border-b border-[#E5E7EB]">
              <div>
                <span className="text-xs font-bold text-[#B45309] uppercase tracking-wider">Admissions Desk</span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#801815]">Academic Session 2026–2027</h3>
                <p className="text-xs text-[#6B7280]">Select your degree stage below to register online or review cut-off circulars.</p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  className="px-4 py-2 rounded-xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>Mastersoft Portal</span>
                </a>
                <a
                  href="#"
                  className="px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0284C7]/90 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>e-Samarth Portal</span>
                </a>
              </div>
            </div>

            {/* Admission Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-6">
              {[
                { code: 'FY', title: 'UG First Year', sub: 'Degree Entry' },
                { code: 'SY', title: 'UG Second Year', sub: 'Sem III / IV' },
                { code: 'TY', title: 'UG Third Year', sub: 'Sem V / VI' },
                { code: 'PG 1', title: 'PG Part I', sub: "Master's Entry", color: 'text-[#1E3A8A]' },
                { code: 'PG 2', title: 'PG Part II', sub: 'Final Degree', color: 'text-[#1E3A8A]' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#F3F4F6] hover:bg-[#E6EEFF] transition-all text-center cursor-pointer group"
                >
                  <span className={`font-serif text-xl font-bold ${item.color || 'text-[#801815]'} group-hover:text-[#B45309] transition-colors`}>
                    {item.code}
                  </span>
                  <span className="text-xs font-semibold text-[#121C2A] mt-1">{item.title}</span>
                  <span className="text-[11px] text-[#6B7280]">{item.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ACADEMICS QUICK ICON DIRECTORY */}
      <section id="academics" className="w-full py-16 bg-[#FBFBF9] border-t border-[#E8DFD8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#B45309] uppercase tracking-wider">Essential Resources</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#801815]">Academics &amp; Curriculum</h2>
            <p className="text-xs text-[#4B5563] mt-1">Comprehensive quick links for students, faculty, and research candidates.</p>
          </div>

          {/* Icon Cards Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-y-8 gap-x-4">
            {[
              { title: 'New Course Details', icon: FileEdit },
              { title: 'UG Program', icon: GraduationCap },
              { title: 'PG Program', icon: Scroll },
              { title: 'SFC Program', icon: Laptop },
              { title: 'Certificate Courses', icon: Award },
              { title: 'Fee Structure', icon: CreditCard },
              { title: 'Prospectus', icon: BookOpen },
              { title: 'Syllabus', icon: BookMarked },
              { title: 'Time Table', icon: Calendar },
              { title: 'Examination', icon: PenTool },
              { title: 'Verify Credentials', icon: ShieldCheck, isVerify: true },
              { title: 'NEP 2020', icon: Settings },
              { title: 'Freeships & Scholarships', icon: Users },
              { title: 'College Policies & Manuals', icon: ClipboardList },
            ].map((item, idx) => {
              const Icon = item.icon;
              return item.isVerify ? (
                <button
                  key={idx}
                  onClick={openVerificationModal}
                  className="flex flex-col items-center text-center group p-2 transition-transform hover:-translate-y-1 cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-full bg-[#B45309] group-hover:bg-[#801815] flex items-center justify-center text-white shadow-md transition-all group-hover:scale-105 ring-2 ring-[#FEF3C7]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-[#801815] mt-2.5 transition-colors leading-tight">
                    {item.title}
                  </span>
                </button>
              ) : (
                <a
                  key={idx}
                  href="#programs"
                  className="flex flex-col items-center text-center group p-2 transition-transform hover:-translate-y-1"
                >
                  <div className="w-14 h-14 rounded-full bg-[#801815] group-hover:bg-[#63100E] flex items-center justify-center text-white shadow-md transition-all group-hover:scale-105">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-[#121C2A] mt-2.5 group-hover:text-[#801815] transition-colors leading-tight">
                    {item.title}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: TRI-COLUMN INFORMATION HUB (AUTONOMY, POSTERS, NEWS & NOTICES) */}
      <section id="autonomy" className="w-full py-16 bg-[#F8F9FF] border-t border-[#E8DFD8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Column 1: Autonomy Hub */}
            <div className="lg:col-span-3 bg-[#FEF3C7] rounded-2xl p-6 shadow-md flex flex-col justify-between border border-[#FDE68A]">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-[#801815]" />
                  <h3 className="font-serif text-lg font-bold text-[#121C2A]">Autonomy</h3>
                </div>
                <p className="text-xs text-[#4B5563] mb-4">
                  Statutory bodies exercising empowered autonomous authority for curriculum reform.
                </p>
                <ul className="space-y-2.5 text-xs font-semibold">
                  {[
                    'Governing Body',
                    'Academic Council',
                    'Finance Committee',
                    'Board of Studies',
                    'GR and Circulars',
                    'Progress Reports',
                    'Non Statutory Committees',
                  ].map((item, idx) => (
                    <li key={idx}>
                      <a href="#" className="flex items-center gap-2 text-[#121C2A] hover:text-[#801815] transition-colors group">
                        <ChevronRight className="w-3.5 h-3.5 text-[#B45309] group-hover:translate-x-1 transition-transform" />
                        <span>{item}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8 pt-4 bg-[#FEF3C7]/80 rounded-xl p-3 border border-[#B45309]/20">
                <span className="text-[10px] uppercase tracking-wider text-[#B45309] font-bold block">Tenure Approved</span>
                <span className="text-xs font-bold text-[#121C2A]">UGC Empowered 2026–2036</span>
              </div>
            </div>

            {/* Column 2: Departmental Posters & Events */}
            <div className="lg:col-span-4 bg-[#FBFBF9] rounded-2xl p-6 shadow-md flex flex-col border border-[#E8DFD8]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#801815]" />
                  <h3 className="font-serif text-lg font-bold text-[#801815]">Events &amp; Posters</h3>
                </div>
                <span className="text-[11px] text-[#6B7280]">Featured</span>
              </div>
              <div className="relative w-full rounded-xl overflow-hidden bg-[#27313F] group flex-grow min-h-[360px] shadow-sm">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3_TmuOkTUHY0sZiZBYOGy1ESRSDdrHefQQ2fljZw6yWbPMuni2wGyq0HMK0ijfNWWqWeGv2XQwyq2YIwD--iz37rEc8LWJM5Fqiao6xjywN0C4SfjUSEXbG6uGnPtisHOXE_ts-r7N9fc80L50YPs7Fnr_8qvIW19Nie9IRB_AexkYKm9MdVoYH9hH8i1vzE9MpcF5SBoE7oGN2Rq7SDLKQIf8rWlQqvwikjA_LphqYFQk-1ytk4"
                  alt="Rotaract Health Camp Poster"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-5 flex flex-col justify-end text-white">
                  <span className="bg-[#D97706] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase w-fit mb-2">Campus Clinic</span>
                  <h4 className="font-serif text-sm font-bold text-white leading-snug">Free Health Camp &amp; Checkup</h4>
                  <p className="text-[11px] text-white/80 mt-1">In collaboration with Nanavati Hospital &bull; Rotaract Club</p>
                  <div className="flex items-center gap-2 mt-3 pt-2 text-[10px] text-[#FEF3C7] border-t border-white/20">
                    <span>Active This Month</span>
                    <span>&bull;</span>
                    <span>SPCE Hall</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: News & Official Notices Feed */}
            <div id="notices" className="lg:col-span-5 bg-[#801815] text-white rounded-2xl p-6 shadow-md flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-white" />
                  <h3 className="font-serif text-lg font-bold text-white">News &amp; Notices</h3>
                </div>
                <select
                  value={selectedNoticeFilter}
                  onChange={(e) => setSelectedNoticeFilter(e.target.value)}
                  className="bg-[#63100E] text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg cursor-pointer outline-none border border-white/20"
                >
                  <option value="all">All News</option>
                  <option value="exams">Exams &amp; ATKT</option>
                  <option value="placement">Placement &amp; Jobs</option>
                  <option value="research">R&amp;DC Circulars</option>
                </select>
              </div>

              {/* Notice List */}
              <div className="space-y-3 flex-grow overflow-y-auto max-h-[350px] pr-1">
                {[
                  {
                    title: 'Placement Cell Notice for AI Training Program 2026-2027',
                    dept: 'Training & Corporate Placement Wing',
                    isNew: true,
                  },
                  {
                    title: 'B.Sc. Computer Science ATKT Practical CIA Exam Schedule (Sem-2, 4, 6)',
                    dept: 'Department of Computer Science • Examination Cell',
                    isNew: true,
                  },
                  {
                    title: 'Examination Time-Table ATKT — September – October 2026',
                    dept: 'Autonomous Degree College Exam Authority',
                    isNew: true,
                  },
                  {
                    title: 'R&DC Notice regarding Invitation of Ph.D. Research Applications',
                    dept: 'Research & Development Committee',
                    isNew: true,
                  },
                  {
                    title: 'Times of India READING CLUB Registration Open for All Semesters',
                    dept: 'Central Library Initiative',
                    isNew: true,
                  },
                ].map((notice, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#63100E]/70 hover:bg-[#63100E] transition-all">
                    <div className="flex items-start gap-2">
                      {notice.isNew && (
                        <span className="px-1.5 py-0.5 rounded bg-[#D97706] text-white font-bold text-[9px] uppercase tracking-wide flex-shrink-0">
                          NEW
                        </span>
                      )}
                      <a href="#" className="text-xs font-semibold text-white hover:text-[#FEF3C7] transition-colors leading-snug">
                        {notice.title}
                      </a>
                    </div>
                    <span className="text-[10px] text-[#FEF3C7]/75 block mt-1 pl-6">{notice.dept}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-white/15 mt-3 text-xs">
                <span className="text-[11px] text-[#FEF3C7]/80">Showing 5 latest updates</span>
                <a href="#notices" className="text-[#FEF3C7] hover:underline font-bold flex items-center gap-1 text-xs">
                  <span>View All Notices</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: FACILITIES & WORLD-CLASS INFRASTRUCTURE */}
      <section id="facilities" className="w-full py-16 bg-[#FBFBF9] border-t border-[#E8DFD8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#B45309] uppercase tracking-wider">World-Class Infrastructure</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#801815]">Facilities &amp; Resources</h2>
            <p className="text-xs text-[#4B5563] mt-1">
              Nurturing holistic development with expansive laboratories, sporting arenas, and state-of-the-art learning hubs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                title: 'Laboratories',
                desc: '35 well-designed and fully equipped specialized laboratories for biotechnology, physics, and chemistry.',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBODW_sSTwU6LwbmvDPLTqrHMdkR-GWw1sztAFW1bUD4RTmacnMFe4Kz5NiPCo5msm6weV2O0q0Xtf1NQHN8x7-7aokYtmpSMYmIyshSyaOcmcqtmwpIdwJ5tyN-TABgrX5ObmdwYKjh17TrSIWcD_5ddU7CQd2nbbA_kh8ILQlb-ICNIe1DV_wm3NI3JiwhqQ-zQOJ8dFvkRs0dmUB10ZN_8_KNKHjxc3RsMwEtfxkbw_RPu6OXO4',
              },
              {
                title: 'Physical Education',
                desc: 'Adequate infrastructural facilities for field sports, team athletics, yoga, and collegiate tournaments.',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB86jbEJGXhgDlIt3509tVNQOPsA4Fz_Ik9uulAyped7p8cgcvq-deq8rxmAsag_Iw3dkEcvvDC8XoOPosGW22WyugtDJ2rsPrf425XPAcEppQDgBu-eOxKdJrp4D7oRkoNgaSiW3DDDxMPqitoJ3-BecYtlp5o6gqvuOCJ_x5lfSGX94eZ5pv_gRHDnX-SY7CccI22L-LfJYxqBTzaCNBYD4ji26APotDneck-JE97tFKqowfR_h0',
              },
              {
                title: 'Seminar Hall',
                desc: 'Air-conditioned hall equipped with advanced ICT projection facilities to conduct symposia and guest lectures.',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTattjaKdGxTvDIDKh1j0oUI8n_Ad2SuLpzZiEEsDGN2sr2gvBTTesYmQzC77OyIvcVZw-cQXNt0hXBObtDtTDAIiyIXhzZlOMMdkd8MqbVpGav5MzP4Osf_Tg4bPykTQNFI8AeUPIAXWH4OPoia6K3Vw5oPWD8GmzutHsQSaybT44fpIooX0zTkkkEue7M--i_eyk3JoDBmF2G-7fyzO_oaqFtmYKgBLWyuN5XTK0yTjPqINowYQ',
              },
              {
                title: 'Central Library',
                desc: 'Over 100,000 reference volumes, rare manuscripts, research journals, and full access to INFLIBNET N-LIST.',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAI7cFeso__WRyCkfB57B6_3Zmsg9H71DfrLs2ZTCLrEMu3tFr_u0T641v3IkwDOO6UIIYcE2XzkMfxyL0qQSQkps3X9ZZy--Sk4_mkAPiU6GzqvR9FIT3JiCl-Xl1t-gduYIitpzNIjxqZ_x3MDte2b22pJ0HHlzgEs0GxVlWs9Ll1nEgr8MA_sBNKdjjklejiqf9eqlP6X_fT0qXGPc2lhLZUX-va9E21gQcdGojYczesNe75dQ',
              },
            ].map((facility, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl overflow-hidden shadow-md flex flex-col group hover:-translate-y-1 transition-all border border-[#E8DFD8]"
              >
                <div className="h-40 w-full overflow-hidden relative">
                  <img
                    src={facility.img}
                    alt={facility.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#801815]"></div>
                </div>
                <div className="p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#801815]">{facility.title}</h3>
                    <p className="text-xs text-[#4B5563] mt-2 line-clamp-3 leading-relaxed">{facility.desc}</p>
                  </div>
                  <a
                    href="#facilities"
                    className="inline-flex items-center gap-1 text-[#801815] text-xs font-bold mt-4 hover:text-[#B45309] transition-colors"
                  >
                    <span>Read More</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: PROUD FACTS & KEY INSTITUTIONAL METRICS */}
      <section className="w-full py-16 bg-[#F3F4F6] border-t border-[#E8DFD8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#801815] uppercase tracking-wider">Legacy &amp; Milestones</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#801815]">Proud Facts</h2>
            <p className="text-xs text-[#4B5563] mt-1">Measurable scholastic distinctions spanning research and governance.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {[
              { num: '26', label: 'Departments', sub: 'Arts, Sci & Comm', icon: Building },
              { num: '18', label: 'Associations', sub: 'Student Guilds', icon: Users },
              { num: '135+', label: 'Research Papers', sub: 'Peer-reviewed', icon: Microscope },
              { num: '14', label: 'Conferences', sub: 'National Symposia', icon: Mic },
              { num: '‘A’', label: 'NAAC Grade', sub: 'Institutional Honor', icon: Award },
              { num: 'DBT', label: 'STAR College', sub: 'Central Grants Award', icon: Star },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-[#E5E7EB]"
                >
                  <div className="w-12 h-12 rounded-full bg-[#FEF3C7] text-[#B45309] flex items-center justify-center mb-2">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-serif text-2xl font-black text-[#801815]">{stat.num}</span>
                  <span className="text-xs font-bold text-[#121C2A] mt-1">{stat.label}</span>
                  <span className="text-[10px] text-[#6B7280]">{stat.sub}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 6: TABBED PROGRAMS & OFFERINGS */}
      <section id="programs" className="w-full py-16 bg-white border-t border-[#E8DFD8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#B45309] uppercase tracking-wider">Curricular Architecture</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#801815]">Programs &amp; Offerings</h2>
            <p className="text-xs text-[#4B5563] mt-1">Undergraduate, post-graduate, self-financed and certified disciplines.</p>
          </div>

          <div className="bg-[#FBFBF9] rounded-2xl shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[440px] border border-[#E8DFD8]">
            {/* Side Tabs */}
            <div className="lg:col-span-3 bg-[#801815] p-5 text-white flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-[#FEF3C7] font-bold block mb-3">Academic Streams</span>
                {[
                  { id: 'aided', label: 'Aided UG Programs' },
                  { id: 'sfc', label: 'SFC UG Programs' },
                  { id: 'pg', label: 'PG Programs' },
                  { id: 'cert', label: 'Certificate Courses' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedProgramTab(tab.id as any)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      selectedProgramTab === tab.id
                        ? 'bg-[#B45309] text-white shadow-sm'
                        : 'hover:bg-[#63100E] text-white/90'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ))}
              </div>
              <div className="pt-6 mt-6 border-t border-white/10 text-xs text-white/80">
                <span>Eligibility questions?</span>
                <a href="#admissions" className="font-bold text-[#FEF3C7] hover:underline block mt-1">
                  Download Prospectus &rarr;
                </a>
              </div>
            </div>

            {/* Tab Content Area */}
            <div className="lg:col-span-9 p-6 lg:p-8 flex flex-col justify-between">
              {/* Tab 1: Aided UG */}
              {selectedProgramTab === 'aided' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#801815]">Aided UG Programs (Government Recognized)</h3>
                    <p className="text-xs text-[#4B5563] mt-1">Conducted under standard University of Mumbai fee structures.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
                      <span className="font-serif text-sm font-bold text-[#801815] block mb-2">B.A. (Arts)</span>
                      <ul className="space-y-1 text-xs text-[#4B5563]">
                        <li>&bull; B.A. Economics</li>
                        <li>&bull; B.A. English</li>
                        <li>&bull; B.A. History</li>
                        <li>&bull; B.A. Psychology</li>
                        <li>&bull; B.A. Philosophy</li>
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
                      <span className="font-serif text-sm font-bold text-[#801815] block mb-2">B.Com. (Commerce)</span>
                      <ul className="space-y-1 text-xs text-[#4B5563]">
                        <li>&bull; B.Com. Accountancy</li>
                        <li>&bull; B.Com. Commerce</li>
                        <li>&bull; Business Economics</li>
                        <li>&bull; Financial Accounting</li>
                        <li>&bull; Auditing &amp; Taxation</li>
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
                      <span className="font-serif text-sm font-bold text-[#801815] block mb-2">B.Sc. (Science)</span>
                      <ul className="space-y-1 text-xs text-[#4B5563]">
                        <li>&bull; B.Sc. Chemistry</li>
                        <li>&bull; B.Sc. Physics</li>
                        <li>&bull; B.Sc. Mathematics</li>
                        <li>&bull; B.Sc. Botany</li>
                        <li>&bull; B.Sc. Microbiology</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: SFC UG */}
              {selectedProgramTab === 'sfc' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#801815]">Self-Financed Courses (SFC UG Programs)</h3>
                    <p className="text-xs text-[#4B5563] mt-1">Specialized career-focused professional programs.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
                      <span className="font-serif text-sm font-bold text-[#801815] block mb-2">Management &amp; Media</span>
                      <ul className="space-y-1 text-xs text-[#4B5563]">
                        <li>&bull; B.M.S. Management</li>
                        <li>&bull; B.A.F. Accounting &amp; Finance</li>
                        <li>&bull; B.A.M.M.C. Mass Media</li>
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
                      <span className="font-serif text-sm font-bold text-[#801815] block mb-2">Applied Computing</span>
                      <ul className="space-y-1 text-xs text-[#4B5563]">
                        <li>&bull; B.Sc. Computer Science</li>
                        <li>&bull; B.Sc. Information Tech (IT)</li>
                        <li>&bull; B.Sc. Data Science &amp; AI</li>
                        <li>&bull; B.Sc. Biotechnology</li>
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
                      <span className="font-serif text-sm font-bold text-[#801815] block mb-2">Health Sciences</span>
                      <ul className="space-y-1 text-xs text-[#4B5563]">
                        <li>&bull; B.Sc. Medical Lab Tech (MLT)</li>
                        <li>&bull; B.Sc. Medical Imaging (MIT)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: PG */}
              {selectedProgramTab === 'pg' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#801815]">Post Graduate Degree Programs (M.Sc. &amp; M.A.)</h3>
                    <p className="text-xs text-[#4B5563] mt-1">Advanced master-level curriculum and research centers.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
                      <span className="font-serif text-sm font-bold text-[#801815] block mb-2">PG Science Disciplines</span>
                      <ul className="space-y-1 text-xs text-[#4B5563]">
                        <li>&bull; M.Sc. Chemistry (Organic / Analytical)</li>
                        <li>&bull; M.Sc. Physics (Electronics)</li>
                        <li>&bull; M.Sc. Microbiology &amp; Botany</li>
                        <li>&bull; M.Sc. Biodiversity &amp; Wildlife</li>
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
                      <span className="font-serif text-sm font-bold text-[#801815] block mb-2">PG Humanities &amp; Commerce</span>
                      <ul className="space-y-1 text-xs text-[#4B5563]">
                        <li>&bull; M.A. Economics &amp; Psychology</li>
                        <li>&bull; M.A. English Literature</li>
                        <li>&bull; M.Com. Advanced Accountancy</li>
                        <li>&bull; Ph.D. Research Centers across 6 streams</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Certificate */}
              {selectedProgramTab === 'cert' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#801815]">Skill-Based Add-On Certificate Courses</h3>
                    <p className="text-xs text-[#4B5563] mt-1">Short-term industry and technical micro-credentials.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {[
                      { name: 'Vedic Mathematics Certification', dept: 'Dept. of Maths' },
                      { name: 'React JS & Modern Web Stack', dept: 'Dept. of B.Sc IT' },
                      { name: 'Digital Skills for Historical Research', dept: 'Dept. of History' },
                      { name: 'Fundamentals of Soil Analysis', dept: 'Dept. of Botany' },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white p-3.5 rounded-xl border border-[#E5E7EB] shadow-xs flex items-center justify-between">
                        <span className="font-semibold text-[#121C2A]">{item.name}</span>
                        <span className="text-[10px] font-bold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded-full">{item.dept}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6 mt-6 border-t border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-xs text-[#6B7280]">Admissions open as per Mumbai University Autonomous norms.</span>
                <a
                  href="#admissions"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#801815] hover:bg-[#63100E] text-white text-xs font-bold transition-colors shadow-sm"
                >
                  <span>View Admission Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: LIFE AT BHAVAN'S & EMINENT ALUMNI */}
      <section id="alumni" className="w-full py-16 bg-[#F8F9FF] border-t border-[#E8DFD8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          {/* Dynamic Campus Culture */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="relative w-full h-[340px] rounded-2xl overflow-hidden shadow-lg group">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4BZiBjIVdKOJ8IfhndHGUvi7CAZH-KcHXEtLSBe1kBXX1Xw-2KVQpwRlCypprykHz35JXHMOyCRw2Hn18ejWxzJB3eGHRM1PYOVbnzZFd72q41kqyMiw3HTGyq7QO6poyRB8JRn6wMZ4Bkz6RgkxYHprsFnn-AduY0JpZ8qlmRXOWGAwwv79D3KdPN1A0rZNRTqc69Fe3JnswmOFeNrgIDifdm_bYPzWUiVp_gNw6kvKCDDahp3w"
                  alt="Sports & Campus Life at Bhavans"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-end text-white">
                  <span className="px-2.5 py-1 rounded bg-[#B45309] text-white text-[10px] font-bold uppercase w-fit mb-1">
                    Campus Life
                  </span>
                  <h3 className="font-serif text-lg font-bold text-white">Sports, Fests &amp; Unbounded Energy</h3>
                  <p className="text-xs text-white/80">From annual sports meets to historic inter-collegiate cultural carnivals.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#801815] text-white rounded-2xl p-7 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-[#FEF3C7]" />
                <h3 className="font-serif text-xl font-bold text-white">Life At Bhavan&apos;s</h3>
              </div>
              <p className="text-xs text-white/80 mb-6 leading-relaxed">
                Experience an enriching student ecosystem balancing scholastic discipline with cultural celebrations.
              </p>
              <ul className="space-y-2.5 text-xs font-semibold">
                {[
                  'College Events & Festivals',
                  'Support & Mentorship Programs',
                  'Extra-Curricular Activities',
                  'Co-Curricular Activities & Clubs',
                  'Student Committees & Councils',
                  'Welfare Measures & Counselling',
                ].map((item, idx) => (
                  <li key={idx}>
                    <a href="#" className="flex items-center justify-between p-3 rounded-xl bg-[#63100E]/70 hover:bg-[#63100E] transition-all group">
                      <span className="group-hover:text-[#FEF3C7] transition-colors">{item}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#FEF3C7] group-hover:translate-x-1 transition-transform" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Eminent Alumni */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-[#E8DFD8]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-3 border-b border-[#E5E7EB]">
              <div>
                <span className="text-xs font-bold text-[#B45309] uppercase tracking-wider">Global Pride</span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#801815]">Eminent Alumni</h3>
              </div>
              <a
                href="#"
                className="px-4 py-2 rounded-xl bg-[#801815] hover:bg-[#63100E] text-white text-xs font-bold transition-colors w-fit shadow-sm"
              >
                <span>Join Alumni Network</span>
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-6">
              {[
                { name: 'Dr. Rebecca S. Thombre', role: 'Research Scientist', org: 'UK Health Security Agency, England', badge: 'RT' },
                { name: 'Dr. Nikhil Patil', role: 'Postdoctoral Associate', org: 'Texas A&M University, USA', badge: 'NP' },
                { name: 'Ms. Ruchira Sutar', role: 'Ph.D. Research Scholar', org: 'Agharkar Research Institute, Pune', badge: 'RS' },
                { name: 'Dr. Deepa Verma', role: 'Vice Principal', org: 'VIVA College of Arts & Commerce', badge: 'DV' },
              ].map((alumnus, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-[#801815] text-white flex items-center justify-center font-bold text-xs">
                        {alumnus.badge}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#121C2A]">{alumnus.name}</h4>
                        <span className="text-[10px] text-[#6B7280]">{alumnus.role}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#4B5563] mt-1">{alumnus.org}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RICH COLLEGE FOOTER */}
      <footer className="w-full bg-[#27313F] text-[#EAF1FF] border-t-4 border-[#B45309]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Col 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#801815] flex items-center justify-center font-serif text-white font-bold">
                  B
                </div>
                <div>
                  <span className="font-serif font-bold text-sm text-white block">Bhavan&apos;s College</span>
                  <span className="text-[10px] text-[#FEF3C7]">Andheri (West), Mumbai</span>
                </div>
              </div>
              <p className="text-xs text-white/75 leading-relaxed">
                An institution of cultural heritage and higher learning founded by Kulapati Dr. K. M. Munshi in 1946 under the aegis of Bharatiya Vidya Bhavan.
              </p>
              <div className="text-[11px] text-[#FEF3C7] pt-1">
                <span>Office: 10:00 AM – 05:00 PM (Mon–Sat)</span>
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-2 text-xs">
              <h3 className="font-serif font-bold text-sm text-white border-b border-white/10 pb-2 mb-2">Institutional Coordinates</h3>
              <p className="text-white/75">
                <strong className="text-white">Address:</strong><br />
                Munshi Nagar, Old D N Nagar, Andheri (West), Mumbai – 400058, Maharashtra.
              </p>
              <p className="text-white/75 pt-1">
                <strong className="text-white">Telephone:</strong><br />
                +91 22 2625 6451 / 2625 6452
              </p>
            </div>

            {/* Col 3 */}
            <div className="space-y-2 text-xs">
              <h3 className="font-serif font-bold text-sm text-white border-b border-white/10 pb-2 mb-2">Academic &amp; Verification Portals</h3>
              <ul className="space-y-1.5 text-white/75">
                <li>
                  <button
                    onClick={openVerificationModal}
                    className="hover:text-white transition-colors text-[#FEF3C7] font-semibold text-left cursor-pointer"
                  >
                    &bull; Verify Credentials (Degrees, Internships, Hackathons)
                  </button>
                </li>
                <li><a href="#admissions" className="hover:text-white transition-colors">&bull; Mastersoft Admissions</a></li>
                <li><a href="#notices" className="hover:text-white transition-colors">&bull; Examination Cell Notices</a></li>
                <li><a href="#autonomy" className="hover:text-white transition-colors">&bull; UGC Autonomous Guidelines</a></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div className="space-y-3 text-xs">
              <h3 className="font-serif font-bold text-sm text-white border-b border-white/10 pb-2">Verification Technology</h3>
              <div className="p-3 rounded-xl bg-white/10 border border-white/15 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#86EFAC] font-bold text-[11px]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Credify Multi-Credential PKI Active</span>
                </div>
                <p className="text-[11px] text-white/75 leading-relaxed">
                  Validate Degrees, Academic Marksheets, Industrial Internships, &amp; Hackathon Awards with Ed25519 PKI.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full bg-[#1B232E] border-t border-white/10 py-4 text-xs text-white/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-2">
            <p>&copy; 2026 Bharatiya Vidya Bhavan&apos;s College. All Rights Reserved. Empowered Autonomous Institution.</p>
            <div className="flex items-center gap-4 text-[11px]">
              <Link href="/" className="text-[#FEF3C7] hover:underline">Credify Platform Home</Link>
              <span>|</span>
              <Link href="/developers" className="text-[#FEF3C7] hover:underline">Developer API</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
