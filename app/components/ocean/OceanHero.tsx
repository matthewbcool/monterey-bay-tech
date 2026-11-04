'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// R3F touches window/WebGL, so it is only ever loaded in the browser.
const OceanScene = dynamic(() => import('./OceanScene'), { ssr: false });

const DISCORD_INVITE = 'https://discord.gg/5A2xxN8EnB';

const supportsWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return Boolean(window.WebGLRenderingContext && gl);
  } catch {
    return false;
  }
};

const prefersLessData = () => {
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  return Boolean(connection?.saveData);
};

const OceanHero: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const [compact, setCompact] = useState(false);
  const [canRender, setCanRender] = useState(false);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const widthQuery = window.matchMedia('(max-width: 640px)');

    const syncMotion = () => setReducedMotion(motionQuery.matches);
    const syncWidth = () => setCompact(widthQuery.matches);

    syncMotion();
    syncWidth();

    motionQuery.addEventListener('change', syncMotion);
    widthQuery.addEventListener('change', syncWidth);

    return () => {
      motionQuery.removeEventListener('change', syncMotion);
      widthQuery.removeEventListener('change', syncWidth);
    };
  }, []);

  useEffect(() => {
    setCanRender(supportsWebGL() && !prefersLessData());
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    // If the hero is already on screen at mount, start immediately rather
    // than waiting for the observer's first callback.
    if (node.getBoundingClientRect().top < window.innerHeight) {
      setInView(true);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const showScene = Boolean(canRender && inView && reducedMotion === false);
  const sceneActive = showScene && ready;

  return (
    <section
      ref={sectionRef}
      aria-labelledby='ocean-hero-heading'
      className='relative isolate -mt-8 overflow-hidden bg-[#04222f] text-white'>
      {/* Decorative backdrop: poster first, live scene on top once it is ready. */}
      <div className='absolute inset-0' aria-hidden='true'>
        <div className='absolute inset-0 bg-gradient-to-br from-[#04222f] via-[#063344] to-[#0a4d56]' />
        <Image
          src='/assets/ocean-hero-poster.jpg'
          alt=''
          fill
          priority
          sizes='100vw'
          className={`object-cover transition-opacity duration-700 ${
            sceneActive ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </div>

      <div className='absolute inset-0' aria-hidden='true'>
        {showScene && (
          <div
            className={`h-full w-full transition-opacity duration-1000 ${
              ready ? 'opacity-100' : 'opacity-0'
            }`}>
            <OceanScene
              paused={paused}
              compact={compact}
              onReady={() => setReady(true)}
            />
          </div>
        )}
      </div>

      {/* Scrim keeps the copy readable over kelp, jellies and the otter. */}
      <div
        aria-hidden='true'
        className='absolute inset-0 bg-gradient-to-r from-[#02141c]/92 via-[#02141c]/55 to-transparent'
      />
      <div
        aria-hidden='true'
        className='absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[#031a24]/85'
      />

      <div className='relative mx-auto flex min-h-[600px] w-full max-w-6xl flex-col justify-end px-6 pb-14 pt-24 sm:min-h-[640px] sm:justify-center sm:pb-20 lg:px-8'>
        <div className='max-w-xl'>
          <p className='flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#8ff5da]'>
            <span
              aria-hidden='true'
              className='inline-block h-1.5 w-1.5 rounded-full bg-[#51ffcb]'
            />
            Monterey Bay Tech Meetup
          </p>

          <h1
            id='ocean-hero-heading'
            className='mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl'>
            A tech community with the ocean in its backyard.
          </h1>

          <p className='mt-5 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg'>
            Meetups, hack nights and workshops across Monterey Bay. Come for the
            code, stay for the people.
          </p>

          <div className='mt-8 flex flex-col gap-3 sm:flex-row sm:items-center'>
            <a
              href='/calendar'
              className='inline-flex items-center justify-center gap-2 rounded-full bg-[#51ffcb] px-6 py-3 text-sm font-bold text-[#04222f] transition hover:bg-[#8ff5da] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#51ffcb] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04222f]'>
              See upcoming events
              <svg
                aria-hidden='true'
                viewBox='0 0 20 20'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='h-4 w-4'>
                <path d='M4 10h11M11 5l5 5-5 5' />
              </svg>
            </a>

            <a
              href={DISCORD_INVITE}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center justify-center gap-2 rounded-full border border-white/35 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/70 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#04222f]'>
              Join the Discord
            </a>
          </div>

          <div className='mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/85'>
            {sceneActive && (
              <button
                type='button'
                onClick={() => setPaused((value) => !value)}
                aria-pressed={paused}
                className='inline-flex items-center gap-2 rounded-full border border-white/40 px-3 py-1.5 font-semibold text-white transition hover:border-white/70 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#51ffcb] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04222f]'>
                {paused ? (
                  <svg
                    aria-hidden='true'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    className='h-3 w-3'>
                    <path d='M6 3l11 7-11 7Z' />
                  </svg>
                ) : (
                  <svg
                    aria-hidden='true'
                    viewBox='0 0 20 20'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2.5'
                    className='h-3 w-3'>
                    <path d='M6 4v12M14 4v12' />
                  </svg>
                )}
                {paused ? 'Play scene' : 'Pause scene'}
              </button>
            )}

            <p className='max-w-sm leading-relaxed'>
              {sceneActive
                ? 'Animated: a sea otter floats at the surface above swaying giant kelp and moon jellies.'
                : 'Illustration: a sea otter floats at the surface above swaying giant kelp and moon jellies.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OceanHero;
