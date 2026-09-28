import React from 'react';

export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`glass-panel rounded-2xl p-6 transition-all duration-300 hover:border-gold/30 hover:shadow-gold ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
