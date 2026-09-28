import React from 'react';

export default function Badge({ children, variant = 'gold', className = '', ...props }) {
  const variants = {
    gold: 'bg-gold/15 text-gold border-gold/30',
    info: 'bg-info/15 text-info border-info/30',
    success: 'bg-success/15 text-success border-success/30',
    amber: 'bg-amber/15 text-amber border-amber/30',
    danger: 'bg-danger/15 text-danger border-danger/30'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        variants[variant] || variants.gold
      } ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
