import Calendar from './components/Calendar';
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
      <div>
        <Calendar />
      </div>
    </main>
  );
}
