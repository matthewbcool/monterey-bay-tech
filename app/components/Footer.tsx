'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className='bg-gray-800 text-white py-4 mt-auto'>
      <div className='container mx-auto text-center'>
        {year && (
          <p className='text-sm mb-2'>
            &copy; {year} Monterey Bay Tech Meetup. All rights reserved.
          </p>
        )}
        <p className='text-sm'>
          <Link href='/contact' className='hover:text-gray-400'>
            Contact Us
          </Link>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
