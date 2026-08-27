'use client';
import Link from 'next/link';
import { ExternalLink, Copy, Check, FileText, ArrowUpRight, GraduationCap, Briefcase, Trophy } from 'lucide-react';
import { useState } from 'react';

export interface CertificateData {
  id: string;
  studentName: string;
  rollNo: string;
  degree: string;
  cgpa: number;
  issueDate: string;
  dataHash: string;
  status?: string;
}

interface CertificateCardProps {
  certificate: CertificateData;
  onRevoke?: (id: string) => void;
}

export default function CertificateCard({ certificate }: CertificateCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyHash = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(certificate.dataHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isRevoked = certificate.status === 'revoked';

  // Smart type detection
  const degreeLower = (certificate.degree || '').toLowerCase();
  const rollLower = (certificate.rollNo || '').toLowerCase();

  const isInternship = degreeLower.includes('intern') || rollLower.includes('int-') || rollLower.includes('emp-');
  const isHackathon = degreeLower.includes('hackathon') || degreeLower.includes('winner') || degreeLower.includes('runner') || degreeLower.includes('track') || rollLower.includes('team-') || rollLower.includes('hack-');

  let idLabel = 'Roll No';
  let scoreLabel = 'CGPA';
  let badgeLabel = 'Degree';
  let Icon = GraduationCap;

  if (isInternship) {
    idLabel = 'Intern / Employee ID';
    scoreLabel = 'Performance Score';
    badgeLabel = 'Internship';
    Icon = Briefcase;
  } else if (isHackathon) {
    idLabel = 'Team / Reg ID';
    scoreLabel = 'Evaluation Score';
    badgeLabel = 'Hackathon Award';
    Icon = Trophy;
  }

  return (
    <div
      className={`bg-white border rounded-2xl p-6 transition-all hover:border-[#D5C5AC] hover:shadow-warm ${
        isRevoked ? 'border-[#FED7AA] bg-[#FFFBEB]/30' : 'border-[#EAE0CE]'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#8A5D08] bg-[#FEF9E5] border border-[#FDE68A] px-2 py-0.5 rounded-full">
              <Icon className="w-3 h-3" />
              <span>{badgeLabel}</span>
            </span>
          </div>
          <h3 className="text-base font-bold text-[#141619] leading-snug">{certificate.studentName}</h3>
          <p className="text-xs font-medium text-[#716049] mt-0.5">{certificate.degree}</p>
        </div>
        {certificate.status && (
          <span
            className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              isRevoked
                ? 'bg-[#FFF7ED] text-[#C2410C] border-[#FFEDD5]'
                : 'bg-[#F0FDF4] text-[#15803D] border-[#DCFCE7]'
            }`}
          >
            {isRevoked ? 'Revoked' : 'Active'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs mb-4 p-3 bg-[#FAF6EF] rounded-xl border border-[#EAE0CE]/60">
        <div>
          <span className="text-[10px] font-semibold text-[#948065] uppercase tracking-wider block mb-0.5">
            {idLabel}
          </span>
          <span className="font-mono font-medium text-[#141619]">{certificate.rollNo}</span>
        </div>
        <div>
          <span className="text-[10px] font-semibold text-[#948065] uppercase tracking-wider block mb-0.5">
            {scoreLabel}
          </span>
          <span className="font-bold text-[#141619]">{certificate.cgpa.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-[10px] font-semibold text-[#948065] uppercase tracking-wider block mb-0.5">
            Issue Date
          </span>
          <span className="text-[#4F4232]">
            {new Date(certificate.issueDate).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-semibold text-[#948065] uppercase tracking-wider block mb-0.5">
            Certificate UUID
          </span>
          <span className="font-mono text-[#716049] truncate block" title={certificate.id}>
            {certificate.id.slice(0, 8)}...
          </span>
        </div>
      </div>

      {certificate.dataHash && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-[#948065] uppercase tracking-wider">
              SHA-256 Digest
            </span>
            <button
              onClick={handleCopyHash}
              className="text-[11px] text-[#B87F08] hover:text-[#8A5D08] flex items-center gap-1 font-medium"
              title="Copy SHA-256 Hash"
            >
              {copied ? <Check className="w-3 h-3 text-[#15803D]" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="font-mono text-[11px] text-[#4F4232] bg-[#FAF6EF] border border-[#EAE0CE] rounded-lg px-2.5 py-1.5 break-all select-all">
            {certificate.dataHash}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-[#EAE0CE]/70">
        <Link
          href={`/certificates/${certificate.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#FAF6EF] text-[#141619] border border-[#EAE0CE] py-2 rounded-xl text-xs font-semibold hover:bg-[#F4ECE0] transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-[#716049]" /> Details
        </Link>
        <a
          href={`/api/certificates/${certificate.id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#181A1D] text-white py-2 rounded-xl text-xs font-semibold hover:bg-[#282B30] transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#FEF0C2]" /> PDF Transcript
        </a>
      </div>
    </div>
  );
}
