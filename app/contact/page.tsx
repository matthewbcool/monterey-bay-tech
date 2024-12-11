'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AvatarSpheres from '../components/AvatarSpheres';

interface Member {
  id: string;
  username: string;
  avatar_url: string;
  status: string;
}

const Contact: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch('/api/member-count');
        if (!response.ok) {
          throw new Error('Failed to fetch members');
        }

        const data = await response.json();
        setMembers(data.members || []); // Ensure members is an array
        setLoading(false);
      } catch (error) {
        console.error('Error fetching members:', error);
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const avatars = members.map((member) => ({
    url: member.avatar_url,
    username: member.username,
  }));

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
      <div className='mt-12'>
        <h2 className='text-2xl font-bold text-center mb-6'>Members Online</h2>
        {loading ? (
          <p className='text-center'>Loading...</p>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
            {members.map((member) => (
              <div key={member.id} className='text-center'>
                <img
                  src={member.avatar_url}
                  alt={member.username}
                  className='w-24 h-24 rounded-full mx-auto mb-2'
                />
                <p className='text-lg font-semibold'>{member.username}</p>
                <p className='text-sm text-gray-500'>{member.status}</p>
              </div>
            ))}
          </div>
        )}
        <div className='mt-12'>
          <AvatarSpheres avatars={avatars} />
        </div>
      </div>
    </div>
  );
};

export default Contact;
