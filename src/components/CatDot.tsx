interface CatDotProps {
  color: string;
  size?: number;
  radius?: number;
  emoji?: string;
}

export function CatDot({ color, size = 36, radius = 12, emoji }: CatDotProps) {
  return (
    <div
      className="shrink-0 flex items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: color,
        fontSize: size * 0.5,
        lineHeight: 1,
      }}
    >
      {emoji || ''}
    </div>
  );
}
