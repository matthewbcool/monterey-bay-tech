'use client';

import React from 'react';
import Link from 'next/link';

const Contact: React.FC = () => {
  return (
    <div className='container mx-auto px-6 py-12'>
      <div className='text-center mt-6'>
        <Link
          href='https://discord.gg/5A2xxN8EnB'
          target='_blank'
          rel='noopener noreferrer'>
          <button className='bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700'>
            Join our Discord
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Contact;
