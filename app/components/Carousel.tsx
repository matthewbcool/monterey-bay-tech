'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const images = [
  { src: '/assets/2.jpg', alt: 'Members talking at a Monterey Bay Tech gathering' },
  { src: '/assets/3.jpg', alt: 'A speaker presenting to the room' },
  { src: '/assets/4.jpg', alt: 'Attendees gathered around laptops' },
  { src: '/assets/5.jpg', alt: 'Small groups chatting after a presentation' },
  { src: '/assets/6.jpg', alt: 'A demo being shown on a projector screen' },
  { src: '/assets/7.jpg', alt: 'Members arriving at the venue before a gathering' },
  { src: '/assets/8.jpg', alt: 'The room during a presentation' },
];

const INTERVAL = 6000;

const Carousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches || paused) return;

    timer.current = setInterval(() => {
      setCurrentIndex((index) => (index + 1) % images.length);
    }, INTERVAL);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused]);

  return (
    <figure
      className='relative overflow-hidden rounded-3xl bg-[#e3edf1] shadow-[0_28px_60px_-30px_rgba(4,34,47,0.45)] ring-1 ring-[#04222f]/10'
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}>
      <div className='relative aspect-[16/10] w-full sm:aspect-[21/9]'>
        {images.map((image, index) => (
          <div
            key={image.src}
            aria-hidden={index !== currentIndex}
            className={`absolute inset-0 transition-opacity duration-[900ms] ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}>
            <Image
              src={image.src}
              alt={index === currentIndex ? image.alt : ''}
              fill
              sizes='(min-width: 1024px) 1024px, 100vw'
              className='object-cover'
              priority={index === 0}
            />
          </div>
        ))}

        {/* The caption sits on a soft gradient so it reads over any photo. */}
        <div
          aria-hidden='true'
          className='absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#04222f]/85 via-[#04222f]/35 to-transparent'
        />

        <figcaption className='absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 px-5 pb-5 sm:px-7 sm:pb-6'>
          <div>
            <p className='text-[11px] font-bold uppercase tracking-[0.2em] text-[#8ff5da]'>
              When we meet in person
            </p>
            <p className='mt-1 max-w-md text-sm font-medium text-white sm:text-base'>
              Mixers and tech presentations — the handful of times we&rsquo;ve
              all been in one room.
            </p>
          </div>

          <div className='flex items-center gap-1.5'>
            {images.map((image, index) => (
              <button
                key={image.src}
                type='button'
                onClick={() => setCurrentIndex(index)}
                aria-label={`Show photo ${index + 1} of ${images.length}`}
                aria-current={index === currentIndex}
                className={`h-1.5 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#51ffcb] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04222f] ${
                  index === currentIndex
                    ? 'w-6 bg-[#51ffcb]'
                    : 'w-1.5 bg-white/45 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </figcaption>
      </div>
    </figure>
  );
};

export default Carousel;
