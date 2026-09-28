import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    primary: 'bg-gradient-to-r from-gold to-amber text-primary font-semibold shadow-gold hover:shadow-gold-lg hover:brightness-110',
    outline: 'border border-gold/40 text-gold hover:bg-gold/10 hover:border-gold/80',
    ghost: 'bg-surface/50 text-text-muted hover:text-app-text hover:bg-surface border border-white/5',
    danger: 'bg-danger/20 text-danger border border-danger/30 hover:bg-danger/30',
    success: 'bg-success/20 text-success border border-success/30 hover:bg-success/30'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5'
  };

  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
