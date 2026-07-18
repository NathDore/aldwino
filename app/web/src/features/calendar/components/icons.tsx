interface IconProps {
  className?: string;
}

export function CloseIcon({ className = "w-3.5 h-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
    </svg>
  );
}
