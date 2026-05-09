import type { FC } from 'react';

interface LoadingSpinnerProps {
  className?: string;
  label?: string;
}

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({ className = '', label }) => (
  <div className={`flex flex-col items-center gap-3 ${className}`.trim()} role="status">
    <div
      className="h-10 w-10 rounded-full border-4 border-magic-pink/30 border-t-magic-pink animate-spin"
      aria-hidden
    />
    {label != null && label !== '' && (
      <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
    )}
  </div>
);
