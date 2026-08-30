'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Loader2,
  Plus,
  FileText,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Building,
  ShieldCheck,
  Search,
  Ban,
  CheckCircle,
  Copy,
  Check,
  Layers,
  ArrowUpRight,
  Filter,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import CredifyLogo from '@/components/CredifyLogo';
import { useUser, UserButton } from '@clerk/nextjs';

interface InstitutionSummary {
  id: string;
  name: string;
  email: string;
  algorithm: string;
  ownerId?: string | null;
  certificateCount: number;
}

interface Certificate {
  id: string;
  studentName: string;
  rollNo: string;
  degree: string;
  cgpa: number;
  issueDate: string;
  status: string;
  dataHash: string;
  institution: { id: string; name: string; algorithm: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function UniversityDashboard() {
  const { user } = useUser();
  const [institutionsList, setInstitutionsList] = useState<InstitutionSummary[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('');
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);

  const [loading, setLoading] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[] | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'revoked'>('all');
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [serverActiveCount, setServerActiveCount] = useState(0);
  const [serverRevokedCount, setServerRevokedCount] = useState(0);

  // Fetch all registered institutions
  const fetchInstitutions = useCallback(async () => {
    try {
      setLoadingInstitutions(true);
      const res = await fetch('/api/institutions');
      const json = await res.json();
      if (res.ok && json.institutions && json.institutions.length > 0) {
        setInstitutionsList(json.institutions);
        
        // Check localStorage or cached session
        const savedId = localStorage.getItem('credify_active_institution_id') || 
                        sessionStorage.getItem('credify_last_institution_id');
        
        const validId = json.institutions.find((inst: InstitutionSummary) => inst.id === savedId)
          ? savedId
          : json.institutions[0].id;
        
        setSelectedInstitutionId(validId);
        loadCertificates(validId, 1);
      } else {
        setInstitutionsList([]);
      }
    } catch (err) {
      console.error('Failed to fetch institutions:', err);
    } finally {
      setLoadingInstitutions(false);
    }
  }, []);

  useEffect(() => {
    fetchInstitutions();
  }, [fetchInstitutions]);

  const loadCertificates = async (instId: string, p: number = 1) => {
    if (!instId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/certificates?institutionId=${instId}&page=${p}&limit=12`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load institution certificates');
      setCertificates(json.certificates);
      setPagination(json.pagination);
      if (json.activeCount !== undefined) setServerActiveCount(json.activeCount);
      if (json.revokedCount !== undefined) setServerRevokedCount(json.revokedCount);
      setPage(p);
      localStorage.setItem('credify_active_institution_id', instId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
      setCertificates(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInstitution = (id: string) => {
    setSelectedInstitutionId(id);
    loadCertificates(id, 1);
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this certificate? This action will mark it as revoked on all public verifiers.')) {
      return;
    }
    setRevokingId(id);
    try {
      const res = await fetch(`/api/certificates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'revoked' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to revoke certificate');
      
      if (certificates) {
        setCertificates(
          certificates.map((c) => (c.id === id ? { ...c, status: 'revoked' } : c))
        );
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Revocation failed');
    } finally {
      setRevokingId(null);
    }
  };

  const copyCertId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter certificates client-side by query and status
  const filteredCertificates = useMemo(() => {
    if (!certificates) return [];
    return certificates.filter((cert) => {
      const matchesSearch =
        cert.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.degree.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || cert.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [certificates, searchQuery, statusFilter]);

  const currentInstitution = institutionsList.find((i) => i.id === selectedInstitutionId);
  const activeCount = serverActiveCount;
  const revokedCount = serverRevokedCount;
  const algorithm = currentInstitution?.algorithm?.toUpperCase() ?? 'ED25519';
  const isOwner = !!currentInstitution?.ownerId && currentInstitution.ownerId === user?.id;

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 bg-[#FEF9E5] text-[#8A5D08] border border-[#EAE0CE] rounded-full px-3.5 py-1 text-xs font-semibold shadow-2xs">
              <Building className="w-4 h-4 text-[#FBC02D]" />
              <span>Authority Management Console</span>
            </div>
            {user && (
              <div className="inline-flex items-center gap-2 bg-[#FEF9E5] text-[#181A1D] border border-[#EAE0CE] rounded-full px-3.5 py-1 text-xs font-semibold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
                <span>Logged in as <strong>{user.firstName || user.username || user.primaryEmailAddress?.emailAddress}</strong></span>
              </div>
            )}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#141619] tracking-tight">
            {currentInstitution ? currentInstitution.name : 'Authority Console'}
            {currentInstitution && !isOwner && (
              <span className="ml-3 align-middle inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F1F2F3] text-[#716049] border border-[#E4E1D8]">
                View-only
              </span>
            )}
          </h1>
          <p className="text-sm text-[#716049] max-w-xl leading-relaxed">
            Inspect verified credentials, audit cryptographic signatures, and manage credential revocation status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/university/issue?institutionId=${selectedInstitutionId}`}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#181A1D] hover:bg-[#282B30] text-white text-xs font-bold rounded-xl shadow-warm hover:-translate-y-0.5 transition-all"
          >
            <Plus className="w-4 h-4 text-[#FDE98A]" />
            <span>Issue Degrees</span>
          </Link>
          <Link
            href="/university/register"
            className="inline-flex items-center gap-2 px-4 py-3 bg-white border border-[#EAE0CE] text-[#141619] hover:bg-[#FAF6EF] text-xs font-bold rounded-xl shadow-warm-sm transition-all"
          >
            <span>+ Register College</span>
          </Link>
        </div>
      </div>

      {/* University Selector Bar */}
      <div className="bg-white border border-[#EAE0CE] rounded-3xl p-6 shadow-warm-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE0CE] pb-4">
          <div>
            <span className="text-xs font-bold text-[#4F4232] uppercase tracking-wider block">
              Active University Workspace
            </span>
            <p className="text-xs text-[#716049] mt-0.5">
              Select a registered issuing institution to view its credentials.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#948065]">
              {institutionsList.length} Registered Institution{institutionsList.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {loadingInstitutions ? (
          <div className="flex items-center justify-center py-6 text-[#716049] gap-2 text-xs font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-[#8A5D08]" />
            <span>Loading registered universities...</span>
          </div>
        ) : institutionsList.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-[#716049]">No university registered yet in the database.</p>
            <Link
              href="/university/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#181A1D] text-white text-xs font-bold rounded-xl shadow-warm"
            >
              <Plus className="w-4 h-4 text-[#FDE98A]" />
              <span>Register Your First University</span>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <div className="relative flex-1">
              <select
                value={selectedInstitutionId}
                onChange={(e) => handleSelectInstitution(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF6EF] border border-[#EAE0CE] rounded-xl text-sm font-bold text-[#141619] focus:bg-white focus:ring-2 focus:ring-[#FBC02D] transition-all cursor-pointer appearance-none"
              >
                {institutionsList.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.algorithm.toUpperCase()}) — {inst.certificateCount} degrees issued
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadCertificates(selectedInstitutionId, 1)}
                disabled={loading}
                className="px-5 py-3 bg-[#FAF6EF] border border-[#EAE0CE] hover:bg-[#F4ECE0] text-[#141619] text-xs font-bold rounded-xl transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
              </button>
              <Link
                href="/university/register"
                className="px-4 py-3 bg-[#FEF9E5] border border-[#FDE68A] text-[#8A5D08] hover:bg-[#FDE98A] text-xs font-bold rounded-xl transition-all whitespace-nowrap"
              >
                + Register Another
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {currentInstitution && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white border border-[#EAE0CE] rounded-3xl p-6 shadow-warm-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FEF9E5] text-[#8A5D08] border border-[#EAE0CE] rounded-2xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-[#8A5D08]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#716049] uppercase tracking-wider">Total Credentials</p>
              <p className="font-serif text-3xl font-extrabold text-[#141619] mt-0.5">
                {pagination?.total ?? (certificates?.length ?? 0)}
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#EAE0CE] rounded-3xl p-6 shadow-warm-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] rounded-2xl flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-[#15803D]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#716049] uppercase tracking-wider">Active vs Revoked</p>
              <p className="font-serif text-3xl font-extrabold text-[#15803D] mt-0.5">
                {activeCount} <span className="text-[#948065] text-lg font-normal">/ {revokedCount}</span>
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#EAE0CE] rounded-3xl p-6 shadow-warm-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FAF6EF] text-[#716049] border border-[#EAE0CE] rounded-2xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#8A5D08]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#716049] uppercase tracking-wider">Cryptographic Scheme</p>
              <p className="text-xl font-bold font-mono text-[#141619] mt-1">{algorithm}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Records Section */}
      {certificates && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#948065] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name, roll number, or degree..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EAE0CE] rounded-xl text-xs sm:text-sm text-[#141619] placeholder:text-[#948065] focus:ring-2 focus:ring-[#FBC02D] shadow-warm-sm transition-all"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-2 self-end sm:self-auto bg-white border border-[#EAE0CE] p-1 rounded-xl shadow-warm-sm">
              <Filter className="w-3.5 h-3.5 text-[#948065] ml-2" />
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-[#181A1D] text-white shadow-2xs'
                    : 'text-[#716049] hover:text-[#141619]'
                }`}
              >
                All ({pagination?.total ?? certificates?.length ?? 0})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'active'
                    ? 'bg-[#15803D] text-white shadow-2xs'
                    : 'text-[#716049] hover:text-[#15803D]'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setStatusFilter('revoked')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'revoked'
                    ? 'bg-[#991B1B] text-white shadow-2xs'
                    : 'text-[#716049] hover:text-[#991B1B]'
                }`}
              >
                Revoked ({revokedCount})
              </button>
            </div>
          </div>

          {/* Certificate Records Table */}
          <div className="bg-white border border-[#EAE0CE] rounded-3xl overflow-hidden shadow-warm-md">
            {filteredCertificates.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <FileText className="w-10 h-10 text-[#948065] mx-auto opacity-50" />
                <p className="text-sm font-bold text-[#141619]">No credentials matched the search criteria</p>
                <p className="text-xs text-[#716049]">Try resetting filters or issue a new credential.</p>
                <Link
                  href={`/university/issue?institutionId=${selectedInstitutionId}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8A5D08] hover:underline pt-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Issue a certificate for this university
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#EAE0CE] bg-[#FAF6EF] text-[11px] font-bold text-[#716049] uppercase tracking-wider">
                      <th className="py-4 px-6">Student Details</th>
                      <th className="py-4 px-6">Degree &amp; CGPA</th>
                      <th className="py-4 px-6">Issue Date</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE0CE] text-xs">
                    {filteredCertificates.map((cert) => (
                      <tr key={cert.id} className="hover:bg-[#FAF6EF]/60 transition-colors">
                        <td className="py-4 px-6 space-y-1">
                          <p className="font-bold text-[#141619] text-sm">{cert.studentName}</p>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-[#716049]">Roll: {cert.rollNo}</span>
                            <span className="text-[#EAE0CE]">&bull;</span>
                            <span className="font-mono text-[10px] text-[#948065]">ID: {cert.id.substring(0, 8)}...</span>
                            <button
                              onClick={() => copyCertId(cert.id)}
                              className="text-[#948065] hover:text-[#141619]"
                              title="Copy UUID"
                            >
                              {copiedId === cert.id ? <Check className="w-3 h-3 text-[#15803D]" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-6 space-y-0.5">
                          <p className="font-semibold text-[#141619]">{cert.degree}</p>
                          <p className="text-[11px] font-bold text-[#8A5D08]">CGPA: {cert.cgpa.toFixed(2)}</p>
                        </td>
                        <td className="py-4 px-6 font-mono text-[#716049]">
                          {new Date(cert.issueDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                              cert.status === 'active'
                                ? 'bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]'
                                : 'bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${cert.status === 'active' ? 'bg-[#15803D]' : 'bg-[#991B1B]'}`} />
                            {cert.status === 'active' ? 'Active' : 'Revoked'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/certificates/${cert.id}`}
                              className="p-2 bg-[#FAF6EF] text-[#141619] hover:bg-[#EAE0CE] rounded-lg transition-colors"
                              title="View Public Verification Record"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-[#716049]" />
                            </Link>
                            <Link
                              href={`/api/certificates/${cert.id}/pdf`}
                              target="_blank"
                              className="p-2 bg-[#FAF6EF] text-[#141619] hover:bg-[#EAE0CE] rounded-lg transition-colors"
                              title="Download Official PDF"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#716049]" />
                            </Link>
                            {cert.status === 'active' && isOwner && (
                              <button
                                onClick={() => handleRevoke(cert.id)}
                                disabled={revokingId === cert.id}
                                className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Revoke Certificate"
                              >
                                {revokingId === cert.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Ban className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-[#EAE0CE]">
                <span className="text-xs text-[#716049]">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadCertificates(selectedInstitutionId, page - 1)}
                    disabled={page <= 1}
                    className="p-2 rounded-lg border border-[#EAE0CE] text-[#716049] hover:bg-[#FAF6EF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => loadCertificates(selectedInstitutionId, page + 1)}
                    disabled={page >= (pagination?.totalPages ?? 1)}
                    className="p-2 rounded-lg border border-[#EAE0CE] text-[#716049] hover:bg-[#FAF6EF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
