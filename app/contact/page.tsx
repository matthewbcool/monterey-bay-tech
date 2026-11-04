import type { Metadata } from 'next';
import Contact from '../components/Contact';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Join the Monterey Bay Tech Discord, meet the community, and find out how to reach the organizers.',
};

export default function ContactPage() {
  return <Contact />;
}
