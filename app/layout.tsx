import type { Metadata, Viewport } from 'next';
import Header from './components/Header';
import Footer from './components/Footer';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#04222f',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.montereybaytech.org'),
  title: {
    default: 'Monterey Bay Tech',
    template: '%s | Monterey Bay Tech',
  },
  description:
    'An inclusive tech community around Monterey Bay — online most of the time, in person when we can, building Cozy Webgame together.',
  openGraph: {
    type: 'website',
    siteName: 'Monterey Bay Tech',
    title: 'Monterey Bay Tech',
    description:
      'An inclusive tech community around Monterey Bay — online most of the time, in person when we can, building Cozy Webgame together.',
    url: '/',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className='flex flex-col min-h-screen'>
        <Header />
        <main className='flex-grow'>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
