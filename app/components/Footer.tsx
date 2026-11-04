'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className='bg-[#0f2e63] text-white/80'>
      <div className='mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm sm:flex-row lg:px-8'>
        <p>
          {year ? `© ${year} Monterey Bay Tech Meetup` : 'Monterey Bay Tech Meetup'}
        </p>
        <nav aria-label='Footer'>
          <Link
            href='/contact'
            className='font-semibold text-white underline-offset-4 transition hover:text-[#51ffcb] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#51ffcb] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f2e63]'>
            Contact us
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
