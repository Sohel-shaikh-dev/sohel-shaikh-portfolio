'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ClientBackButton({ fallbackHref = '/#projects', text = 'Back to Portfolio' }) {
  const router = useRouter();
  
  return (
    <a 
      href={fallbackHref}
      onClick={(e) => {
        e.preventDefault();
        if (typeof window !== 'undefined') {
          const referrer = document.referrer;
          const origin = window.location.origin;
          // Only use history.back() if the user came directly from the home page.
          // This prevents history.back() from going to another project if they navigated Project A -> Project B.
          if (referrer === origin + '/' || referrer === origin + '/#projects' || referrer === origin + '/#casestudy') {
            window.history.back();
          } else {
            router.push(fallbackHref);
          }
        }
      }}
      className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold uppercase tracking-widest text-xs mb-10 group"
    >
      <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> {text}
    </a>
  );
}
