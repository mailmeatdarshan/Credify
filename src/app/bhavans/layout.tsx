/* eslint-disable @next/next/no-page-custom-font, @next/next/google-font-display */
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Bharatiya Vidya Bhavan's M. M. College Of Arts, N. M. Institute Of Science & Commerce | Autonomous",
  description: "Official portal of Bharatiya Vidya Bhavan's M. M. College, Andheri (West), Mumbai. Re-accredited 'A' Grade by NAAC. Empowered Autonomous Institution 2026-36.",
};

export default function BhavansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Noto+Serif:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
