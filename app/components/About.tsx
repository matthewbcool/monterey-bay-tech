'use client';

import React from 'react';
import Carousel from './Carousel';
import SenderForm from './SenderForm';

const About: React.FC = () => {
  return (
    <div className='container mx-auto px-6 py-6'>
      <p className='text-lg mb-4 text-gray-700'>
        We bring together people passionate about technology in and around the
        beautiful Monterey Bay area.
      </p>

      <p className='text-lg mb-4 text-gray-700'>
        We believe that technology is for everyone and should put people first.
        Our goal is to create an inclusive, supportive environment that fosters
        learning and innovation. So whether you're a seasoned tech professional,
        a student just starting your tech journey, or someone who simply loves
        technology, this group is for you!
      </p>
      <Carousel />
      <p className='text-lg mb-4 text-gray-700'>
        We encourage members of all skill levels and interests in tech, be it
        AI, programming, software development, IT, hardware, cybersecurity, tech
        start-ups, or the latest gadgets. This is an open, welcoming space where
        you can share your work, ideas, and knowledge, gain insight from others,
        and stay updated on the latest in the tech world.
      </p>
      <div className='flex justify-center mt-8'>
        <SenderForm />
      </div>
    </div>
  );
};

export default About;
