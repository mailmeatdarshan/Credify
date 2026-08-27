import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Playfair_Display, Lora } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});
const lora = Lora({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-lora",
});
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "Credify — Cryptographic Academic Credential Verification",
  description: "Cryptographic academic credential verification using RSA, ECC, and Ed25519 digital signatures. Capstone Engineering Project.",
  icons: {
    icon: "/credify.svg",
    shortcut: "/credify.svg",
    apple: "/credify.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#181A1D',
          colorText: '#141619',
          colorBackground: '#FFFFFF',
          borderRadius: '0.875rem',
        },
        elements: {
          avatarInitial: 'bg-[#FDE88A] text-[#181A1D] font-bold',
        },
      }}
    >
      <html lang="en" className={`${inter.variable} ${playfair.variable} ${lora.variable} ${jetbrains.variable}`}>
        <body className={`${inter.className} min-h-screen flex flex-col bg-white text-slate-900 antialiased`}>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
