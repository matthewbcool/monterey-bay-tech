'use client';

import React from 'react';

const About: React.FC = () => {
  return (
    <div className='container mx-auto px-6 py-6'>
      <h1 className='text-4xl font-bold text-center mb-8 text-indigo-600'>
        About Monterey Bay Technology Meetup
      </h1>
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
      <p className='text-lg mb-4 text-gray-700'>
        We encourage members of all skill levels and interests in tech, be it
        AI, programming, software development, IT, hardware, cybersecurity, tech
        start-ups, or the latest gadgets. This is an open, welcoming space where
        you can share your work, ideas, and knowledge, gain insight from others,
        and stay updated on the latest in the tech world.
      </p>

      <h2 className='text-2xl font-semibold mt-6 mb-4 text-indigo-600'>
        Our Meetings Include:
      </h2>

      <ul className='list-disc list-inside text-lg text-gray-700 space-y-2'>
        <li>
          <strong>Tech Talks:</strong> Presentations from members or guest
          speakers showcasing their work, and discussing recent advancements or
          trends in technology.
        </li>
        <li>
          <strong>Workshops:</strong> Hands-on sessions aimed at learning new
          skills or improving existing ones. Bring your laptop and an eagerness
          to learn!
        </li>
        <li>
          <strong>Socials:</strong> Opportunities to connect, share ideas,
          collaborate on projects. Maybe create your own startup. Why not?
        </li>
        <li>
          <strong>Show and Tell:</strong> A platform to share your latest
          projects, be it an app you've built, a gadget you've tweaked, or a
          complex problem you've solved.
        </li>
      </ul>

      <p className='text-lg mt-6 text-gray-700'>
        We look forward to welcoming you to our community and can't wait to see
        what innovative ideas and projects you'll bring to the Monterey Bay
        Technology Meetup!
      </p>
    </div>
  );
};

export default About;
