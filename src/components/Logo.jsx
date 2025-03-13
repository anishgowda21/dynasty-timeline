import React from 'react';

const Logo = ({ className, size = 32 }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Timeline vertical line */}
      <line x1="12" y1="3" x2="12" y2="21" strokeWidth="1.5" />
      
      {/* Crown on top */}
      <path d="M8 6L12 2L16 6" />
      <path d="M8 6C8 6 9 9 12 9C15 9 16 6 16 6" />
      
      {/* Time markers */}
      <line x1="8" y1="12" x2="16" y2="12" strokeWidth="1.5" />
      <circle cx="8" cy="12" r="1" fill="currentColor" />
      <circle cx="16" cy="12" r="1" fill="currentColor" />
      
      {/* Dynasty marker */}
      <rect x="10" y="15" width="4" height="4" rx="1" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" />
    </svg>
  );
};

export default Logo;
