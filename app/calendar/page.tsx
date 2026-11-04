import React from 'react';
import type { Metadata } from 'next';
import Calendar from '../components/Calendar';

export const metadata: Metadata = {
  title: 'Calendar',
  description:
    'Upcoming tech meetups, hack nights and workshops around the Monterey Bay, pulled from the community Discord calendar.',
};

const CalendarPage = () => {
  return (
    <div className='pb-10'>
      <div className='mx-auto w-full max-w-screen-lg px-4 pt-2 lg:px-8'>
        <header className='mb-6 max-w-2xl'>
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-[#0a6b53]'>
            Community calendar
          </p>
          <h1 className='mt-2 text-3xl font-bold tracking-tight text-[#0b1b33] sm:text-4xl'>
            Tech events around the Monterey Bay
          </h1>
          <p className='mt-2 text-base leading-relaxed text-[#5a6b85]'>
            Meetups, hack nights and talks pulled straight from our Discord.
            Click any event for the full details. Times are shown in your local
            timezone.
          </p>
        </header>
      </div>

      <Calendar />
    </div>
  );
};

export default CalendarPage;
