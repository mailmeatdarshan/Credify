'use client';
import { CheckCircle, XCircle, AlertTriangle, Loader2, Ban, ShieldCheck, FileSearch, AlertOctagon } from 'lucide-react';

export type VerificationStatusType =
  | 'authentic'
  | 'tampered'
  | 'not_found'
  | 'revoked'
  | 'legacy_unverified'
  | 'high_risk_tampered'
  | 'loading'
  | string
  | undefined
  | null;

interface StatusBadgeProps {
  status: VerificationStatusType;
  customDescription?: string;
}

const statusConfig: Record<string, {
  icon: any;
  label: string;
  description: string;
  className: string;
  iconClassName: string;
}> = {
  authentic: {
    icon: ShieldCheck,
    label: 'Verified Authentic Credential',
    description: 'Cryptographic digital signature verified with 100% mathematical integrity.',
    className: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#14532D]',
    iconClassName: 'text-[#16A34A]',
  },
  tampered: {
    icon: XCircle,
    label: 'Tampered / Invalid Signature',
    description: 'The cryptographic signature does not match the payload. Data has been modified.',
    className: 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]',
    iconClassName: 'text-[#DC2626]',
  },
  legacy_unverified: {
    icon: FileSearch,
    label: 'Legacy / Unsigned Document (Forensic Scan)',
    description: 'Document does not contain a Credify cryptographic signature. Deep PDF forensics applied.',
    className: 'bg-[#FFFBEB] border-[#FDE68A] text-[#854D0E]',
    iconClassName: 'text-[#D97706]',
  },
  high_risk_tampered: {
    icon: AlertOctagon,
    label: 'High Risk Document / Software Alterations Detected',
    description: 'Forensic inspection detected graphic editing software traces or modification layers.',
    className: 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]',
    iconClassName: 'text-[#DC2626]',
  },
  not_found: {
    icon: AlertTriangle,
    label: 'Credential Not Found',
    description: 'No verified record exists for the provided parameters. May be unissued or invalid.',
    className: 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]',
    iconClassName: 'text-[#D97706]',
  },
  revoked: {
    icon: Ban,
    label: 'Credential Revoked by Institution',
    description: 'This credential was originally authentic but has been officially revoked by the university.',
    className: 'bg-[#FFF7ED] border-[#FFEDD5] text-[#9A3412]',
    iconClassName: 'text-[#EA580C]',
  },
  loading: {
    icon: Loader2,
    label: 'Computing Cryptographic Verification...',
    description: '',
    className: 'bg-[#FAF6EF] border-[#EAE0CE] text-[#4F4232]',
    iconClassName: 'text-[#716049]',
  },
};

export default function StatusBadge({ status, customDescription }: StatusBadgeProps) {
  const normalizedKey = (status || 'not_found').toString().toLowerCase().trim();
  
  // Safe lookup with robust fallback to 'not_found'
  const config = statusConfig[normalizedKey] || statusConfig['not_found'];
  const Icon = config.icon || AlertTriangle;
  const description = customDescription || config.description;

  return (
    <div className={`flex items-start gap-3.5 px-5 py-4 rounded-xl border shadow-warm-sm ${config.className}`}>
      <Icon
        className={`h-5 w-5 mt-0.5 flex-shrink-0 ${config.iconClassName} ${normalizedKey === 'loading' ? 'animate-spin' : ''}`}
      />
      <div>
        <span className="text-sm font-bold block">{config.label}</span>
        {description ? (
          <span className="text-xs opacity-90 mt-0.5 block leading-relaxed">{description}</span>
        ) : null}
      </div>
    </div>
  );
}
