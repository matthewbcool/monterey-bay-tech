import About from '../app/about/page';
import OceanHero from '../app/components/ocean/OceanHero';
import { Metadata } from 'next';
interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  description: string;
  location: string;
}

export const metadata: Metadata = {
  title: 'Monterey Bay Tech Meetup',
  description:
    'Connecting and inspiring the tech community in the Monterey Bay area.',
};

export default async function Home() {
  return (
    <main>
      <OceanHero />
      <About />
    </main>
  );
}
