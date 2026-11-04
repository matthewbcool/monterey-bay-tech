import type { Metadata } from 'next';
import About from '../components/About';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Who we are: an inclusive, mostly-online Monterey Bay tech community for engineers, students, founders and the tech-curious, building Cozy Webgame together.',
};

export default function AboutPage() {
  return <About />;
}
