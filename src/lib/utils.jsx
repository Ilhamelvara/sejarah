import React from 'react';

/**
 * Utility helper functions
 */

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function formatNumber(n) {
  if (typeof n !== 'number') return n;
  return n.toLocaleString('id-ID');
}

export function highlightText(text, query) {
  if (!query || typeof text !== 'string') return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-gold/30 text-gold px-0.5 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
