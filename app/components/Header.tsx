'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import Next.js Image component
import { usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // Get the current path

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className='text-white shadow-lg'>
      <div className='mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 lg:px-8'>
        {/* Logo with Image */}
        <Link href='/' className='text-2xl font-bold'>
          <div className='flex items-center'>
            <Image
              src='/assets/MBTM.jpg'
              alt='MBTM Logo'
              width={50} // Adjust width as needed
              height={50} // Adjust height as needed
              className='rounded-full mr-2' // Optional styling
            />
            <span className='ml-2' style={{ userSelect: 'none' }}>
              Monterey Bay Tech Meetup
            </span>
          </div>
        </Link>

        {/* Hamburger Menu for Mobile */}
        <div className='lg:hidden'>
          <button
            onClick={toggleMenu}
            className='text-white focus:outline-none'
            aria-label='Toggle menu'>
            {isOpen ? (
              <span>&#x2715; {/* X mark */}</span>
            ) : (
              <span>&#9776; {/* Hamburger icon */}</span>
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav
          className={`${
            isOpen ? 'block' : 'hidden'
          } lg:flex lg:space-x-4 items-center`}>
          <ul className='flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0'>
            <li>
              <Link
                href='/calendar'
                className={`nav-link rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#51ffcb] focus-visible:ring-offset-4 focus-visible:ring-offset-[#143b88] ${
                  pathname === '/calendar' ? 'active' : ''
                }`}>
                Calendar
              </Link>
            </li>
            <li>
              <Link
                href='/contact'
                className={`nav-link rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#51ffcb] focus-visible:ring-offset-4 focus-visible:ring-offset-[#143b88] ${
                  pathname === '/contact' ? 'active' : ''
                }`}>
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
