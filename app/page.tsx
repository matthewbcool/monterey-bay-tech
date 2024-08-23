import Calendar from './components/Calendar';

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  description: string;
  location: string;
}

const fetchEvents = async (): Promise<Event[]> => {
  // Replace with your actual data fetching logic
  const dummyEvents: Event[] = [
    {
      id: '1',
      title: 'AI Ethics Discussion',
      start: '2024-08-25T10:00:00',
      end: '2024-08-25T11:30:00',
      description: 'A roundtable discussion on AI ethics and its implications.',
      location: 'Mozilla AI Discord - #general',
    },
    {
      id: '2',
      title: 'Machine Learning Workshop',
      start: '2024-08-26T14:00:00',
      end: '2024-08-26T16:00:00',
      description: 'Hands-on workshop on building ML models.',
      location: 'Mozilla AI Discord - #workshops',
    },
    {
      id: '3',
      title: 'AI Research Paper Review',
      start: '2024-08-27T12:00:00',
      end: '2024-08-27T13:00:00',
      description: 'Review of the latest research papers in AI.',
      location: 'Mozilla AI Discord - #research',
    },
    {
      id: '4',
      title: 'Community AMA with AI Experts',
      start: '2024-08-28T17:00:00',
      end: '2024-08-28T18:00:00',
      description:
        'Ask Me Anything session with AI experts from the community.',
      location: 'Mozilla AI Discord - #ama',
    },
    {
      id: '5',
      title: 'Weekly Team Sync',
      start: '2024-08-29T09:00:00',
      end: '2024-08-29T09:30:00',
      description: 'Weekly sync meeting for the Mozilla AI team.',
      location: 'Mozilla AI Discord - #team-sync',
    },
  ];

  return dummyEvents;
};

export default async function Home() {
  const events = await fetchEvents();

  return (
    <main>
      <div>
        <Calendar events={events} />
      </div>
    </main>
  );
}
