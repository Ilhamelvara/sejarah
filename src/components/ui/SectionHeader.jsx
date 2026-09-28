import React from 'react';

export default function SectionHeader({ label, title, subtitle, className = '' }) {
  return (
    <div className={`text-center max-w-3xl mx-auto mb-12 ${className}`}>
      {label && (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-widest text-gold bg-gold/10 border border-gold/20 uppercase mb-3">
          {label}
        </span>
      )}
      {title && (
        <h2 className="font-display text-3xl sm:text-4xl text-app-text font-bold tracking-tight mb-4">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-text-muted text-base sm:text-lg leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
