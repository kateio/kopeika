export const Icon = {
  plus: (color: string = 'currentColor', size: number = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),

  paperclip: (color: string = 'currentColor', size: number = 20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M21 11.5l-8.5 8.5a5.5 5.5 0 01-7.78-7.78L13.5 4a3.85 3.85 0 015.45 5.45l-8.5 8.5a2.2 2.2 0 11-3.11-3.11L14.5 7.5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  send: (color: string = 'currentColor', size: number = 20) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12l14-7-5 16-3-7-6-2z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill={color}
        fillOpacity="0.15"
      />
    </svg>
  ),

  close: (color: string = 'currentColor', size: number = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),

  chevDown: (color: string = 'currentColor', size: number = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M6 9l6 6 6-6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  chevRight: (color: string = 'currentColor', size: number = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M9 6l6 6-6 6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  check: (color: string = 'currentColor', size: number = 14) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12l5 5L20 7"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};
