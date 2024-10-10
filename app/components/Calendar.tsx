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

  useEffect(() => {
    const fetchEvents = async () => {
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

        setEvents(fullCalendarEvents); // Update the events state
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false); // Loading finished
      }
    };

    fetchEvents(); // Call the fetch function when the component mounts
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
    return <div>Loading events...</div>;
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
