import { useRef, useState, useEffect, type ReactNode, type TouchEvent as ReactTouchEvent } from 'react';

export type SwipePhase = 'idle' | 'reveal' | 'commit';

const THRESHOLD_REVEAL = 0.3;
const THRESHOLD_COMMIT = 0.7;
const REVEAL_WIDTH = 80;

export function getSwipePhase(dragX: number, containerWidth: number): SwipePhase {
  const ratio = Math.abs(dragX) / containerWidth;
  if (ratio >= THRESHOLD_COMMIT) return 'commit';
  if (ratio >= THRESHOLD_REVEAL) return 'reveal';
  return 'idle';
}

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
  const [phase, setPhase] = useState<SwipePhase>('idle');
  const prevPhaseRef = useRef<SwipePhase>('idle');
  const [hapticPulse, setHapticPulse] = useState<'reveal' | 'commit' | null>(null);

  const shouldClose = openRowId !== rowId && (revealed !== null || offset !== 0);
  if (shouldClose && !swiping) {
    if (revealed !== null) setRevealed(null);
    if (offset !== 0) setOffset(0);
    if (phase !== 'idle') setPhase('idle');
  }

  useEffect(() => {
    const prev = prevPhaseRef.current;
    if (phase !== prev && phase !== 'idle') {
      setHapticPulse(phase === 'reveal' ? 'reveal' : 'commit');
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(phase === 'reveal' ? 10 : 20);
      }
      const timer = setTimeout(() => setHapticPulse(null), 150);
      prevPhaseRef.current = phase;
      return () => clearTimeout(timer);
    }
    prevPhaseRef.current = phase;
  }, [phase]);

  const handleTouchStart = (e: ReactTouchEvent) => {
    startX.current = e.touches[0].clientX;
    setSwiping(true);
  };

  const handleTouchMove = (e: ReactTouchEvent) => {
    if (!swiping) return;
    const diff = e.touches[0].clientX - startX.current;
    const base = revealed === 'left' ? -REVEAL_WIDTH : revealed === 'right' ? REVEAL_WIDTH : 0;
    const newOffset = Math.max(-300, Math.min(300, base + diff));
    setOffset(newOffset);

    const width = containerRef.current?.offsetWidth ?? 300;
    setPhase(getSwipePhase(newOffset, width));
  };

  const handleTouchEnd = () => {
    if (!swiping) return;
    setSwiping(false);
    const width = containerRef.current?.offsetWidth ?? 300;
    const currentPhase = getSwipePhase(offset, width);

    if (currentPhase === 'commit') {
      if (offset < 0) onSwipeLeft();
      else onSwipeRight();
      setOffset(0);
      setRevealed(null);
      onOpenChange(null);
    } else if (currentPhase === 'reveal') {
      const dir = offset < 0 ? 'left' : 'right';
      setRevealed(dir);
      setOffset(dir === 'left' ? -REVEAL_WIDTH : REVEAL_WIDTH);
      onOpenChange(rowId);
    } else {
      setOffset(0);
      setRevealed(null);
      if (openRowId === rowId) onOpenChange(null);
    }
    setPhase('idle');
  };

  const handleActionClick = (action: 'left' | 'right') => {
    if (action === 'left') onSwipeLeft();
    else onSwipeRight();
    setOffset(0);
    setRevealed(null);
    onOpenChange(null);
  };

  const absOffset = Math.abs(offset);
  const isLeft = offset < 0;
  const isRight = offset > 0;

  const buttonScale = hapticPulse === 'commit' ? 'scale(1.05)' : hapticPulse === 'reveal' ? 'scale(0.95)' : 'scale(1)';
  const deleteOpacity = phase === 'commit' && isLeft ? 1 : phase === 'reveal' && isLeft ? 0.85 : 0.7;
  const editOpacity = phase === 'commit' && isRight ? 1 : phase === 'reveal' && isRight ? 0.85 : 0.7;
  const deleteBg = phase === 'commit' && isLeft ? '#DC2626' : '#EF4444';
  const editBg = phase === 'commit' && isRight ? '#2563EB' : '#3B82F6';

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {isLeft && absOffset > 10 && (
        <div
          className="absolute inset-y-0 right-0 flex items-center justify-center"
          style={{
            width: Math.max(absOffset, REVEAL_WIDTH),
            background: deleteBg,
            transition: swiping ? 'background 0.15s' : 'background 0.25s',
          }}
        >
          <button
            onClick={() => handleActionClick('left')}
            className="flex flex-col items-center gap-1 border-none bg-transparent text-white"
            style={{
              cursor: 'pointer',
              transform: buttonScale,
              opacity: deleteOpacity,
              transition: 'transform 0.1s ease, opacity 0.15s',
            }}
          >
            <span className="text-lg">🗑️</span>
            <span className="text-xs font-medium">Удалить</span>
          </button>
        </div>
      )}

      {isRight && absOffset > 10 && (
        <div
          className="absolute inset-y-0 left-0 flex items-center justify-center"
          style={{
            width: Math.max(absOffset, REVEAL_WIDTH),
            background: editBg,
            transition: swiping ? 'background 0.15s' : 'background 0.25s',
          }}
        >
          <button
            onClick={() => handleActionClick('right')}
            className="flex flex-col items-center gap-1 border-none bg-transparent text-white"
            style={{
              cursor: 'pointer',
              transform: buttonScale,
              opacity: editOpacity,
              transition: 'transform 0.1s ease, opacity 0.15s',
            }}
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
