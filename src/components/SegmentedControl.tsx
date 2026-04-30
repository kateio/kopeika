interface SegmentedControlProps {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps) {
  return (
    <div className={`flex gap-1 rounded-DEFAULT bg-card p-1 ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 rounded-[12px] border-none px-2 py-2.5 text-sm font-semibold transition-all duration-150 ${
            opt.value === value
              ? 'bg-bg text-fg shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
              : 'bg-transparent text-muted'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
