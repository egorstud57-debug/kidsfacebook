import type { FC, ReactNode } from 'react';

interface MagicCardProps {
  children: ReactNode;
  className?: string;
}

export const MagicCard: FC<MagicCardProps> = ({ children, className = '' }) => (
  <div className={`magic-card max-w-lg mx-auto ${className}`.trim()}>{children}</div>
);
