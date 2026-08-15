'use client';

import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function HiddenAdminAccess() {
  const [tapCount, setTapCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (tapCount === 0) return;
    const timer = setTimeout(() => setTapCount(0), 1500);
    return () => clearTimeout(timer);
  }, [tapCount]);

  const handleTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (newCount >= 3 && newCount < 5) {
      setShowHint(true);
      setTimeout(() => setShowHint(false), 1500);
    }

    if (newCount >= 5) {
      setTapCount(0);
      setShowHint(false);
      router.push('/admin/login');
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 select-none">
      {showHint && (
        <div className="absolute bottom-12 left-0 glass-card px-3 py-1.5 text-xs text-muted-foreground whitespace-nowrap animate-fade-in">
          Keep tapping...
        </div>
      )}
      <button
        onClick={handleTap}
        aria-label="."
        className="w-6 h-6 flex items-center justify-center text-muted-foreground/20 hover:text-muted-foreground/40 transition-colors duration-300"
      >
        <Lock size={14} />
      </button>
    </div>
  );
}
