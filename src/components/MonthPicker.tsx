interface MonthPickerProps {
  selectedMonth: number; // 0-based
  onSelect: (month: number) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

export { MONTHS };

export function MonthPicker({ selectedMonth, onSelect, isOpen, onToggle }: MonthPickerProps) {
  if (!isOpen) return null;

  return (
    <div
      className="absolute z-30 max-h-[280px] w-[180px] overflow-auto rounded-card bg-card p-2"
      style={{
        top: 110,
        left: 24,
        boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
      }}
    >
      {MONTHS.map((name, i) => (
        <button
          key={name}
          onClick={() => {
            onSelect(i);
            onToggle();
          }}
          className={`w-full rounded-[12px] border-none px-3 py-2.5 text-left text-[15px] text-fg ${
            i === selectedMonth ? 'font-semibold' : 'font-normal'
          }`}
          style={{
            background: i === selectedMonth ? 'rgba(212,242,106,0.2)' : 'transparent',
            cursor: 'pointer',
          }}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
