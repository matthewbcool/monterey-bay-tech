import React, { useState, useEffect } from 'react';

const images = [
  '/assets/2.jpg',
  '/assets/3.jpg',
  '/assets/4.jpg',
  '/assets/5.jpg',
  '/assets/6.jpg',
  '/assets/7.jpg',
  '/assets/8.jpg',
];

const Carousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='carousel-container relative w-full h-64 overflow-hidden'>
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}>
          <img
            src={image}
            alt={`Meetup ${index + 2}`}
            className='w-full h-full object-cover'
          />
        </div>
      ))}
    </div>
  );
};

export default Carousel;
