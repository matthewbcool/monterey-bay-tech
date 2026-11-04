import type { Metadata } from 'next';
import About from '../components/About';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Who we are: an inclusive Monterey Bay tech community for engineers, students, founders and the tech-curious, meeting for talks, hack nights and workshops.',
};

export default function AboutPage() {
  return <About />;
}
