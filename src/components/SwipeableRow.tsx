import { useRef, useState, type ReactNode, type TouchEvent as ReactTouchEvent } from 'react';

interface SwipeableRowProps {
  children: ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  threshold?: number;
}

export function SwipeableRow({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 80,
}: SwipeableRowProps) {
  const startX = useRef(0);
  const currentX = useRef(0);
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const handleTouchStart = (e: ReactTouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
    setSwiping(true);
  };

  const handleTouchMove = (e: ReactTouchEvent) => {
    if (!swiping) return;
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    const clamped = Math.max(-140, Math.min(140, diff));
    setOffset(clamped);
  };

  const handleTouchEnd = () => {
    if (!swiping) return;
    setSwiping(false);
    if (offset < -threshold) {
      onSwipeLeft();
    } else if (offset > threshold) {
      onSwipeRight();
    }
    setOffset(0);
  };

  const showLeft = offset > 20;
  const showRight = offset < -20;

  return (
    <div className="relative overflow-hidden">
      {showLeft && (
        <div
          className="absolute inset-y-0 left-0 flex items-center px-4"
          style={{ background: '#3B82F6', width: Math.abs(offset) }}
        >
          <span className="text-lg">✏️</span>
        </div>
      )}
      {showRight && (
        <div
          className="absolute inset-y-0 right-0 flex items-center justify-end px-4"
          style={{ background: '#EF4444', width: Math.abs(offset) }}
        >
          <span className="text-lg">🗑️</span>
        </div>
      )}
      <div
        style={{
          transform: `translateX(${offset}px)`,
          transition: swiping ? 'none' : 'transform 0.2s ease',
          position: 'relative',
          zIndex: 1,
          background: '#FFFFFF',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
