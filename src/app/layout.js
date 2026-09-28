import './globals.css';
import StyledJsxRegistry from '@/components/StyledJsxRegistry';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import TeleportOverlay from '@/components/TeleportOverlay';
import { STRUCTURED_DATA } from '@/lib/structuredData';

const TITLE = "Akira's Code Cave — Full-Stack Engineering Archive";

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%230a0907'/%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23ff6b35;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23d94d1f;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='serif' font-weight='700' font-size='18' fill='url(%23grad)'%3EA%3C/text%3E%3C/svg%3E";

export const metadata = {
  title: TITLE,
  description:
    'A curated archive of shipped full-stack systems, AI-powered SaaS platforms, ML pipelines, and developer tooling.',
  robots: { index: false, follow: false },
  icons: { icon: { url: FAVICON, type: 'image/svg+xml' } },
  openGraph: {
    type: 'website',
    siteName: "Akira's Code Cave",
    url: 'https://www.coreyscodecave.com/',
    title: TITLE,
    description:
      'Ten shipped projects spanning AI SaaS, fintech platforms, ML pipelines, developer tooling, and consultancy services. Built solo. Deployed in production.',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description:
      'Staff software engineer with 13 years building search and data systems across finance, telecom, and healthcare.',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0907',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
        <StyledJsxRegistry>
          <div style={{ display: 'block', minHeight: '100vh' }}>
            <Nav />
            {children}
            <Footer />
            <TeleportOverlay />
          </div>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
