interface IconProps {
  className?: string;
}

export function ChevronLeftIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRightIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CourseIcon({ className = "w-3.5 h-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M3 4h6l1.5 2H13v6.5a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z" strokeLinejoin="round" />
    </svg>
  );
}

export function WorkSessionIcon({ className = "w-3.5 h-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 5.2V8l2 1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ManageIcon({ className = "w-3.5 h-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M2.5 4h11M2.5 8h11M2.5 12h11" strokeLinecap="round" />
    </svg>
  );
}

export function BellIcon({ className = "w-3.5 h-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path
        d="M8 2.4c-.83 0-1.5.67-1.5 1.5v.24C4.9 4.5 3.6 5.95 3.6 7.7v2.2L2.5 11.4h11L12.4 9.9V7.7c0-1.75-1.3-3.2-2.9-3.56V3.9c0-.83-.67-1.5-1.5-1.5z"
        strokeLinejoin="round"
      />
      <path d="M6.3 12.4a1.7 1.7 0 003.4 0" strokeLinecap="round" />
    </svg>
  );
}
