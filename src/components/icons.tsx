type IconProps = { className?: string };

export function InstagramIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}

export function TikTokIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M14 3v10.5a3 3 0 1 1-2.2-2.9M14 3c.4 2.2 2 3.9 4.2 4.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FacebookIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M13.6 21v-6.8h2.1l.3-2.6h-2.4V9.9c0-.75.2-1.26 1.28-1.26h1.37V6.32c-.24-.03-1.05-.1-2-.1-1.98 0-3.33 1.2-3.33 3.42v1.9H8.7v2.6h2.2V21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CupIcon({ className = "w-7 h-7" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M5 8h11v6.5A4.5 4.5 0 0 1 11.5 19h-2A4.5 4.5 0 0 1 5 14.5V8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M16 9.5h1.5a2.25 2.25 0 0 1 0 4.5H16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M8 3.5c-.6.7-.6 1.3 0 2M11 3.5c-.6.7-.6 1.3 0 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function LeafIcon({ className = "w-7 h-7" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M5 19c-1-6 2-12.5 14-13.5C19.5 17 13 19.5 5 19Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M5 19c3-4 6.5-7 12.5-11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function HeartIcon({ className = "w-7 h-7" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 20s-7.5-4.6-9.8-9.2C.7 7.4 2.6 4 6.2 4c2 0 3.4 1 5.8 3.5C14.4 5 15.8 4 17.8 4c3.6 0 5.5 3.4 4 6.8C19.5 15.4 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PinIcon({ className = "w-7 h-7" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 21s7-6.2 7-11.5a7 7 0 1 0-14 0C5 14.8 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
