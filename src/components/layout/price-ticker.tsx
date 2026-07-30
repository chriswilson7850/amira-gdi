'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Timer } from 'lucide-react';

export default function PriceTicker() {
  const t = useTranslations('common');
  const [timeLeft, setTimeLeft] = useState('1:36');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      const mins = Math.floor(Math.random() * 2);
      const secs = Math.floor(Math.random() * 60);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button
        onClick={() => setVisible(!visible)}
        className="flex items-center gap-2 bg-surface-dark text-white px-3 py-2 rounded-lg shadow-lg text-xs hover:opacity-90 transition-opacity"
        aria-label={t('nextPriceUpdate')}
      >
        <Timer className="w-3 h-3 text-gold" />
        <span className="text-gray-300">{t('nextPriceUpdate')}:</span>
        <span className="font-mono text-gold">{timeLeft}</span>
      </button>
    </div>
  );
}
