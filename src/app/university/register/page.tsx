'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  KeyRound,
  Copy,
  Check,
  Building,
  ShieldCheck,
  ArrowRight,
  Download,
  AlertTriangle,
  Zap,
  Cpu,
  Lock,
  Sparkles,
  Briefcase,
  Trophy,
  GraduationCap,
} from 'lucide-react';

const algorithms = [
  {
    id: 'ed25519',
    name: 'Ed25519',
    badge: 'Top Pick',
    tag: 'Edwards-curve DSA',
    desc: 'Sub-millisecond signing, compact 64-byte payload, optimized for QR scanning density.',
    icon: Zap,
    keySize: '256-bit',
    sigSize: '64 bytes',
  },
  {
    id: 'ecc',
    name: 'ECC P-256',
    badge: 'NIST Spec',
    tag: 'secp256r1 ECDSA',
    desc: 'Standard in banking, enterprise TLS, and government digital compliance frameworks.',
    icon: Cpu,
    keySize: '256-bit',
    sigSize: '~72 bytes',
  },
  {
    id: 'rsa',
    name: 'RSA-2048',
    badge: 'Legacy Standard',
    tag: 'PKCS#1 v1.5',
    desc: 'Traditional PKI infrastructure with broad support across legacy enterprise architectures.',
    icon: Lock,
    keySize: '2048-bit',
    sigSize: '256 bytes',
  },
];

const orgTypes = [
  {
    id: 'university',
    label: 'University / College',
    icon: GraduationCap,
    desc: 'Issue degrees, diplomas, and official academic marksheets.',
    namePlaceholder: 'e.g. Indian Institute of Technology Bombay',
    emailPlaceholder: 'e.g. registrar@iitb.ac.in',
  },
  {
    id: 'company',
    label: 'Company / Tech Employer',
    icon: Briefcase,
    desc: 'Issue verified internship certificates and experience letters.',
    namePlaceholder: 'e.g. Credify Technologies Inc. or Google India',
    emailPlaceholder: 'e.g. careers@credify.id or hr@company.com',
  },
  {
    id: 'hackathon',
    label: 'Hackathon / Organization',
    icon: Trophy,
    desc: 'Issue hackathon awards, bootcamp certificates, and badges.',
    namePlaceholder: 'e.g. ETHIndia, HackMIT, or Global Hackathon',
    emailPlaceholder: 'e.g. organizer@hackathon.org',
  },
];

export default function RegisterAuthority() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedAlgo, setSelectedAlgo] = useState('ed25519');
  const [selectedOrgType, setSelectedOrgType] = useState('university');
  const [orgName, setOrgName] = useState('');
  const [orgEmail, setOrgEmail] = useState('');

  const [result, setResult] = useState<{
    id: string;
    name: string;
    email: string;
    algorithm: string;
    publicKey: string;
    privateKey: string;
  } | null>(null);

  const currentOrgConfig = orgTypes.find(t => t.id === selectedOrgType) || orgTypes[0];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/institutions/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: orgName, email: orgEmail, algorithm: selectedAlgo }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Registration failed');
      setResult(json);
      // Cache institution info in sessionStorage for seamless workflow
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('credify_last_institution_id', json.id);
        sessionStorage.setItem('credify_last_private_key', json.privateKey);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const downloadKeyfile = () => {
    if (!result) return;
    const data = {
      institutionId: result.id,
      institutionName: result.name,
      adminEmail: result.email,
      algorithm: result.algorithm,
      publicKey: result.publicKey,
      privateKey: result.privateKey,
      generatedAt: new Date().toISOString(),
      notice: 'CONFIDENTIAL: Keep your private key secure. Credify operates on zero-knowledge and never stores private keys.',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credify_keys_${result.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleProceedToIssue = () => {
    router.push('/university/issue');
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Editorial Header */}
      <div className="text-center sm:text-left space-y-2">
        <div className="inline-flex items-center gap-2 bg-[#FEF9E5] text-[#8A5D08] border border-[#EAE0CE] rounded-full px-3.5 py-1 text-xs font-semibold shadow-2xs">
          <Building className="w-4 h-4 text-[#FBC02D]" />
          <span>Authority Provisioning</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#141619] tracking-tight">
          Register organization &amp; <mark className="highlight">generate keys</mark>
        </h1>
        <p className="text-sm text-[#716049] max-w-xl leading-relaxed">
          Provision an issuing authority (University, Tech Company, or Hackathon) with cryptographically unforgeable asymmetric keypairs.
        </p>
      </div>

      {/* Success Result View */}
      {result ? (
        <div className="bg-white border border-[#EAE0CE] rounded-3xl overflow-hidden shadow-warm-md space-y-6">
          {/* Header Banner */}
          <div className="p-6 sm:p-8 bg-[#F0FDF4] border-b border-[#BBF7D0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 bg-[#15803D] text-white rounded-2xl flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#14532D]">
                  Authority Successfully Registered
                </h2>
                <p className="text-xs text-[#166534] mt-0.5">
                  {result.name} &bull; <span className="font-mono font-bold uppercase">{result.algorithm}</span>
                </p>
              </div>
            </div>
            <button
              onClick={downloadKeyfile}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#BBF7D0] text-[#14532D] hover:bg-[#DCFCE7] text-xs font-bold rounded-xl shadow-warm-sm transition-all"
            >
              <Download className="w-4 h-4 text-[#15803D]" />
              <span>Download Key Bundle (.json)</span>
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6 pt-0">
            {/* Authority ID */}
            <div>
              <label className="block text-[11px] font-bold text-[#716049] uppercase tracking-wider mb-2">
                Authority Identifier (UUID)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={result.id}
                  className="flex-1 px-4 py-3 border border-[#EAE0CE] rounded-xl bg-[#FAF6EF] text-xs sm:text-sm font-mono text-[#141619] select-all"
                />
                <button
                  onClick={() => copyToClipboard(result.id, 'id')}
                  className="px-4 py-2.5 border border-[#EAE0CE] rounded-xl bg-white hover:bg-[#FAF6EF] text-xs font-bold text-[#141619] flex items-center gap-1.5 transition-all shadow-2xs"
                >
                  {copiedField === 'id' ? <Check className="w-4 h-4 text-[#15803D]" /> : <Copy className="w-4 h-4 text-[#716049]" />}
                  <span>{copiedField === 'id' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Public Key */}
            <div>
              <label className="block text-[11px] font-bold text-[#716049] uppercase tracking-wider mb-2">
                Public Key (Published on Verifier Network)
              </label>
              <div className="flex gap-2">
                <textarea
                  readOnly
                  value={result.publicKey}
                  rows={4}
                  className="flex-1 px-4 py-3 border border-[#EAE0CE] rounded-xl bg-[#FAF6EF] text-[11px] font-mono text-[#4F4232] resize-none select-all leading-relaxed"
                />
                <button
                  onClick={() => copyToClipboard(result.publicKey, 'pubkey')}
                  className="px-4 py-2.5 border border-[#EAE0CE] rounded-xl bg-white hover:bg-[#FAF6EF] text-xs font-bold text-[#141619] flex items-center gap-1.5 transition-all shadow-2xs h-fit"
                >
                  {copiedField === 'pubkey' ? <Check className="w-4 h-4 text-[#15803D]" /> : <Copy className="w-4 h-4 text-[#716049]" />}
                  <span>{copiedField === 'pubkey' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Private Key Warning Box */}
            <div className="border border-[#FDE68A] bg-[#FFFBEB] rounded-2xl p-6 space-y-3 shadow-warm-sm">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-[#B45309] flex-shrink-0" />
                <h3 className="text-xs font-bold text-[#92400E] uppercase tracking-wider">
                  Important: Save Your Cryptographic Private Key
                </h3>
              </div>
              <p className="text-xs text-[#92400E] leading-relaxed">
                Your private key is generated during registration and delivered securely over HTTPS. It is <strong>never stored on our servers</strong>. If you lose this key, you will not be able to sign certificates under this institution ID.
              </p>
              <div className="flex gap-2">
                <textarea
                  readOnly
                  value={result.privateKey}
                  rows={5}
                  className="flex-1 px-4 py-3 border border-[#FDE68A] rounded-xl bg-white text-[11px] font-mono text-[#141619] resize-none select-all"
                />
                <button
                  onClick={() => copyToClipboard(result.privateKey, 'privkey')}
                  className="px-4 py-2.5 border border-[#FDE68A] bg-white hover:bg-[#FEF9E5] text-xs font-bold text-[#92400E] rounded-xl flex items-center gap-1.5 transition-all shadow-2xs h-fit"
                >
                  {copiedField === 'privkey' ? <Check className="w-4 h-4 text-[#15803D]" /> : <Copy className="w-4 h-4 text-[#B45309]" />}
                  <span>{copiedField === 'privkey' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleProceedToIssue}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold rounded-xl text-white bg-[#181A1D] hover:bg-[#282B30] shadow-warm hover:-translate-y-0.5 transition-all"
              >
                <span>Proceed to Issue Signed Credentials</span>
                <ArrowRight className="w-4 h-4 text-[#FEF0C2]" />
              </button>
              <Link
                href="/university/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold rounded-xl text-[#141619] bg-[#FAF6EF] border border-[#EAE0CE] hover:bg-[#F4ECE0] transition-colors"
              >
                <span>View Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Registration Form */
        <div className="bg-white border border-[#EAE0CE] rounded-3xl p-6 sm:p-8 shadow-warm-md space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-4">
              {error}
            </div>
          )}

          {/* 1. Organization Type Selection Cards */}
          <div>
            <label className="block text-xs font-bold text-[#4F4232] uppercase tracking-wider mb-2.5">
              1. Select Organization Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {orgTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedOrgType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedOrgType(type.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#181A1D] bg-[#FEF9E5] ring-2 ring-[#181A1D]/10 shadow-warm-sm'
                        : 'border-[#EAE0CE] hover:border-[#D5C5AC] bg-[#FAF6EF]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-[#181A1D] text-[#FEF0C2]' : 'bg-white text-[#716049] border border-[#EAE0CE]'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-[#141619]">{type.label}</span>
                    </div>
                    <p className="text-[11px] text-[#716049] leading-relaxed">{type.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            {/* Organization Name */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="name" className="block text-xs font-bold text-[#4F4232] uppercase tracking-wider">
                  Organization / Company / College Name
                </label>
              </div>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF6EF] border border-[#EAE0CE] rounded-xl text-sm font-semibold text-[#141619] placeholder:text-[#948065] focus:bg-white focus:ring-2 focus:ring-[#FBC02D] transition-all"
                placeholder={currentOrgConfig.namePlaceholder}
              />
            </div>

            {/* Admin Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-[#4F4232] uppercase tracking-wider mb-2">
                Official Administrator / HR Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={orgEmail}
                onChange={(e) => setOrgEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF6EF] border border-[#EAE0CE] rounded-xl text-sm font-semibold text-[#141619] placeholder:text-[#948065] focus:bg-white focus:ring-2 focus:ring-[#FBC02D] transition-all"
                placeholder={currentOrgConfig.emailPlaceholder}
              />
            </div>

            {/* Algorithm Selector Cards */}
            <div>
              <label className="block text-xs font-bold text-[#4F4232] uppercase tracking-wider mb-2.5">
                Cryptographic Signature Scheme
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {algorithms.map((algo) => {
                  const Icon = algo.icon;
                  const isSelected = selectedAlgo === algo.id;
                  return (
                    <button
                      key={algo.id}
                      type="button"
                      onClick={() => setSelectedAlgo(algo.id)}
                      className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#181A1D] bg-[#FEF9E5]/60 ring-2 ring-[#181A1D]/10 shadow-warm-sm'
                          : 'border-[#EAE0CE] hover:border-[#D5C5AC] bg-[#FAF6EF]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-[#181A1D] text-[#FEF0C2]' : 'bg-white text-[#716049] border border-[#EAE0CE]'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                            isSelected ? 'bg-[#181A1D] text-white' : 'bg-white text-[#716049] border border-[#EAE0CE]'
                          }`}>
                            {algo.badge}
                          </span>
                        </div>

                        <h3 className={`text-sm font-bold ${isSelected ? 'text-[#141619]' : 'text-[#4F4232]'}`}>
                          {algo.name}
                        </h3>
                        <p className="text-[11px] text-[#948065] font-mono mt-0.5">{algo.tag}</p>
                        <p className="text-xs text-[#716049] mt-2 leading-relaxed">{algo.desc}</p>
                      </div>

                      <div className="pt-3 mt-4 border-t border-[#EAE0CE] grid grid-cols-2 text-[11px]">
                        <div>
                          <span className="text-[#948065] block text-[10px] uppercase font-semibold">Key</span>
                          <span className="font-mono font-bold text-[#141619]">{algo.keySize}</span>
                        </div>
                        <div>
                          <span className="text-[#948065] block text-[10px] uppercase font-semibold">Sig Size</span>
                          <span className="font-mono font-bold text-[#141619]">{algo.sigSize}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !orgName.trim() || !orgEmail.trim()}
              className="w-full py-3.5 bg-[#181A1D] text-white text-xs font-bold rounded-xl hover:bg-[#282B30] disabled:bg-[#EAE0CE] disabled:text-[#948065] disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-warm hover:-translate-y-0.5 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4 text-[#FEF0C2]" />}
              <span>{loading ? 'Generating Cryptographic Keypair...' : 'Register Authority & Provision Keypair'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
