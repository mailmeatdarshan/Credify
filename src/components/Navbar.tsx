'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, LogIn, Building, FileCheck, KeyRound } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import CredifyLogo from '@/components/CredifyLogo';

const NAV_LINKS = [
  { label: 'Verify', href: '/verify', badge: 'Public' },
  { label: 'Dashboard', href: '/university/dashboard' },
  { label: 'Issue Credentials', href: '/university/issue' },
  { label: 'Register Org', href: '/university/register' },
  { label: 'Crypto Lab', href: '/benchmark' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 inset-x-0 h-20 sm:h-22 bg-[#FDE98A] z-50 border-b border-black/10 transition-all flex items-center">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 w-full">
        <div className="flex items-center justify-between">
          {/* Outwrite-Style Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group active:scale-95 transition-transform">
            <div className="w-8 h-8 rounded-full bg-[#181A1D] flex items-center justify-center text-[#FDE98A] shadow-xs group-hover:scale-105 transition-transform p-1.5">
              <CredifyLogo className="w-full h-full text-[#FDE98A]" />
            </div>
            <span className="font-serif text-2xl sm:text-[26px] font-medium text-[#181A1D] tracking-normal">
              Credify
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {NAV_LINKS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && item.href !== '/university' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-[13.5px] transition-all duration-150 active:scale-95 select-none inline-flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-black/10 text-[#181A1D] font-bold shadow-2xs ring-1 ring-black/5'
                      : 'text-[#181A1D]/80 hover:text-[#181A1D] hover:bg-black/5 font-medium'
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <Link
              href="/verify"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-[#1E2229] hover:bg-[#2B303A] active:scale-95 active:bg-black rounded-lg shadow-sm hover:shadow transition-all ml-1 cursor-pointer select-none"
            >
              Verify Now
            </Link>

            {/* Clerk Authentication Controls - Clean Minimalist Avatar (No boxy background) */}
            <div className="ml-2 pl-2 border-l border-black/15 flex items-center">
              <SignedOut>
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#181A1D] bg-black/10 hover:bg-black/15 border border-black/15 hover:border-black/25 rounded-full shadow-2xs active:scale-95 transition-all cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 text-[#181A1D]" />
                    <span>Sign In</span>
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <div className="flex items-center">
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        userButtonTrigger: 'p-0 bg-transparent border-none focus:outline-none focus:ring-0 active:scale-95 transition-transform cursor-pointer',
                        userButtonBox: 'p-0 bg-transparent border-none',
                        userButtonAvatarBox: 'w-9 h-9 ring-2 ring-black/25 hover:ring-black/50 rounded-full overflow-hidden shadow-xs hover:scale-105 transition-all bg-gradient-to-br from-[#FDE047] to-[#EAB308]',
                        avatarBox: 'w-9 h-9',
                        avatarInitial: 'bg-gradient-to-br from-[#FDE047] to-[#EAB308] text-[#181A1D] font-black text-sm',
                        userButtonPopoverCard: 'border border-[#EAE0CE] shadow-warm-xl rounded-3xl bg-[#FEFDF8] p-3 text-[#141619]',
                        userPreviewMainIdentifier: 'font-serif font-bold text-base text-[#141619]',
                        userPreviewSecondaryIdentifier: 'text-xs text-[#716049] font-medium',
                        userPreviewAvatarBox: 'w-12 h-12 ring-2 ring-black/20 rounded-full overflow-hidden shadow-warm-sm bg-[#FDE047]',
                        userButtonPopoverActionButton: 'hover:bg-black/5 rounded-xl text-xs font-semibold text-[#141619]',
                        userButtonPopoverActionButtonText: 'text-xs font-semibold text-[#141619]',
                        userButtonPopoverActionButtonIcon: 'text-[#8A5D08]',
                        userButtonPopoverFooter: 'border-t border-[#EAE0CE] mt-2 pt-2',
                      },
                    }}
                  >
                    <UserButton.MenuItems>
                      <UserButton.Link
                        label="Authority Dashboard"
                        href="/university/dashboard"
                        labelIcon={<Building className="w-4 h-4 text-[#8A5D08]" />}
                      />
                      <UserButton.Link
                        label="Issue Credentials"
                        href="/university/issue"
                        labelIcon={<FileCheck className="w-4 h-4 text-[#15803D]" />}
                      />
                      <UserButton.Link
                        label="Register Authority"
                        href="/university/register"
                        labelIcon={<KeyRound className="w-4 h-4 text-[#B45309]" />}
                      />
                    </UserButton.MenuItems>
                  </UserButton>
                </div>
              </SignedIn>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: 'w-8 h-8 ring-2 ring-black/20 rounded-full bg-[#FDE047]',
                    avatarInitial: 'bg-[#FDE047] text-[#181A1D] font-bold',
                  },
                }}
              />
            </SignedIn>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 text-[#181A1D] hover:bg-black/5 active:scale-95 rounded-xl transition-all"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#FDE98A] border-b border-black/10 px-6 py-5 space-y-2 shadow-lg">
          {NAV_LINKS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block text-base py-2.5 px-3.5 rounded-lg transition-all active:scale-98 ${
                  isActive
                    ? 'bg-black/10 text-[#181A1D] font-bold'
                    : 'text-[#181A1D]/80 hover:text-[#181A1D] hover:bg-black/5 font-medium'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="pt-3 space-y-2">
            <Link
              href="/verify"
              className="block w-full text-center py-3 text-sm font-bold text-white bg-[#1E2229] hover:bg-[#2B303A] active:scale-98 rounded-lg shadow-sm"
              onClick={() => setIsOpen(false)}
            >
              Verify Credential
            </Link>

            <SignedOut>
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="block w-full text-center py-2.5 text-xs font-bold text-[#181A1D] bg-black/10 hover:bg-black/15 border border-black/15 rounded-full shadow-2xs"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In to Authority Console
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      )}
    </header>
  );
}
