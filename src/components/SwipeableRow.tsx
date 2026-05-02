import { useRef, useState, type ReactNode, type TouchEvent as ReactTouchEvent } from 'react';

const REVEAL_WIDTH = 80;

interface SwipeableRowProps {
  children: ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  rowId: string;
  openRowId: string | null;
  onOpenChange: (id: string | null) => void;
}

export function SwipeableRow({
  children,
  onSwipeLeft,
  onSwipeRight,
  rowId,
  openRowId,
  onOpenChange,
}: SwipeableRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [revealed, setRevealed] = useState<'left' | 'right' | null>(null);

  const shouldClose = openRowId !== rowId && (revealed !== null || offset !== 0);
  if (shouldClose && !swiping) {
    if (revealed !== null) setRevealed(null);
    if (offset !== 0) setOffset(0);
  }

  const handleTouchStart = (e: ReactTouchEvent) => {
    startX.current = e.touches[0].clientX;
    setSwiping(true);
  };

  const handleTouchMove = (e: ReactTouchEvent) => {
    if (!swiping) return;
    const diff = e.touches[0].clientX - startX.current;
    // If revealed, adjust from revealed position
    const base = revealed === 'left' ? -REVEAL_WIDTH : revealed === 'right' ? REVEAL_WIDTH : 0;
    const newOffset = Math.max(-200, Math.min(200, base + diff));
    setOffset(newOffset);
  };

  const handleTouchEnd = () => {
    if (!swiping) return;
    setSwiping(false);
    const width = containerRef.current?.offsetWidth ?? 300;
    const absOffset = Math.abs(offset);

    if (absOffset >= width * 0.7) {
      // Commit
      if (offset < 0) onSwipeLeft();
      else onSwipeRight();
      setOffset(0);
      setRevealed(null);
      onOpenChange(null);
    } else if (absOffset >= width * 0.3) {
      // Reveal
      const dir = offset < 0 ? 'left' : 'right';
      setRevealed(dir);
      setOffset(dir === 'left' ? -REVEAL_WIDTH : REVEAL_WIDTH);
      onOpenChange(rowId);
    } else {
      // Close
      setOffset(0);
      setRevealed(null);
      if (openRowId === rowId) onOpenChange(null);
    }
  };

  const handleActionClick = (action: 'left' | 'right') => {
    if (action === 'left') onSwipeLeft();
    else onSwipeRight();
    setOffset(0);
    setRevealed(null);
    onOpenChange(null);
  };

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Delete button (left swipe reveals on right side) */}
      {offset < -10 && (
        <div
          className="absolute inset-y-0 right-0 flex items-center justify-center"
          style={{ width: Math.max(Math.abs(offset), REVEAL_WIDTH), background: '#EF4444' }}
        >
          <button
            onClick={() => handleActionClick('left')}
            className="flex flex-col items-center gap-1 border-none bg-transparent text-white"
            style={{ cursor: 'pointer' }}
          >
            <span className="text-lg">🗑️</span>
            <span className="text-xs font-medium">Удалить</span>
          </button>
        </div>
      )}

      {/* Edit button (right swipe reveals on left side) */}
      {offset > 10 && (
        <div
          className="absolute inset-y-0 left-0 flex items-center justify-center"
          style={{ width: Math.max(Math.abs(offset), REVEAL_WIDTH), background: '#3B82F6' }}
        >
          <button
            onClick={() => handleActionClick('right')}
            className="flex flex-col items-center gap-1 border-none bg-transparent text-white"
            style={{ cursor: 'pointer' }}
          >
            <span className="text-lg">✏️</span>
            <span className="text-xs font-medium">Изменить</span>
          </button>
        </div>
      )}

      <div
        style={{
          transform: `translateX(${offset}px)`,
          transition: swiping ? 'none' : 'transform 0.25s ease',
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
