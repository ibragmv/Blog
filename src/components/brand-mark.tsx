export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={className}>
      <rect x="1.5" y="1.5" width="37" height="37" rx="12" stroke="currentColor" strokeWidth="1" />
      <path d="M11 13H29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 20H32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 27H26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
