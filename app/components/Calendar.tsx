'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import type { EventClickArg, EventContentArg } from '@fullcalendar/core';
import EventModal from './EventModal'; // Assuming you have an EventModal component
import './calendar-theme.css';

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  description: string;
  location?: string; // Optional, may not be present for some events
  name: string;
  scheduled_start_time: string;
  scheduled_end_time?: string; // Optional
  entity_metadata?: {
    location?: string; // Optional for EXTERNAL events
  };
}

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const storeEventsInLocalStorage = (events: Event[]) => {
    try {
      localStorage.setItem('events', JSON.stringify(events));
    } catch {
      // Private mode / storage full - the calendar still works from memory.
    }
  };

  const loadEventsFromLocalStorage = (): Event[] | null => {
    try {
      const storedEvents = localStorage.getItem('events');
      if (storedEvents) {
        return JSON.parse(storedEvents);
      }
    } catch {
      // Malformed cache - treat it as empty.
    }
    return null;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      // Generate a random delay for the fetch request so it's not too frequent. I think we are hitting the rate limit?
      const randomDelay = Math.random() * (3000 - 300) + 500;

      setTimeout(async () => {
        try {
          const response = await fetch('/api/discord-events'); // Fetch from the API route
          if (!response.ok) {
            throw new Error('Failed to fetch events');
          }

          const data = await response.json();

          // Map the Discord events to FullCalendar's expected format
          const fullCalendarEvents = data.map((event: any) => ({
            id: event.id,
            title: event.name, // FullCalendar expects `title`
            start: event.scheduled_start_time, // FullCalendar expects `start`
            end: event.scheduled_end_time, // FullCalendar expects `end`
            description: event.description, // For the modal
            location: event.entity_metadata?.location || 'Online', // Pass location to modal
            entity_metadata: event.entity_metadata || {}, // Ensure metadata is passed fully
            scheduled_start_time: event.scheduled_start_time, // Pass original start time to modal
            scheduled_end_time: event.scheduled_end_time, // Pass original end time to modal
          }));
          // Store events in localStorage after fetching
          storeEventsInLocalStorage(fullCalendarEvents);
          setEvents(fullCalendarEvents); // Update the events state
        } catch (error) {
          const localEvents = loadEventsFromLocalStorage();
          console.error(
            'Loading events from local storage: Fetch error: ',
            error
          );
          if (localEvents) {
            console.log('Loaded events from localStorage');
            setEvents(localEvents);
          } else {
            console.log('No events found in localStorage');
          }
        } finally {
          setLoading(false); // Loading finished
        }
      }, randomDelay);
    };

    fetchEvents();
  }, []);

  const handleEventClick = (clickInfo: EventClickArg) => {
    const clickedEvent = events.find(
      (event) => event.id === clickInfo.event.id
    );
    if (clickedEvent) {
      setSelectedEvent(clickedEvent); // Set the selected event for the modal
      setModalOpen(true); // Open the modal
    }
  };

  if (loading) {
    return (
      <div className='calendar-shell w-full max-w-screen-lg mx-auto px-4 lg:px-8'>
        <div className='calendar-card' aria-busy='true'>
          <div className='calendar-skeleton__toolbar'>
            <div className='calendar-skeleton__pill calendar-skeleton__pill--wide' />
            <div className='calendar-skeleton__pill calendar-skeleton__pill--narrow' />
          </div>
          <div className='calendar-skeleton__grid'>
            {Array.from({ length: 35 }).map((_, index) => (
              <div key={index} className='calendar-skeleton__cell'>
                <div className='calendar-skeleton__line calendar-skeleton__line--short' />
                {index % 5 === 1 && (
                  <div className='calendar-skeleton__line calendar-skeleton__line--event' />
                )}
              </div>
            ))}
          </div>
          <span className='sr-only'>Loading Monterey local tech events</span>
        </div>
      </div>
    );
  }

  return (
    <div className='calendar-shell w-full max-w-screen-lg mx-auto px-4 lg:px-8'>
      <div className='calendar-card'>
        <FullCalendar
          plugins={[dayGridPlugin, listPlugin]} // Add necessary FullCalendar plugins
          initialView='dayGridMonth' // Set the initial view to month
          events={events} // Pass the mapped events to FullCalendar
          eventClick={handleEventClick} // Handle event clicks to open modal
          eventContent={(arg: EventContentArg) =>
            arg.view.type.startsWith('dayGrid') ? (
              <div className='fc-event-chip'>
                {arg.timeText && (
                  <span className='fc-event-chip__time'>{arg.timeText}</span>
                )}
                <span className='fc-event-chip__title'>
                  {arg.event.title}
                </span>
              </div>
            ) : (
              <span>{arg.event.title}</span>
            )
          }
          eventDidMount={(info) => {
            // Full titles are truncated in month cells, so keep them on hover.
            info.el.setAttribute('title', info.event.title);
          }}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short',
            omitZeroMinute: true,
          }}
          dayMaxEvents={3} // Collapse busy days into a "+N more" link
          fixedWeekCount={false} // No empty trailing week
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,listWeek',
          }}
          buttonText={{
            today: 'Today',
            month: 'Month',
            week: 'Week',
            day: 'Day',
            list: 'List',
          }}
          views={{
            dayGridMonth: {
              buttonText: 'Month',
            },
            listWeek: {
              buttonText: 'List',
            },
          }}
          moreLinkText={(count) => `+${count} more`}
          height='auto'
          contentHeight='auto'
        />
      </div>
      {selectedEvent && (
        <EventModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)} // Close the modal when clicking "close"
          event={selectedEvent} // Pass the selected event to the modal
        />
      )}
    </div>
  );
};

export default Calendar;
