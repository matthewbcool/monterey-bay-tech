'use client';

import React from 'react';
import Link from 'next/link';

const Contact: React.FC = () => {
  return (
    <div className='container mx-auto px-6 py-12'>
      <h1 className='text-4xl font-bold text-center mb-8 text-indigo-600'>
        Contact Us
      </h1>
      <p className='text-lg mb-4 text-gray-700'>
        We'd love to hear from you! Whether you have questions, suggestions, or
        just want to chat, feel free to reach out.
      </p>

      <div className='text-center mt-6'>
        <Link
          href='https://discord.gg/your-discord-link'
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
