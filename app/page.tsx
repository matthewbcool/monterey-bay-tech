import Calendar from './components/Calendar';

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  description: string;
  location: string;
}

export default async function Home() {
  return (
    <main>
      <div>
        <Calendar />
      </div>
    </main>
  );
}
