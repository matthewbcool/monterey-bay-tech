'use client';

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  description: string;
  location: string;
}

interface CalendarProps {
  events: Event[];
}

const Calendar: React.FC<CalendarProps> = ({ events }) => {
  return (
    <div className='w-full max-w-screen-lg mx-auto px-4 lg:px-8'>
      <FullCalendar
        plugins={[dayGridPlugin, listPlugin]}
        initialView='dayGridMonth'
        events={events}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,listWeek',
        }}
        views={{
          dayGridMonth: {
            buttonText: 'Month',
          },
          listWeek: {
            buttonText: 'List',
          },
        }}
        height='auto'
        contentHeight='auto'
      />
    </div>
  );
};

export default Calendar;
