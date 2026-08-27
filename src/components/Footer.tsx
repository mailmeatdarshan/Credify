'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import CredifyLogo from '@/components/CredifyLogo';
import { Check, ChevronUp, Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi (हिंदी)', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish (Español)', flag: '🇪🇸' },
  { code: 'fr', name: 'French (Français)', flag: '🇫🇷' },
  { code: 'de', name: 'German (Deutsch)', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese (日本語)', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese (中文)', flag: '🇨🇳' },
];

export default function Footer() {
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          {/* Brand & Socials Column */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-full bg-[#181A1D] flex items-center justify-center text-[#FDE98A] p-1 shadow-xs group-hover:scale-105 transition-transform">
                <CredifyLogo className="w-full h-full text-[#FDE98A]" />
              </div>
              <span className="font-serif text-xl font-bold text-[#181A1D] tracking-tight">
                Credify
              </span>
            </Link>

            <p className="text-xs text-[#716049] leading-relaxed">
              Cryptographic academic credential verification and digital PKI infrastructure.
            </p>

            <div className="flex items-center gap-2.5 pt-2 text-[#716049]">
              {/* GitHub Official SVG Icon */}
              <a
                href="https://github.com/mailmeatdarshan/Credify"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#181A1D] hover:bg-[#181A1D] hover:text-white transition-all shadow-2xs group"
                title="GitHub"
                aria-label="GitHub Repository"
              >
                <svg
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>

              {/* Twitter / X SVG Icon */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#181A1D] hover:bg-[#181A1D] hover:text-white transition-all shadow-2xs"
                title="Twitter / X"
                aria-label="Twitter Profile"
              >
                <svg
                  className="w-3.5 h-3.5 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* LinkedIn SVG Icon */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#181A1D] hover:bg-[#181A1D] hover:text-white transition-all shadow-2xs"
                title="LinkedIn"
                aria-label="LinkedIn Profile"
              >
                <svg
                  className="w-3.5 h-3.5 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 1: PROJECT */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#181A1D] uppercase tracking-wider font-mono">
              Project
            </h4>
            <ul className="space-y-2.5 text-xs text-[#716049]">
              <li><Link href="/" className="hover:text-[#181A1D] transition-colors">Overview</Link></li>
              <li><Link href="/benchmark" className="hover:text-[#181A1D] transition-colors">Research &amp; Benchmarks</Link></li>
              <li><Link href="/verify" className="hover:text-[#181A1D] transition-colors">Security Architecture</Link></li>
              <li><Link href="/benchmark" className="hover:text-[#181A1D] transition-colors">GradeProof Engine</Link></li>
            </ul>
          </div>

          {/* Column 2: PRODUCT */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#181A1D] uppercase tracking-wider font-mono">
              Product
            </h4>
            <ul className="space-y-2.5 text-xs text-[#716049]">
              <li><Link href="/verify" className="hover:text-[#181A1D] transition-colors">Verify Certificate</Link></li>
              <li><Link href="/benchmark" className="hover:text-[#181A1D] transition-colors">Crypto Lab</Link></li>
              <li><Link href="/university/dashboard" className="hover:text-[#181A1D] transition-colors">Authority Console</Link></li>
              <li><Link href="/university/issue" className="hover:text-[#181A1D] transition-colors">Batch Issuance</Link></li>
            </ul>
          </div>

          {/* Column 3: AUTHORITIES */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#181A1D] uppercase tracking-wider font-mono">
              Authorities
            </h4>
            <ul className="space-y-2.5 text-xs text-[#716049]">
              <li><Link href="/university/register" className="hover:text-[#181A1D] transition-colors">Register University</Link></li>
              <li><Link href="/university/register" className="hover:text-[#181A1D] transition-colors">Register Company</Link></li>
              <li><Link href="/university/issue" className="hover:text-[#181A1D] transition-colors">Issue Credentials</Link></li>
              <li><Link href="/verify" className="hover:text-[#181A1D] transition-colors">Revocation Check</Link></li>
            </ul>
          </div>

          {/* Column 4: PLATFORMS */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#181A1D] uppercase tracking-wider font-mono">
              Cryptosystems
            </h4>
            <ul className="space-y-2.5 text-xs text-[#716049]">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <Link href="/verify" className="hover:text-[#181A1D] transition-colors">PDF Transcripts</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <Link href="/verify" className="hover:text-[#181A1D] transition-colors">Camera QR Scanner</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <Link href="/benchmark" className="hover:text-[#181A1D] transition-colors">Ed25519 Engine</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <Link href="/university/dashboard" className="hover:text-[#181A1D] transition-colors">Public Key Registry</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#716049]">
          <p>© {new Date().getFullYear()} Credify. All rights reserved.</p>

          <p className="flex items-center gap-1.5 text-[#716049]">
            <span>Capstone Engineering Project</span>
            <span className="text-slate-300">•</span>
            <span>Zero-Knowledge Digital Credential System</span>
          </p>

          {/* Interactive Functional Language Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              type="button"
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[#181A1D] font-semibold text-xs transition-colors cursor-pointer"
              aria-expanded={isLangOpen}
              aria-label="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#716049]" />
              <span>{selectedLang.flag}</span>
              <span>{selectedLang.name}</span>
              <ChevronUp className={`w-3.5 h-3.5 text-[#716049] transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangOpen && (
              <div className="absolute bottom-full mb-2 right-0 w-48 bg-white border border-[#EAE0CE] rounded-2xl shadow-warm-lg py-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold text-[#948065] uppercase tracking-wider border-b border-[#EAE0CE]">
                  Select Language
                </div>
                <div className="max-h-56 overflow-y-auto py-1">
                  {LANGUAGES.map((lang) => {
                    const isSelected = selectedLang.code === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setSelectedLang(lang);
                          setIsLangOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-[#FEF9E5] text-[#8A5D08] font-bold'
                            : 'text-[#141619] hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#8A5D08]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
