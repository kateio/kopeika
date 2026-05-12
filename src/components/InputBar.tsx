import { Icon } from './Icon';

interface InputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onAttach: () => void;
  placeholder?: string;
}

export function InputBar({
  value,
  onChange,
  onSend,
  onAttach,
  placeholder = 'расскажи что потратил...',
}: InputBarProps) {
  const hasText = value.trim().length > 0;

  return (
    <div
      className="flex items-center gap-2 rounded-[24px] bg-card border border-border"
      style={{ padding: '8px 8px 8px 14px' }}
    >
      <button
        onClick={onAttach}
        className="flex bg-transparent border-none p-1.5 text-muted"
        style={{ cursor: 'pointer' }}
      >
        {Icon.paperclip('#7C7C82', 20)}
      </button>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSend();
        }}
        placeholder={placeholder}
        className="flex-1 border-none bg-transparent text-[15px] text-fg outline-none"
        style={{ padding: '8px 0', fontFamily: 'inherit' }}
      />

      <button
        onClick={onSend}
        className="flex items-center justify-center border-none"
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          background: hasText ? '#D4F26A' : '#EDE9E1',
          cursor: hasText ? 'pointer' : 'default',
          transition: 'background 0.15s',
        }}
      >
        {Icon.send('#1A1A1E', 18)}
      </button>
    </div>
  );
}
