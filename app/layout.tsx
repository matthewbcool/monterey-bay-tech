import type { Metadata } from 'next';
import Header from './components/Header';
import Footer from './components/Footer';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.montereybaytech.org'),
  title: {
    default: 'Monterey Bay Tech Meetup',
    template: '%s | Monterey Bay Tech Meetup',
  },
  description:
    'Meetups, hack nights, talks and workshops for the tech community around the Monterey Bay.',
  openGraph: {
    type: 'website',
    siteName: 'Monterey Bay Tech Meetup',
    title: 'Monterey Bay Tech Meetup',
    description:
      'Meetups, hack nights, talks and workshops for the tech community around the Monterey Bay.',
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
