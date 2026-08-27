import { SignUp } from '@clerk/nextjs';
import { ShieldCheck } from 'lucide-react';

export default function SignUpPage() {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-[#FEF9E5] text-[#8A5D08] border border-[#EAE0CE] rounded-full px-3.5 py-1 text-xs font-semibold shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-[#FBC02D]" />
          <span>New Authority Onboarding</span>
        </div>
        <h1 className="font-serif text-3xl font-extrabold text-[#141619] tracking-tight">
          Create <mark className="highlight">Authority Account</mark>
        </h1>
        <p className="text-xs text-[#716049] max-w-xs mx-auto">
          Register with Google, Microsoft, or email to start issuing mathematically unforgeable verifiable credentials.
        </p>
      </div>

      <div className="flex justify-center w-full">
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          appearance={{
            elements: {
              card: 'border border-[#EAE0CE] shadow-warm-md rounded-3xl bg-white',
              headerTitle: 'font-serif text-[#141619]',
              formButtonPrimary: 'bg-[#181A1D] hover:bg-[#282B30] text-white text-xs font-bold rounded-xl shadow-warm',
              socialButtonsBlockButton: 'border border-[#EAE0CE] hover:bg-[#FAF6EF] rounded-xl text-xs font-semibold',
              formFieldInput: 'border border-[#EAE0CE] rounded-xl bg-[#FAF6EF] focus:bg-white text-xs font-semibold',
              footerActionLink: 'text-[#8A5D08] font-bold hover:underline',
            },
          }}
        />
      </div>
    </div>
  );
}
