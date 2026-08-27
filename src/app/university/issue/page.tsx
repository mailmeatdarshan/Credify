'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Loader2,
  Plus,
  Download,
  CheckCircle2,
  Trash2,
  FileCheck,
  Building,
  KeyRound,
  ExternalLink,
  Sparkles,
  Eye,
  EyeOff,
  Copy,
  Check,
  ArrowRight,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  Layers,
  FileText,
  GraduationCap,
  Briefcase,
  Trophy,
} from 'lucide-react';

interface InstitutionSummary {
  id: string;
  name: string;
  algorithm: string;
}

interface StudentData {
  studentName: string;
  rollNo: string;
  degree: string;
  cgpa: string;
  issueDate: string;
}

interface IssuedCert {
  id: string;
  studentName: string;
  rollNo?: string;
  degree?: string;
  cgpa?: string | number;
  issueDate?: string;
  dataHash: string;
  qrCode: string;
  pdfBase64?: string;
}

const SAMPLE_CSV = `studentName,rollNo,degree,cgpa,issueDate
Aarav Sharma,2021CS10234,B.Tech Computer Science and Engineering,9.45,2024-06-15
Priya Patel,INT-2025-089,Full Stack Engineering Intern,9.80,2024-06-15
Rohan Verma,TEAM-HACK-442,1st Place Winner - AI Track,10.00,2024-06-10`;

function IssueCertificateContent() {
  const searchParams = useSearchParams();
  const [institutions, setInstitutions] = useState<InstitutionSummary[]>([]);
  const [institutionId, setInstitutionId] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [autoLoaded, setAutoLoaded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const keyFileInputRef = useRef<HTMLInputElement>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  // Mode States
  const [issueMode, setIssueMode] = useState<'manual' | 'csv'>('manual');
  const [category, setCategory] = useState<'degree' | 'internship' | 'hackathon'>('degree');

  // Manual Form State: Starts clean and empty!
  const [students, setStudents] = useState<StudentData[]>([
    {
      studentName: '',
      rollNo: '',
      degree: '',
      cgpa: '',
      issueDate: new Date().toISOString().split('T')[0],
    },
  ]);

  // CSV Batch State
  const [csvStudents, setCsvStudents] = useState<StudentData[]>([]);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [csvDragOver, setCsvDragOver] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [issued, setIssued] = useState<IssuedCert[] | null>(null);
  const [batchMetrics, setBatchMetrics] = useState<{ total: number; timeMs: number } | null>(null);

  // Fetch available institutions
  useEffect(() => {
    async function loadInstitutions() {
      try {
        const res = await fetch('/api/institutions');
        const json = await res.json();
        if (res.ok && json.institutions && json.institutions.length > 0) {
          setInstitutions(json.institutions);
          
          const paramId = searchParams.get('institutionId');
          const cachedId = typeof window !== 'undefined' ? sessionStorage.getItem('credify_last_institution_id') : null;
          const cachedKey = typeof window !== 'undefined' ? sessionStorage.getItem('credify_last_private_key') : null;
          
          const targetId = paramId || cachedId || json.institutions[0].id;
          setInstitutionId(targetId);

          if (cachedKey && (!paramId || paramId === cachedId)) {
            setPrivateKey(cachedKey);
            setAutoLoaded(true);
          }
        }
      } catch (err) {
        console.error('Failed to load institutions:', err);
      }
    }
    loadInstitutions();
  }, [searchParams]);

  const handleKeyFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.id) setInstitutionId(parsed.id);
        if (parsed.privateKey) {
          setPrivateKey(parsed.privateKey);
          setAutoLoaded(true);
        }
      } catch {
        alert('Invalid keyfile format. Please upload a valid .json keyfile generated during registration.');
      }
    };
    reader.readAsText(file);
  };

  const downloadSampleCsv = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'credify_sample_batch.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCsvText = (text: string, filename: string) => {
    setCsvFileName(filename);
    setError('');
    setCsvErrors([]);

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) {
      setCsvErrors(['CSV file is empty or does not contain data rows.']);
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    const expected = ['studentname', 'rollno', 'degree', 'cgpa', 'issuedate'];
    
    // Check header columns
    const missing = expected.filter(e => !headers.includes(e));
    if (missing.length > 0) {
      setCsvErrors([`Missing required CSV header columns: ${missing.join(', ')}`]);
      return;
    }

    const nameIdx = headers.indexOf('studentname');
    const rollIdx = headers.indexOf('rollno');
    const degreeIdx = headers.indexOf('degree');
    const cgpaIdx = headers.indexOf('cgpa');
    const dateIdx = headers.indexOf('issuedate');

    const parsed: StudentData[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts: string[] = [];
      let inQuotes = false;
      let curr = '';
      for (let c = 0; c < lines[i].length; c++) {
        const char = lines[i][c];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
          parts.push(curr.trim().replace(/^["']|["']$/g, ''));
          curr = '';
        } else {
          curr += char;
        }
      }
      parts.push(curr.trim().replace(/^["']|["']$/g, ''));

      if (parts.length < expected.length) {
        errors.push(`Row ${i + 1}: Incomplete record with fewer columns.`);
        continue;
      }

      const studentName = parts[nameIdx] || '';
      const rollNo = parts[rollIdx] || '';
      const degree = parts[degreeIdx] || '';
      const cgpa = parts[cgpaIdx] || '';
      const issueDate = parts[dateIdx] || '';

      if (!studentName || !rollNo || !degree) {
        errors.push(`Row ${i + 1}: Missing name, ID, or title.`);
      }

      const numCgpa = parseFloat(cgpa);
      if (isNaN(numCgpa) || numCgpa < 0 || numCgpa > 10) {
        errors.push(`Row ${i + 1}: Invalid score "${cgpa}" (must be between 0 and 10).`);
      }

      parsed.push({ studentName, rollNo, degree, cgpa, issueDate });
    }

    setCsvStudents(parsed);
    setCsvErrors(errors);
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      parseCsvText(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleCsvDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setCsvDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.txt'))) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        parseCsvText(content, file.name);
      };
      reader.readAsText(file);
    }
  };

  const addStudent = () => {
    setStudents([
      ...students,
      {
        studentName: '',
        rollNo: '',
        degree: '',
        cgpa: '',
        issueDate: new Date().toISOString().split('T')[0],
      },
    ]);
  };

  const fillDegreeBatch = () => {
    setCategory('degree');
    const today = new Date().toISOString().split('T')[0];
    setStudents([
      {
        studentName: 'Aditi Verma',
        rollNo: '2021BCSE042',
        degree: 'B.Tech Computer Science & Engineering',
        cgpa: '9.82',
        issueDate: today,
      },
      {
        studentName: 'Rohan Kulkarni',
        rollNo: '2021BCSE088',
        degree: 'B.Tech Data Science & AI',
        cgpa: '9.15',
        issueDate: today,
      },
    ]);
  };

  const fillInternshipBatch = () => {
    setCategory('internship');
    const today = new Date().toISOString().split('T')[0];
    setStudents([
      {
        studentName: 'Aarav Sharma',
        rollNo: 'INT-2025-089',
        degree: 'Software Engineering Intern (Full Stack)',
        cgpa: '9.80',
        issueDate: today,
      },
      {
        studentName: 'Priya Patel',
        rollNo: 'INT-2025-104',
        degree: 'Machine Learning & Cloud Intern',
        cgpa: '9.75',
        issueDate: today,
      },
    ]);
  };

  const fillHackathonBatch = () => {
    setCategory('hackathon');
    const today = new Date().toISOString().split('T')[0];
    setStudents([
      {
        studentName: 'Team Cypher (Aarav & Priya)',
        rollNo: 'TEAM-HACK-442',
        degree: '1st Place Winner - AI & Cryptography Track',
        cgpa: '10.0',
        issueDate: today,
      },
    ]);
  };

  const clearForm = () => {
    setStudents([
      {
        studentName: '',
        rollNo: '',
        degree: '',
        cgpa: '',
        issueDate: new Date().toISOString().split('T')[0],
      },
    ]);
  };

  const removeStudent = (index: number) => {
    if (students.length <= 1) {
      clearForm();
      return;
    }
    setStudents(students.filter((_, i) => i !== index));
  };

  const updateStudent = (index: number, field: keyof StudentData, value: string) => {
    const newStudents = [...students];
    newStudents[index][field] = value;
    setStudents(newStudents);
  };

  const downloadPdf = (pdfBase64: string, studentName: string) => {
    const byteString = atob(pdfBase64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credential_${studentName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadQr = (qrDataUrl: string, studentName: string) => {
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qr_${studentName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
    a.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const targetStudents = issueMode === 'csv' ? csvStudents : students;

    // Validate non-empty
    const emptyCheck = targetStudents.filter(s => !s.studentName.trim() || !s.rollNo.trim() || !s.degree.trim() || !s.cgpa);
    if (emptyCheck.length > 0) {
      setError('Please fill in all required fields (Name, ID, Degree/Role, and Score) for all records.');
      setLoading(false);
      return;
    }

    try {
      const endpoint = issueMode === 'csv' ? '/api/certificates/bulk' : '/api/certificates/issue';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ institutionId, privateKey, students: targetStudents }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to issue credentials');
      
      setIssued(json.certificates);
      if (json.timeTakenMs) {
        setBatchMetrics({ total: json.totalIssued, timeMs: json.timeTakenMs });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to issue credentials');
    } finally {
      setLoading(false);
    }
  };

  const copyCertId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Dynamic labels based on selected category
  const labels = {
    degree: {
      name: 'Candidate / Student Full Name',
      namePlaceholder: 'e.g. Aarav Sharma',
      id: 'Enrollment / Roll No',
      idPlaceholder: 'e.g. 2021CS10234',
      title: 'Degree & Specialization Conferred',
      titlePlaceholder: 'e.g. B.Tech Computer Science and Engineering',
      score: 'Cumulative CGPA (0 - 10)',
      scorePlaceholder: 'e.g. 9.45',
      date: 'Conferral / Graduation Date',
    },
    internship: {
      name: 'Intern / Employee Full Name',
      namePlaceholder: 'e.g. Rohan Sharma',
      id: 'Intern / Employee ID',
      idPlaceholder: 'e.g. INT-2025-089',
      title: 'Internship Role & Domain',
      titlePlaceholder: 'e.g. Full Stack Engineering Intern',
      score: 'Performance Rating / Score (0 - 10)',
      scorePlaceholder: 'e.g. 9.80',
      date: 'Completion / Issue Date',
    },
    hackathon: {
      name: 'Participant / Team Name',
      namePlaceholder: 'e.g. Team Cypher (Aarav & Priya)',
      id: 'Team / Registration ID',
      idPlaceholder: 'e.g. TEAM-HACK-442',
      title: 'Award & Track Distinction',
      titlePlaceholder: 'e.g. 1st Place Winner - AI & Cryptography Track',
      score: 'Evaluation Score (0 - 10)',
      scorePlaceholder: 'e.g. 10.0',
      date: 'Award / Event Date',
    },
  }[category];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Editorial Header */}
      <div className="text-center sm:text-left space-y-2">
        <div className="inline-flex items-center gap-2 bg-[#FEF9E5] text-[#8A5D08] border border-[#EAE0CE] rounded-full px-3.5 py-1 text-xs font-semibold shadow-2xs">
          <FileCheck className="w-4 h-4 text-[#FBC02D]" />
          <span>Cryptographic Credential Minting</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#141619] tracking-tight">
          Issue verified <mark className="highlight">credentials</mark>
        </h1>
        <p className="text-sm text-[#716049] max-w-xl leading-relaxed">
          Digitally sign degrees, internship certificates, and hackathon awards using your authority&apos;s private key to generate tamper-proof QR codes.
        </p>
      </div>

      {/* Success Result View */}
      {issued ? (
        <div className="space-y-6">
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-warm-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#15803D] text-white flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#14532D]">
                  {issued.length} Credential{issued.length > 1 ? 's' : ''} Cryptographically Signed &amp; Issued
                </h2>
                <p className="text-xs text-[#166534] mt-0.5">
                  {batchMetrics
                    ? `Processed ${batchMetrics.total} records in ${batchMetrics.timeMs}ms with zero-knowledge cryptographic provenance.`
                    : 'Digital signatures registered with mathematical provenance in the registry.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/university/dashboard`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#BBF7D0] text-[#14532D] hover:bg-[#DCFCE7] text-xs font-bold rounded-xl shadow-warm-sm transition-all"
              >
                <span>View in Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#15803D]" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {issued.map((cert) => (
              <div key={cert.id} className="bg-white border border-[#EAE0CE] rounded-3xl p-6 shadow-warm-sm space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-[#141619]">{cert.studentName}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] font-mono text-[#716049]">{cert.id}</span>
                      <button
                        onClick={() => copyCertId(cert.id)}
                        className="text-[#948065] hover:text-[#141619]"
                        title="Copy Certificate UUID"
                      >
                        {copiedId === cert.id ? <Check className="w-3 h-3 text-[#15803D]" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]">
                    Signed
                  </span>
                </div>

                {/* QR Code Preview */}
                <div className="flex items-center gap-4 p-3.5 bg-[#FAF6EF] border border-[#EAE0CE] rounded-2xl">
                  <div className="bg-white p-1.5 rounded-xl border border-[#EAE0CE] shadow-2xs flex-shrink-0">
                    <Image
                      src={cert.qrCode}
                      alt={`QR Code for ${cert.studentName}`}
                      width={80}
                      height={80}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] font-semibold text-[#948065] uppercase tracking-wider block">
                      SHA-256 Digest
                    </span>
                    <p className="font-mono text-[11px] text-[#4F4232] break-all line-clamp-2">
                      {cert.dataHash}
                    </p>
                    <button
                      onClick={() => downloadQr(cert.qrCode, cert.studentName)}
                      className="text-[11px] font-bold text-[#8A5D08] hover:text-[#5C3D06] inline-flex items-center gap-1 pt-1"
                    >
                      <Download className="w-3 h-3" /> Download QR Image
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {cert.pdfBase64 ? (
                    <button
                      onClick={() => downloadPdf(cert.pdfBase64!, cert.studentName)}
                      className="inline-flex items-center justify-center gap-1.5 bg-[#181A1D] text-white hover:bg-[#282B30] py-2.5 px-3 rounded-xl text-xs font-bold shadow-warm-sm transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-[#FDE98A]" /> Download PDF
                    </button>
                  ) : (
                    <button
                      onClick={() => downloadQr(cert.qrCode, cert.studentName)}
                      className="inline-flex items-center justify-center gap-1.5 bg-[#181A1D] text-white hover:bg-[#282B30] py-2.5 px-3 rounded-xl text-xs font-bold shadow-warm-sm transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-[#FDE98A]" /> Save QR
                    </button>
                  )}
                  <Link
                    href={`/certificates/${cert.id}`}
                    className="inline-flex items-center justify-center gap-1.5 bg-[#FAF6EF] text-[#141619] border border-[#EAE0CE] hover:bg-[#F4ECE0] py-2.5 px-3 rounded-xl text-xs font-bold transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#716049]" /> View Record
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => {
                setIssued(null);
                setBatchMetrics(null);
                setCsvStudents([]);
                setCsvFileName(null);
                clearForm();
              }}
              className="text-xs font-bold text-[#8A5D08] hover:text-[#5C3D06]"
            >
              &larr; Issue Another Batch of Credentials
            </button>
          </div>
        </div>
      ) : (
        /* Form Section */
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-4">
              {error}
            </div>
          )}

          {/* Issuer Credentials */}
          <div className="bg-white border border-[#EAE0CE] rounded-3xl p-6 sm:p-8 shadow-warm-md space-y-5">
            <div className="flex items-center justify-between border-b border-[#EAE0CE] pb-4">
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-5 h-5 text-[#8A5D08]" />
                <h2 className="text-xs font-bold text-[#141619] uppercase tracking-wider">
                  1. Issuing Authority Authorization
                </h2>
              </div>
              {autoLoaded && (
                <span className="text-[10px] font-mono font-bold text-[#15803D] bg-[#DCFCE7] border border-[#BBF7D0] px-2.5 py-1 rounded-full">
                  Key Auto-Loaded
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Institution Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#4F4232] uppercase tracking-wider">
                    Issuing Authority
                  </label>
                  <Link
                    href="/university/register"
                    className="text-[11px] font-bold text-[#8A5D08] hover:underline"
                  >
                    + Register New Authority
                  </Link>
                </div>

                {institutions.length > 0 ? (
                  <select
                    value={institutionId}
                    onChange={(e) => setInstitutionId(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAF6EF] border border-[#EAE0CE] rounded-xl text-xs sm:text-sm font-bold text-[#141619] focus:bg-white focus:ring-2 focus:ring-[#FBC02D] transition-all cursor-pointer appearance-none"
                  >
                    {institutions.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} ({inst.algorithm.toUpperCase()})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={institutionId}
                    onChange={(e) => setInstitutionId(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FAF6EF] border border-[#EAE0CE] rounded-xl text-xs sm:text-sm font-mono text-[#141619] placeholder:text-[#948065] focus:bg-white focus:ring-2 focus:ring-[#FBC02D] transition-all"
                    placeholder="Authority UUID"
                  />
                )}
                <p className="text-[11px] font-mono text-[#948065]">
                  ID: {institutionId || 'Select authority'}
                </p>
              </div>

              {/* Private Key Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#4F4232] uppercase tracking-wider">
                    Authority Private Key
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={keyFileInputRef}
                      onChange={handleKeyFileUpload}
                      accept=".json"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => keyFileInputRef.current?.click()}
                      className="text-[11px] text-[#8A5D08] hover:underline font-bold inline-flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" /> Upload .json keyfile
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                      className="text-[11px] text-[#716049] hover:text-[#141619] flex items-center gap-1 font-semibold"
                    >
                      {showPrivateKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <textarea
                  required
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  className={`w-full px-4 py-3 bg-[#FAF6EF] border border-[#EAE0CE] rounded-xl text-xs sm:text-sm font-mono text-[#141619] placeholder:text-[#948065] focus:bg-white focus:ring-2 focus:ring-[#FBC02D] transition-all resize-none ${
                    !showPrivateKey && privateKey ? 'filter blur-[3px] hover:blur-none transition-all' : ''
                  }`}
                  rows={2}
                  placeholder="Paste Authority Private Key (Ed25519, ECC, or RSA)"
                />
              </div>
            </div>
          </div>

          {/* Mode Selector Tabs (Manual vs Bulk CSV) */}
          <div className="flex border border-[#EAE0CE] bg-[#FAF6EF] p-1.5 rounded-2xl gap-2">
            <button
              type="button"
              onClick={() => setIssueMode('manual')}
              className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                issueMode === 'manual'
                  ? 'bg-white text-[#181A1D] shadow-warm-sm border border-[#EAE0CE]'
                  : 'text-[#716049] hover:text-[#181A1D]'
              }`}
            >
              <FileText className="w-4 h-4 text-[#8A5D08]" />
              <span>Interactive Credential Form ({students.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setIssueMode('csv')}
              className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                issueMode === 'csv'
                  ? 'bg-white text-[#181A1D] shadow-warm-sm border border-[#EAE0CE]'
                  : 'text-[#716049] hover:text-[#181A1D]'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-[#15803D]" />
              <span>Bulk CSV / Legacy Batch Ingestion {csvStudents.length > 0 ? `(${csvStudents.length})` : ''}</span>
            </button>
          </div>

          {/* Tab 1: Interactive Manual Form */}
          {issueMode === 'manual' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Category Switcher */}
                <div className="flex items-center gap-1 bg-[#FAF6EF] border border-[#EAE0CE] p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setCategory('degree')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      category === 'degree'
                        ? 'bg-white text-[#181A1D] shadow-2xs'
                        : 'text-[#716049] hover:text-[#181A1D]'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-[#8A5D08]" />
                    <span>Degree</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('internship')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      category === 'internship'
                        ? 'bg-white text-[#181A1D] shadow-2xs'
                        : 'text-[#716049] hover:text-[#181A1D]'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5 text-[#15803D]" />
                    <span>Internship</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('hackathon')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      category === 'hackathon'
                        ? 'bg-white text-[#181A1D] shadow-2xs'
                        : 'text-[#716049] hover:text-[#181A1D]'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>Hackathon</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-[#FEF9E5] border border-[#EAE0CE] p-1 rounded-xl text-[11px] font-bold">
                    <span className="text-[#8A5D08] px-1.5">Presets:</span>
                    <button
                      type="button"
                      onClick={fillDegreeBatch}
                      className="px-2 py-1 bg-white rounded-lg text-[#141619] hover:bg-[#FAF6EF] shadow-2xs transition-all"
                    >
                      🎓 Degrees
                    </button>
                    <button
                      type="button"
                      onClick={fillInternshipBatch}
                      className="px-2 py-1 bg-white rounded-lg text-[#141619] hover:bg-[#FAF6EF] shadow-2xs transition-all"
                    >
                      💼 Internships
                    </button>
                    <button
                      type="button"
                      onClick={fillHackathonBatch}
                      className="px-2 py-1 bg-white rounded-lg text-[#141619] hover:bg-[#FAF6EF] shadow-2xs transition-all"
                    >
                      🏆 Hackathons
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={addStudent}
                    className="text-[11px] font-bold text-white bg-[#181A1D] hover:bg-[#282B30] px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-warm-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Record</span>
                  </button>
                </div>
              </div>

              {students.map((student, idx) => (
                <div key={idx} className="bg-white border border-[#EAE0CE] rounded-3xl p-6 shadow-warm-sm space-y-4 relative">
                  <div className="flex items-center justify-between border-b border-[#EAE0CE] pb-3">
                    <span className="text-xs font-mono font-bold text-[#8A5D08] uppercase tracking-wider">
                      Record #{idx + 1}
                    </span>
                    {students.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStudent(idx)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-[#4F4232] uppercase tracking-wider">
                        {labels.name}
                      </label>
                      <input
                        type="text"
                        required
                        value={student.studentName}
                        onChange={(e) => updateStudent(idx, 'studentName', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#FAF6EF] border border-[#EAE0CE] rounded-xl text-xs font-semibold text-[#141619] focus:bg-white focus:ring-2 focus:ring-[#FBC02D] transition-all"
                        placeholder={labels.namePlaceholder}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-[#4F4232] uppercase tracking-wider">
                        {labels.id}
                      </label>
                      <input
                        type="text"
                        required
                        value={student.rollNo}
                        onChange={(e) => updateStudent(idx, 'rollNo', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#FAF6EF] border border-[#EAE0CE] rounded-xl text-xs font-mono text-[#141619] focus:bg-white focus:ring-2 focus:ring-[#FBC02D] transition-all"
                        placeholder={labels.idPlaceholder}
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                      <label className="block text-[11px] font-bold text-[#4F4232] uppercase tracking-wider">
                        {labels.score}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        required
                        value={student.cgpa}
                        onChange={(e) => updateStudent(idx, 'cgpa', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#FAF6EF] border border-[#EAE0CE] rounded-xl text-xs font-mono font-bold text-[#141619] focus:bg-white focus:ring-2 focus:ring-[#FBC02D] transition-all"
                        placeholder={labels.scorePlaceholder}
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-[11px] font-bold text-[#4F4232] uppercase tracking-wider">
                        {labels.title}
                      </label>
                      <input
                        type="text"
                        required
                        value={student.degree}
                        onChange={(e) => updateStudent(idx, 'degree', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#FAF6EF] border border-[#EAE0CE] rounded-xl text-xs font-semibold text-[#141619] focus:bg-white focus:ring-2 focus:ring-[#FBC02D] transition-all"
                        placeholder={labels.titlePlaceholder}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-[#4F4232] uppercase tracking-wider">
                        {labels.date}
                      </label>
                      <input
                        type="date"
                        required
                        value={student.issueDate}
                        onChange={(e) => updateStudent(idx, 'issueDate', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#FAF6EF] border border-[#EAE0CE] rounded-xl text-xs font-mono text-[#141619] focus:bg-white focus:ring-2 focus:ring-[#FBC02D] transition-all"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Bulk CSV Ingestion */}
          {issueMode === 'csv' && (
            <div className="bg-white border border-[#EAE0CE] rounded-3xl p-6 sm:p-8 shadow-warm-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE0CE] pb-4">
                <div className="space-y-0.5">
                  <h3 className="font-serif text-lg font-bold text-[#141619]">
                    Bulk CSV / Legacy Batch Ingestion Engine
                  </h3>
                  <p className="text-xs text-[#716049]">
                    Upload a spreadsheet to batch-sign up to 500 records at once with zero manual typing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleCsv}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FEF9E5] border border-[#FDE68A] text-[#8A5D08] hover:bg-[#FDF3C7] text-xs font-bold rounded-xl transition-all shadow-2xs self-start"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV</span>
                </button>
              </div>

              {/* Drag and Drop CSV Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setCsvDragOver(true);
                }}
                onDragLeave={() => setCsvDragOver(false)}
                onDrop={handleCsvDrop}
                onClick={() => csvFileInputRef.current?.click()}
                className={`w-full p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                  csvDragOver
                    ? 'border-[#15803D] bg-[#F0FDF4]'
                    : 'border-[#D5C5AC] bg-[#FAF6EF] hover:border-[#15803D] hover:bg-[#F0FDF4]/60'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#EAE0CE] flex items-center justify-center text-[#15803D] mx-auto mb-2 shadow-2xs">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#141619]">
                  {csvFileName ? csvFileName : 'Drop your CSV File Here'}
                </h4>
                <p className="text-xs text-[#716049] mt-1 max-w-sm mx-auto">
                  Click to browse or drop a .csv file containing studentName, rollNo, degree, cgpa, and issueDate.
                </p>
              </div>

              <input
                ref={csvFileInputRef}
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={handleCsvFileUpload}
                className="hidden"
              />

              {/* CSV Errors if any */}
              {csvErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-4 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>CSV Validation Issues Detected ({csvErrors.length})</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 pt-1 text-[11px]">
                    {csvErrors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Parsed CSV Preview Table */}
              {csvStudents.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#141619] uppercase tracking-wider">
                      Parsed Batch Preview ({csvStudents.length} Records)
                    </span>
                    <span className="text-[11px] font-mono text-[#15803D] font-bold bg-[#DCFCE7] px-2.5 py-0.5 rounded-full">
                      Ready for Batch Signing
                    </span>
                  </div>

                  <div className="border border-[#EAE0CE] rounded-2xl overflow-hidden bg-[#FAF6EF]">
                    <div className="max-h-60 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#FAF6EF] border-b border-[#EAE0CE] text-[10px] font-bold text-[#716049] uppercase tracking-wider sticky top-0">
                          <tr>
                            <th className="p-3">#</th>
                            <th className="p-3">Candidate / Team</th>
                            <th className="p-3">ID / Roll No</th>
                            <th className="p-3">Degree / Role / Track</th>
                            <th className="p-3">Score</th>
                            <th className="p-3">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EAE0CE] bg-white">
                          {csvStudents.map((s, idx) => (
                            <tr key={idx} className="hover:bg-[#FAF6EF]/80 transition-colors">
                              <td className="p-3 font-mono text-[11px] text-[#948065]">{idx + 1}</td>
                              <td className="p-3 font-bold text-[#141619]">{s.studentName}</td>
                              <td className="p-3 font-mono text-[11px] text-[#4F4232]">{s.rollNo}</td>
                              <td className="p-3 text-[#4F4232] truncate max-w-xs">{s.degree}</td>
                              <td className="p-3 font-mono font-bold text-[#15803D]">{s.cgpa}</td>
                              <td className="p-3 font-mono text-[11px] text-[#716049]">{s.issueDate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || (issueMode === 'csv' && csvStudents.length === 0)}
              className="w-full py-4 bg-[#181A1D] hover:bg-[#282B30] text-white text-sm font-bold rounded-2xl shadow-warm hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:bg-[#EAE0CE] disabled:text-[#948065] disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>
                    Cryptographically Signing{' '}
                    {issueMode === 'csv' ? `${csvStudents.length} Records in Bulk...` : `${students.length} Credentials...`}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-[#FDE98A]" />
                  <span>
                    {issueMode === 'csv'
                      ? `Batch-Sign & Issue ${csvStudents.length} Records`
                      : `Sign & Issue ${students.length} Credential${students.length > 1 ? 's' : ''}`}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function IssuePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#8A5D08] mx-auto" />
          <p className="text-xs text-[#716049]">Loading Credential Minting Console...</p>
        </div>
      }
    >
      <IssueCertificateContent />
    </Suspense>
  );
}
