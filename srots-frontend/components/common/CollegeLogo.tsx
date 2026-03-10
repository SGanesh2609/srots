import React from 'react';

interface CollegeLogoProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const SIZE_MAP = {
  xs: 'w-8 h-8 text-xs',
  sm: 'w-10 h-10 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-xl',
};

const COLOURS = [
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-teal-100 text-teal-700 border-teal-200',
  'bg-orange-100 text-orange-700 border-orange-200',
];

/**
 * CollegeLogo
 *
 * Renders the college logo image when available.
 * Falls back to a coloured initial-letter avatar on:
 *  - missing / null / empty src
 *  - network error (ERR_NAME_NOT_RESOLVED, 404, etc.)
 *  - CORS failures
 *
 * NOTE: The browser will still log ERR_NAME_NOT_RESOLVED in the console when it
 * attempts to load a broken URL — this is unavoidable browser behaviour and is
 * NOT a JavaScript error. The UI will correctly show the fallback avatar.
 */
export const CollegeLogo: React.FC<CollegeLogoProps> = ({
  src,
  name,
  size = 'lg',
  className = '',
  onClick,
}) => {
  const [failed, setFailed] = React.useState(false);

  // Reset failed state if src changes (e.g. after logo upload)
  React.useEffect(() => {
    setFailed(false);
  }, [src]);

  const dim     = SIZE_MAP[size];
  const initial = (name?.trim()?.charAt(0) ?? '?').toUpperCase();
  const colour  = COLOURS[(initial.charCodeAt(0) || 0) % COLOURS.length];
  const base    = `${dim} rounded-lg border flex-shrink-0 ${className}`;
  const cursor  = onClick ? 'cursor-pointer' : '';

  if (src && src.trim() !== '' && !failed) {
    return (
      <img
        src={src}
        alt={name}
        className={`${base} object-cover bg-white ${cursor}`}
        onClick={onClick}
        // onError fires after the browser logs the network error.
        // We can't suppress the console log, but we CAN show the fallback.
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={`${base} ${colour} font-bold flex items-center justify-center select-none ${cursor}`}
      onClick={onClick}
      title={name}
    >
      {initial}
    </div>
  );
};

export default CollegeLogo;