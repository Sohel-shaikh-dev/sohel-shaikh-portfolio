import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Sohel Shaikh | Data Analyst & BI Expert',
    template: '%s | Sohel Shaikh'
  },
  description: 'Portfolio of Sohel Shaikh, Professional Data Analyst specializing in Power BI, SQL, and Excel. Turning data into actionable insights.',
  keywords: ['Data Analyst', 'Power BI', 'SQL', 'Excel', 'Data Visualization', 'Business Intelligence', 'Portfolio', 'Sohel Shaikh'],
  authors: [{ name: 'Sohel Shaikh' }],
  creator: 'Sohel Shaikh',
  metadataBase: new URL('https://sohel-shaikh-portfolio.vercel.app'), // Replace with actual domain later
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sohel-shaikh-portfolio.vercel.app',
    title: 'Sohel Shaikh | Data Analyst & BI Expert',
    description: 'Professional Data Analyst specializing in Power BI, SQL, and Excel. Turning data into actionable insights.',
    siteName: 'Sohel Shaikh Portfolio',
    images: [
      {
        url: '/favicon.png', // Add a proper fallback OG image
        width: 800,
        height: 600,
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sohel Shaikh | Data Analyst & BI Expert',
    description: 'Professional Data Analyst specializing in Power BI, SQL, and Excel.',
  },
  icons: {
    icon: '/favicon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { getSocialLinks } from '@/app/(admin)/admin/(dashboard)/social-links/actions';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const socialLinksData = await getSocialLinks();
  const sameAs = socialLinksData?.filter((l: any) => l.is_active && l.url).map((l: any) => l.url) || [];

  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-background text-white antialiased overflow-x-hidden`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Sohel Shaikh",
              "url": "https://sohel-shaikh-portfolio.vercel.app",
              "jobTitle": "Data Analyst",
              "worksFor": {
                "@type": "Organization",
                "name": "AI Metaworld"
              },
              "sameAs": sameAs.length > 0 ? sameAs : undefined
            })
          }}
        />
        {children}
      </body>
    </html>
  );
}
