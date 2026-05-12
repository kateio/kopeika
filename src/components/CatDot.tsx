interface CatDotProps {
  color: string;
  size?: number;
  radius?: number;
}

export function CatDot({ color, size = 36, radius = 12 }: CatDotProps) {
  return (
    <div
      className="shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: color,
      }}
    />
  );
}
