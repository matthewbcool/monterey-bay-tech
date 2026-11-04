'use client';

import React from 'react';
import Carousel from './Carousel';
import SenderForm from './SenderForm';

const About: React.FC = () => {
  return (
    <div className='bg-[#f4f7fa]'>
      {/* The hero's deep water carries into the page instead of ending in a hard
          seam, so the photo strip below reads as part of the same surface. */}
      <div
        aria-hidden='true'
        className='h-16 w-full bg-gradient-to-b from-[#031d28] via-[#0a3a4b]/60 to-transparent sm:h-24'
      />

      <section
        aria-labelledby='about-heading'
        className='mx-auto w-full max-w-6xl px-6 pb-16 lg:px-8'>
        <div className='grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16'>
          <div>
            <p className='text-[11px] font-bold uppercase tracking-[0.22em] text-[#0f6b58]'>
              Who we are
            </p>
            <h2
              id='about-heading'
              className='mt-3 text-3xl font-bold leading-tight tracking-tight text-[#0a1f2e] sm:text-4xl'>
              A local tech community, on the edge of the Pacific.
            </h2>
            <p className='mt-5 text-lg leading-relaxed text-[#33475f]'>
              We bring together people passionate about technology in and around
              the beautiful Monterey Bay area.
            </p>
          </div>

          <div className='space-y-5 text-[15px] leading-relaxed text-[#33475f] lg:pt-8'>
            <p>
              We believe that technology is for everyone and should put people
              first. Our goal is to create an inclusive, supportive environment
              that fosters learning and innovation. Whether you&rsquo;re a
              seasoned professional, a student just starting out, or someone who
              simply loves technology, this group is for you.
            </p>
            <p>
              Members of every skill level and interest are welcome — AI,
              programming, software development, IT, hardware, cybersecurity,
              startups or the latest gadgets. It&rsquo;s an open space to share
              your work, swap ideas and stay current with the tech world.
            </p>
          </div>
        </div>

        <div className='mt-12 sm:mt-14'>
          <Carousel />
        </div>

        <div className='mt-14 flex justify-center'>
          <SenderForm />
        </div>
      </section>
    </div>
  );
};

export default About;
