interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

export function BallIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style} aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 7l3.5 2.5-1.3 4h-4.4l-1.3-4L12 7Zm0-4.5v4.5M15.5 9.5l4-1.5M14.2 13.5l2.6 3.6M9.8 13.5l-2.6 3.6M8.5 9.5l-4-1.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GlobeIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={style} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z" />
    </svg>
  );
}

export function ScoreboardIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={style} aria-hidden>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M9 6v12M15 6v12M6 10.5v3M12 10.5v3M18 10.5v3" />
    </svg>
  );
}

export function SparkleIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden>
      <path d="M12 2l1.8 5.7L19.5 9l-5.7 1.8L12 16.5l-1.8-5.7L4.5 9l5.7-1.3L12 2ZM19 14l.9 2.8 2.8.9-2.8.9L19 21.4l-.9-2.8-2.8-.9 2.8-.9L19 14Z" />
    </svg>
  );
}

export function ProjectorIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={style} aria-hidden>
      <path d="M7 21h10M12 17v4M5 17h14L15.5 4h-7L5 17Z" strokeLinejoin="round" />
      <path d="M9.5 8h5" opacity="0.6" />
    </svg>
  );
}

export function StringLightsIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={style} aria-hidden>
      <path d="M2 6c4 5 16 5 20 0" />
      <circle cx="6" cy="10.2" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="11.6" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="18" cy="10.2" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FireworksIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className={className} style={style} aria-hidden>
      <path d="M12 12V4M12 12l5.5-5.5M12 12l8 0M12 12l5.5 5.5M12 12v8M12 12l-5.5 5.5M12 12H4M12 12L6.5 6.5" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function DownloadIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className} style={style} aria-hidden>
      <path d="M12 4v11m0 0 4-4m-4 4-4-4M4 19h16" />
    </svg>
  );
}

export function ShareIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={style} aria-hidden>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="17.5" cy="5.5" r="2.5" />
      <circle cx="17.5" cy="18.5" r="2.5" />
      <path d="m8.2 10.8 7-4M8.2 13.2l7 4" />
    </svg>
  );
}

export function CheckIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className={className} style={style} aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

export function FlameIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden>
      <path d="M12 2s5.5 4.8 5.5 10a5.5 5.5 0 0 1-11 0c0-2 .8-3.8 1.8-5.3.3 1.2 1 2.3 2 2.8C10 7.5 11 4.5 12 2Z" />
    </svg>
  );
}

export function ConfettiIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} style={style} aria-hidden>
      <path d="M5 11 13 19 3 21l2-10Z" fill="currentColor" stroke="none" opacity="0.9" />
      <path d="M14 5.5c1.5-1.5 3-1.5 4.5 0M16 10c2 0 3 1 3.5 3M10 4c.5-1.5 0-2.5-1-3" strokeLinecap="round" />
      <circle cx="19" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14" cy="2.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="21" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function QuestionIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className={className} style={style} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.3A2.6 2.6 0 0 1 12 7.5c1.4 0 2.5 1 2.5 2.3 0 1.7-2.5 2-2.5 3.7" />
      <circle cx="12" cy="16.8" r="0.4" fill="currentColor" />
    </svg>
  );
}

export function QuoteIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden>
      <path d="M7 7.5c0-2.2 1.8-4 4-4 .8 0 1.5.2 2.1.6C11.5 5.8 10 8.2 10 11H6c0-1.2.3-2.3 1-3.5Zm8 0c0-2.2 1.8-4 4-4 .8 0 1.5.2 2.1.6C19.5 5.8 18 8.2 18 11h-4c0-1.2.3-2.3 1-3.5Z" opacity="0.95" />
    </svg>
  );
}

export function RefreshIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className} style={style} aria-hidden>
      <path d="M4 4v5h5" />
      <path d="M20 20v-5h-5" />
      <path d="M20 9A8 8 0 0 0 6.5 6.7L4 9M4 15a8 8 0 0 0 13.5 2.3L20 15" />
    </svg>
  );
}
