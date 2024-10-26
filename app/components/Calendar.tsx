'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import EventModal from './EventModal'; // Assuming you have an EventModal component

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
    localStorage.setItem('events', JSON.stringify(events));
  };

  const loadEventsFromLocalStorage = () => {
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      return JSON.parse(storedEvents);
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
          console.log('Events:', data); // Log the fetched events

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

  const handleEventClick = (clickInfo: any) => {
    const clickedEvent = events.find(
      (event) => event.id === clickInfo.event.id
    );
    if (clickedEvent) {
      console.log('Selected Event:', clickedEvent); // Log the clicked event for debugging
      setSelectedEvent(clickedEvent); // Set the selected event for the modal
      setModalOpen(true); // Open the modal
    }
  };

  if (loading) {
    return (
      <div className='loading'>
        <h3>Loading</h3>
        <svg
          version='1.1'
          id='Layer_1'
          xmlns='http://www.w3.org/2000/svg'
          xmlnsXlink='http://www.w3.org/1999/xlink'
          x='0px'
          y='0px'
          width='24px'
          height='30px'
          viewBox='0 0 24 30'
          xmlSpace='preserve'>
          <rect x='0' y='13' width='4' height='5' fill='#333'>
            <animate
              attributeName='height'
              attributeType='XML'
              values='5;21;5'
              begin='0s'
              dur='0.6s'
              repeatCount='indefinite'
            />
            <animate
              attributeName='y'
              attributeType='XML'
              values='13; 5; 13'
              begin='0s'
              dur='0.6s'
              repeatCount='indefinite'
            />
          </rect>
          <rect x='10' y='13' width='4' height='5' fill='#333'>
            <animate
              attributeName='height'
              attributeType='XML'
              values='5;21;5'
              begin='0.15s'
              dur='0.6s'
              repeatCount='indefinite'
            />
            <animate
              attributeName='y'
              attributeType='XML'
              values='13; 5; 13'
              begin='0.15s'
              dur='0.6s'
              repeatCount='indefinite'
            />
          </rect>
          <rect x='20' y='13' width='4' height='5' fill='#333'>
            <animate
              attributeName='height'
              attributeType='XML'
              values='5;21;5'
              begin='0.3s'
              dur='0.6s'
              repeatCount='indefinite'
            />
            <animate
              attributeName='y'
              attributeType='XML'
              values='13; 5; 13'
              begin='0.3s'
              dur='0.6s'
              repeatCount='indefinite'
            />
          </rect>
        </svg>
      </div>
    );
  }

  return (
    <div className='w-full max-w-screen-lg mx-auto px-4 lg:px-8'>
      <FullCalendar
        plugins={[dayGridPlugin, listPlugin]} // Add necessary FullCalendar plugins
        initialView='dayGridMonth' // Set the initial view to month
        events={events} // Pass the mapped events to FullCalendar
        eventClick={handleEventClick} // Handle event clicks to open modal
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
