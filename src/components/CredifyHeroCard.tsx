'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { RefreshCw, ShieldCheck, AlertOctagon, Lock } from 'lucide-react';
import CredifyLogo from '@/components/CredifyLogo';

export default function CredifyHeroCard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gpaRef = useRef<HTMLSpanElement>(null);
  const restoreBtnRef = useRef<HTMLButtonElement>(null);

  // States
  const [displayGpa, setDisplayGpa] = useState('8.85');
  const [isSelected, setIsSelected] = useState(false);
  const [isTampered, setIsTampered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [activeTab, setActiveTab] = useState<'ed25519' | 'p256' | 'rsa'>('ed25519');
  const [isHovered, setIsHovered] = useState(false);

  // Cursor coordinates (Hotspot is top-left tip of arrow (0,0))
  const [cursorPos, setCursorPos] = useState({ x: 320, y: 200, opacity: 0.3 });

  // Move cursor with precision anchor targeting
  const moveCursorTo = useCallback((targetEl: HTMLElement | null, offsetX = 0, offsetY = 0) => {
    if (!containerRef.current || !targetEl) return;
    const cRect = containerRef.current.getBoundingClientRect();
    const tRect = targetEl.getBoundingClientRect();
    // Anchor cursor tip directly to target element
    const x = tRect.left - cRect.left + offsetX;
    const y = tRect.top - cRect.top + offsetY;
    setCursorPos({ x, y, opacity: 1 });
  }, []);

  // Animation timeline loop
  useEffect(() => {
    if (isHovered) return; // Pause smoothly on user hover

    let cancelled = false;

    const runTimeline = async () => {
      // PHASE 0: Authentic Baseline (Resting)
      if (cancelled) return;
      setIsTampered(false);
      setIsSelected(false);
      setDisplayGpa('8.85');
      setCursorPos({ x: 340, y: 220, opacity: 0.35 });

      await new Promise((r) => setTimeout(r, 2200));
      if (cancelled) return;

      // PHASE 1: Move Mac cursor smoothly to the GPA text
      moveCursorTo(gpaRef.current, 14, 4);

      await new Promise((r) => setTimeout(r, 750));
      if (cancelled) return;

      // PHASE 2: Click and highlight selection
      setIsClicking(true);
      setShowRipple(true);
      setIsSelected(true);
      setTimeout(() => {
        setIsClicking(false);
        setShowRipple(false);
      }, 250);

      await new Promise((r) => setTimeout(r, 500));
      if (cancelled) return;

      // PHASE 3: Typing fake value '9.95'
      setIsSelected(false);

      // Backspace simulation
      setDisplayGpa('8.8');
      await new Promise((r) => setTimeout(r, 100));
      if (cancelled) return;
      setDisplayGpa('8.');
      await new Promise((r) => setTimeout(r, 100));
      if (cancelled) return;
      setDisplayGpa('');
      await new Promise((r) => setTimeout(r, 150));
      if (cancelled) return;

      // Type 9.95
      setDisplayGpa('9');
      await new Promise((r) => setTimeout(r, 110));
      if (cancelled) return;
      setDisplayGpa('9.');
      await new Promise((r) => setTimeout(r, 110));
      if (cancelled) return;
      setDisplayGpa('9.9');
      await new Promise((r) => setTimeout(r, 110));
      if (cancelled) return;
      setDisplayGpa('9.95');

      // Trigger cryptographic mismatch alarm
      setIsTampered(true);

      // Move cursor down slightly towards popover
      setCursorPos((prev) => ({ x: prev.x + 18, y: prev.y + 38, opacity: 0.85 }));

      await new Promise((r) => setTimeout(r, 2600));
      if (cancelled) return;

      // PHASE 4: Move cursor to 'Restore Proof' button
      moveCursorTo(restoreBtnRef.current, 24, 6);

      await new Promise((r) => setTimeout(r, 750));
      if (cancelled) return;

      // PHASE 5: Click Restore Button
      setIsClicking(true);
      setShowRipple(true);
      setTimeout(() => {
        setIsClicking(false);
        setShowRipple(false);
      }, 250);

      await new Promise((r) => setTimeout(r, 200));
      if (cancelled) return;

      // Reset to authentic
      setIsTampered(false);
      setDisplayGpa('8.85');

      // Move cursor away to corner
      setCursorPos((prev) => ({ x: prev.x + 35, y: prev.y + 20, opacity: 0.3 }));

      await new Promise((r) => setTimeout(r, 2200));
      if (cancelled) return;

      // Repeat loop
      runTimeline();
    };

    runTimeline();

    return () => {
      cancelled = true;
    };
  }, [isHovered, moveCursorTo]);

  // Hash string
  const hash = useMemo(() => {
    if (isTampered) {
      return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    }
    return '7d1a2f4c9e8b0a3d5f6e7c8b9a0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d';
  }, [isTampered]);

  const handleManualTamper = () => {
    setIsTampered(!isTampered);
    setDisplayGpa(isTampered ? '8.85' : '9.95');
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white rounded-3xl shadow-2xl p-6 sm:p-7 border border-[#EAE0CE] max-w-md w-full relative text-left select-none transition-shadow duration-300 hover:shadow-warm-lg"
    >
      {/* Top Banner: Academic PKI Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#EAE0CE]/70">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#FEF9E5] text-[#8A5D08] border border-[#FDE68A] flex items-center justify-center font-bold text-xs shadow-2xs">
            🎓
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#181A1D]">IIT Bombay Certificate</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isTampered ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
            </div>
            <div className="text-[10px] font-mono text-[#716049]">ROOT-PKI-2024-ED25519</div>
          </div>
        </div>

        {/* Algorithm Switcher */}
        <div className="flex items-center gap-1 bg-[#FAF6EF] p-1 rounded-xl border border-[#EAE0CE] text-[10px] font-mono font-bold text-[#716049]">
          {(['ed25519', 'p256', 'rsa'] as const).map((algo) => (
            <button
              key={algo}
              type="button"
              onClick={() => setActiveTab(algo)}
              className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                activeTab === algo
                  ? 'bg-white text-[#181A1D] shadow-2xs border border-[#EAE0CE] font-extrabold'
                  : 'hover:text-[#181A1D]'
              }`}
            >
              {algo.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Document Body - Fixed Baseline Layout to Prevent Any Wobbling */}
      <div className="space-y-4 text-sm text-[#2B3037] leading-relaxed font-sans relative">
        <p className="text-[13.5px] sm:text-sm leading-relaxed min-h-[44px]">
          Conferred to student{' '}
          <span className="font-bold text-[#181A1D] border-b border-black/20 pb-0.5">
            Darshan Dubey
          </span>{' '}
          for completing{' '}
          <span className="font-bold text-[#181A1D]">B.Tech Computer Science</span> with
          Cumulative GPA{' '}
          {/* Zero-Layout-Shift Rigid Container */}
          <span
            ref={gpaRef}
            className={`inline-flex items-center justify-center min-w-[54px] h-[26px] px-2 rounded-md font-mono font-bold text-center tabular-nums transition-colors duration-200 align-middle ${
              isSelected
                ? 'bg-[#0078D4] text-white ring-2 ring-[#0078D4]/60'
                : isTampered
                ? 'bg-red-100 text-red-700 ring-2 ring-red-400 ring-offset-1 underline decoration-wavy decoration-red-500'
                : 'bg-emerald-100/90 text-emerald-900 border border-emerald-300/80 shadow-2xs'
            }`}
          >
            <span>{displayGpa}</span>
            {/* Blinking Cursor caret when deleting/typing */}
            {displayGpa !== '8.85' && !isTampered && (
              <span className="w-0.5 h-3.5 bg-black inline-block ml-0.5 animate-pulse" />
            )}
          </span>
          .
        </p>

        {/* Cryptographic Proof Box - Fixed Height & Rigid Bounds */}
        <div
          className={`border rounded-2xl p-4 space-y-2.5 transition-colors duration-300 min-h-[148px] flex flex-col justify-between ${
            isTampered
              ? 'bg-red-50/90 border-red-300 shadow-sm'
              : 'bg-[#FAF6EF] border-[#EAE0CE] shadow-sm'
          }`}
        >
          {/* Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full transition-all shrink-0 ${
                  isTampered ? 'bg-red-600 animate-ping' : 'bg-emerald-600'
                }`}
              />
              <span
                className={`font-serif text-xs font-bold transition-colors ${
                  isTampered ? 'text-red-900' : 'text-[#181A1D]'
                }`}
              >
                {isTampered
                  ? '🚨 Cryptographic Hash Mismatch!'
                  : '✓ Zero-Trust Signature Verified'}
              </span>
            </div>

            <span className="text-[9.5px] font-mono text-[#716049] uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-md border border-[#EAE0CE] shrink-0">
              {activeTab === 'ed25519'
                ? '64-Byte Ed25519'
                : activeTab === 'p256'
                ? 'DER NIST P-256'
                : '2048-Bit RSA'}
            </span>
          </div>

          {/* Live Hash String */}
          <div
            className={`font-mono text-[10.5px] p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-between gap-2 overflow-hidden ${
              isTampered
                ? 'bg-white text-red-800 border-red-200'
                : 'bg-white text-[#4A4031] border-[#EAE0CE]'
            }`}
          >
            <div className="truncate flex-1">
              <span className="font-bold opacity-60">SHA-256: </span>
              <span className="font-semibold">{hash}</span>
            </div>
            <Lock
              className={`w-3.5 h-3.5 shrink-0 ${
                isTampered ? 'text-red-500' : 'text-[#8A5D08]'
              }`}
            />
          </div>

          {/* Bottom Verification & Action Button */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold">
              {isTampered ? (
                <span className="text-red-700 flex items-center gap-1">
                  <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                  <span>PKI Signature Invalidated</span>
                </span>
              ) : (
                <span className="text-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>100% Authentic Record</span>
                </span>
              )}
            </div>

            {/* Restore / Simulate Action Button */}
            <button
              ref={restoreBtnRef}
              type="button"
              onClick={handleManualTamper}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                isClicking
                  ? 'scale-95 bg-black text-white'
                  : isTampered
                  ? 'bg-[#181A1D] text-white border-black hover:bg-black shadow-xs'
                  : 'bg-white text-[#716049] border-[#EAE0CE] hover:text-[#181A1D] hover:bg-[#FAF6EF]'
              }`}
            >
              <RefreshCw
                className={`w-3 h-3 ${isTampered ? 'text-[#FDE98A]' : ''}`}
              />
              <span>{isTampered ? 'Restore Proof' : 'Simulate Tamper'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official macOS Solid Black Pointer Cursor */}
      <div
        style={{
          transform: `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0)`,
          opacity: cursorPos.opacity,
        }}
        className="absolute top-0 left-0 pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-40 select-none"
      >
        <div className="relative">
          {/* Authentic macOS Solid Black Arrow Vector with White Border */}
          <svg
            className={`w-5 h-6 transition-transform duration-100 drop-shadow-[0_2px_5px_rgba(0,0,0,0.45)] ${
              isClicking ? 'scale-90 translate-y-0.5' : 'scale-100'
            }`}
            viewBox="0 0 17 24"
            fill="none"
          >
            <path
              d="M0.5 0.5V19.5L5.5 14.5L9 22L12 20.5L8.5 13L15 13L0.5 0.5Z"
              fill="#000000"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>

          {/* Subtle Click Ripple Indicator */}
          {showRipple && (
            <span className="absolute top-0 left-0 w-6 h-6 rounded-full bg-black/20 animate-ping pointer-events-none -translate-x-1 -translate-y-1" />
          )}
        </div>
      </div>

      {/* Fully Visible Credify Seal Stamp - Placed securely on bottom right */}
      <div className="absolute -bottom-3 -right-3 w-9 h-9 rounded-full bg-[#181A1D] border-2 border-white shadow-lg flex items-center justify-center p-2 text-[#FDE98A] z-30 transition-transform hover:scale-105">
        <CredifyLogo className="w-full h-full text-[#FDE98A]" />
      </div>

      {/* Live Status Footnote */}
      <div className="flex items-center justify-between pt-4 text-[10px] text-[#716049] font-sans border-t border-[#EAE0CE]/50 mt-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-[#181A1D]">Real-Time PKI Sentinel</span>
        </div>
        <span className="font-mono text-[9px] text-[#948065]">
          {isHovered ? 'Paused on Hover' : 'Autonomous Simulation Loop'}
        </span>
      </div>
    </div>
  );
}
