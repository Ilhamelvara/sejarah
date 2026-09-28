import React from 'react';
import { CheckCircle2, XCircle, Info, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toasts } = useApp();

  if (!toasts.length) return null;

  const renderIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-success shrink-0" />;
      case 'danger':
        return <XCircle className="w-5 h-5 text-danger shrink-0" />;
      case 'info':
        return <Info className="w-5 h-5 text-info shrink-0" />;
      default:
        return <Sparkles className="w-5 h-5 text-gold shrink-0" />;
    }
  };

  const borderColors = {
    gold: 'border-gold/40 bg-secondary/95 text-gold',
    success: 'border-success/40 bg-secondary/95 text-success',
    danger: 'border-danger/40 bg-secondary/95 text-danger',
    info: 'border-info/40 bg-secondary/95 text-info'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg transform transition-all duration-300 animate-bounce-short ${
            borderColors[toast.type] || borderColors.gold
          }`}
        >
          {renderIcon(toast.type)}
          <span className="text-sm font-medium text-app-text">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
