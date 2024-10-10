'use client';

import React from 'react';
import { DateTime } from 'luxon';
import ReactMarkdown from 'react-markdown'; // Import react-markdown for markdown rendering

interface Event {
  id: string;
  name: string;
  scheduled_start_time: string;
  scheduled_end_time?: string; // Optional
  description?: string; // Optional
  entity_metadata?: {
    location?: string; // Optional for EXTERNAL events
  };
}

interface EventModalProps {
  isOpen: boolean; // Whether the modal is open or closed
  onClose: () => void; // Function to close the modal
  event: Event; // The event to display in the modal
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, event }) => {
  if (!isOpen) return null; // Don't render the modal if it's not open

  // Parse dates using Luxon
  const startDate = DateTime.fromISO(event.scheduled_start_time);
  const endDate = event.scheduled_end_time
    ? DateTime.fromISO(event.scheduled_end_time)
    : null;

  // Check if dates are valid (Luxon provides a .isValid property)
  const isValidStartDate = startDate.isValid;
  const isValidEndDate = endDate?.isValid || false;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative'>
        {/* Close Button */}
        <button
          className='absolute top-3 right-3 text-gray-500 hover:text-gray-800'
          onClick={onClose}>
          ✕
        </button>

        {/* Event Info */}
        <div className='flex items-center mb-4'>
          <div className='text-2xl text-indigo-600 mr-2'>📅</div>
          <h2 className='text-2xl font-bold'>{event.name}</h2>
        </div>

        <div className='mb-4 text-gray-600'>
          {/* Date and Time */}
          {isValidStartDate && (
            <>
              <p>
                <span className='font-bold'>Date:</span>{' '}
                {startDate.toLocaleString(DateTime.DATE_MED)}
              </p>
              <p>
                <span className='font-bold'>Time:</span>{' '}
                {startDate.toLocaleString(DateTime.TIME_SIMPLE)}
              </p>
            </>
          )}

          {/* End Time (optional) */}
          {isValidEndDate && (
            <p>
              <span className='font-bold'>End Time:</span>{' '}
              {endDate?.toLocaleString(DateTime.TIME_SIMPLE)}
            </p>
          )}

          {/* Conditionally render location as a clickable link */}
          {event.entity_metadata?.location && (
            <p>
              <span className='font-bold'>Event Link:</span>{' '}
              <a
                href={event.entity_metadata.location}
                target='_blank'
                rel='noopener noreferrer'
                className='text-indigo-600 underline hover:text-indigo-800'>
                {event.entity_metadata.location}
              </a>
            </p>
          )}
        </div>

        {/* Conditionally render description with Markdown */}
        {event.description && (
          <div className='mb-4 text-gray-600'>
            <ReactMarkdown>{event.description}</ReactMarkdown>
          </div>
        )}

        <div className='flex justify-end space-x-3'>
          <button
            className='bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300'
            onClick={onClose}>
            Close
          </button>
          <button className='bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700'>
            Interested
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
