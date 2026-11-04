'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { DateTime } from 'luxon';
import ReactMarkdown from 'react-markdown';
import { downloadEventIcs } from '../lib/event-ics';

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

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

const CalendarIcon = () => (
  <svg
    aria-hidden='true'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.8'
    strokeLinecap='round'
    strokeLinejoin='round'
    className='h-4 w-4'>
    <rect x='3' y='5' width='18' height='16' rx='2' />
    <path d='M8 3v4M16 3v4M3 11h18' />
  </svg>
);

const ClockIcon = () => (
  <svg
    aria-hidden='true'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.8'
    strokeLinecap='round'
    strokeLinejoin='round'
    className='h-4 w-4'>
    <circle cx='12' cy='12' r='9' />
    <path d='M12 7v5l3 2' />
  </svg>
);

const PinIcon = () => (
  <svg
    aria-hidden='true'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.8'
    strokeLinecap='round'
    strokeLinejoin='round'
    className='h-4 w-4'>
    <path d='M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z' />
    <circle cx='12' cy='10' r='2.5' />
  </svg>
);

const ExternalIcon = () => (
  <svg
    aria-hidden='true'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.8'
    strokeLinecap='round'
    strokeLinejoin='round'
    className='h-4 w-4'>
    <path d='M14 4h6v6M20 4l-9 9' />
    <path d='M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5' />
  </svg>
);

const DownloadIcon = () => (
  <svg
    aria-hidden='true'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='1.8'
    strokeLinecap='round'
    strokeLinejoin='round'
    className='h-4 w-4'>
    <path d='M12 3v12M7 10l5 5 5-5M5 21h14' />
  </svg>
);

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, event }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  // Keep the latest onClose without re-running the open effect on every parent render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const handleDownload = useCallback(() => {
    downloadEventIcs(event);
  }, [event]);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const onKeyDown = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key === 'Escape') {
        keyEvent.preventDefault();
        onCloseRef.current();
        return;
      }

      if (keyEvent.key !== 'Tab' || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (keyEvent.shiftKey && document.activeElement === first) {
        keyEvent.preventDefault();
        last.focus();
      } else if (!keyEvent.shiftKey && document.activeElement === last) {
        keyEvent.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null; // Don't render the modal if it's not open

  // Parse dates using Luxon
  const startDate = DateTime.fromISO(event.scheduled_start_time);
  const endDate = event.scheduled_end_time
    ? DateTime.fromISO(event.scheduled_end_time)
    : null;

  // Check if dates are valid (Luxon provides a .isValid property)
  const isValidStartDate = startDate.isValid;
  const isValidEndDate = Boolean(endDate?.isValid);

  const isSameDay =
    isValidStartDate &&
    isValidEndDate &&
    endDate?.hasSame(startDate, 'day');

  const location = event.entity_metadata?.location?.trim();
  const isUrlLocation = location ? /^https?:\/\//i.test(location) : false;

  const timeLabel = isValidStartDate
    ? `${startDate.toLocaleString(DateTime.TIME_SIMPLE)}${
        isValidEndDate
          ? ` – ${
              isSameDay
                ? endDate!.toLocaleString(DateTime.TIME_SIMPLE)
                : endDate!.toLocaleString(DateTime.DATETIME_MED)
            }`
          : ''
      }`
    : null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-end justify-center bg-[#0b1b33]/60 p-0 backdrop-blur-sm sm:items-center sm:p-6'
      onClick={(clickEvent) => {
        // Only a click on the backdrop itself closes the modal.
        if (clickEvent.target === clickEvent.currentTarget) onClose();
      }}>
      <div
        ref={panelRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby={`event-title-${event.id}`}
        className='relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[85vh] sm:max-w-2xl sm:rounded-2xl'>
        {/* Brand accent */}
        <div className='h-1.5 w-full flex-none bg-gradient-to-r from-[#0a3346] via-[#0a3346] to-[#51ffcb]' />

        <div className='flex items-start gap-4 px-6 pb-4 pt-5 sm:px-8'>
          <div className='flex h-16 w-16 flex-none flex-col items-center justify-center rounded-xl bg-[#eef4ff] text-[#0a3346]'>
            {isValidStartDate ? (
              <>
                <span className='text-[0.65rem] font-bold uppercase tracking-[0.12em]'>
                  {startDate.toLocaleString({ month: 'short' })}
                </span>
                <span className='text-2xl font-bold leading-none'>
                  {startDate.toFormat('d')}
                </span>
              </>
            ) : (
              <CalendarIcon />
            )}
          </div>

          <div className='min-w-0 flex-1'>
            <h2
              id={`event-title-${event.id}`}
              className='text-xl font-bold leading-tight text-[#0b1b33] sm:text-2xl'>
              {event.name}
            </h2>
            {isValidStartDate && (
              <p className='mt-1 text-sm font-medium text-[#5a6b85]'>
                {startDate.toLocaleString(DateTime.DATE_HUGE)}
              </p>
            )}
          </div>

          <button
            ref={closeButtonRef}
            type='button'
            aria-label='Close event details'
            onClick={onClose}
            className='-mr-1 flex h-9 w-9 flex-none items-center justify-center rounded-full text-[#5a6b85] transition hover:bg-[#f2f6fd] hover:text-[#0a3346] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a3346] focus-visible:ring-offset-2'>
            <svg
              aria-hidden='true'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              className='h-4 w-4'>
              <path d='M6 6l12 12M18 6L6 18' />
            </svg>
          </button>
        </div>

        <div className='flex-1 overflow-y-auto px-6 pb-2 sm:px-8'>
          <dl className='space-y-3 border-t border-[#e4e9f2] pt-4 text-sm'>
            {timeLabel && (
              <div className='flex items-start gap-3'>
                <dt className='mt-0.5 flex-none text-[#5a6b85]'>
                  <ClockIcon />
                  <span className='sr-only'>Time</span>
                </dt>
                <dd className='font-medium text-[#0b1b33]'>{timeLabel}</dd>
              </div>
            )}

            {location && (
              <div className='flex items-start gap-3'>
                <dt className='mt-0.5 flex-none text-[#5a6b85]'>
                  <PinIcon />
                  <span className='sr-only'>
                    {isUrlLocation ? 'Event link' : 'Location'}
                  </span>
                </dt>
                <dd className='min-w-0 font-medium text-[#0b1b33]'>
                  {isUrlLocation ? (
                    <a
                      href={location}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='break-all text-[#0a3346] underline decoration-[#0a3346]/30 underline-offset-2 hover:decoration-[#0a3346] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a3346] focus-visible:ring-offset-2'>
                      {location}
                    </a>
                  ) : (
                    location
                  )}
                </dd>
              </div>
            )}
          </dl>

          {event.description && (
            <div className='mt-4 border-t border-[#e4e9f2] pt-4 text-sm leading-relaxed text-[#44536c] [&_a]:text-[#0a3346] [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded [&_code]:bg-[#f2f6fd] [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.8em] [&_h1]:mb-2 [&_h1]:mt-4 [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-[#0b1b33] [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-[#0b1b33] [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:font-semibold [&_h3]:text-[#0b1b33] [&_li]:mb-1 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-[#0b1b33] [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5'>
              <ReactMarkdown
                components={{
                  a: ({ node, ...props }) => (
                    <a
                      {...props}
                      target='_blank'
                      rel='noopener noreferrer'
                    />
                  ),
                }}>
                {event.description}
              </ReactMarkdown>
            </div>
          )}
        </div>

        <div className='mt-2 flex flex-col-reverse gap-2 border-t border-[#e4e9f2] bg-[#f8fafd] px-6 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-8'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-full px-4 py-2.5 text-sm font-semibold text-[#5a6b85] transition hover:bg-[#eef2f8] hover:text-[#0b1b33] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a3346] focus-visible:ring-offset-2'>
            Close
          </button>

          <button
            type='button'
            onClick={handleDownload}
            className='inline-flex items-center justify-center gap-2 rounded-full border border-[#d8e0ee] bg-white px-4 py-2.5 text-sm font-semibold text-[#0a3346] transition hover:border-[#c4d1e6] hover:bg-[#f2f6fd] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a3346] focus-visible:ring-offset-2'>
            <DownloadIcon />
            Add to calendar
          </button>

          {isUrlLocation && location && (
            <a
              href={location}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center justify-center gap-2 rounded-full bg-[#0a3346] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f2e63] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a3346] focus-visible:ring-offset-2'>
              <ExternalIcon />
              Open event link
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventModal;
