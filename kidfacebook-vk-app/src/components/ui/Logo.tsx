import type { FC } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const Logo: FC<LogoProps> = ({ size = 'md', animated = true }) => {
  const sizeClasses = {
    sm: 'text-2xl sm:text-3xl',
    md: 'text-3xl sm:text-4xl',
    lg: 'text-4xl sm:text-6xl',
  };

  return (
    <div className={`flex flex-col items-center ${animated ? 'animate-float' : ''}`}>
      <div className="relative">
        <span className={`font-extrabold ${sizeClasses[size]}`}>
          <span className="text-magic-pink">Kid</span>
          <span className="text-magic-purple">Face</span>
          <span className="text-magic-turquoise">Book</span>
        </span>
        <span className="absolute -top-2 -right-4 text-2xl animate-sparkle">✨</span>
        <span className="absolute -bottom-1 -left-3 text-xl animate-sparkle [animation-delay:500ms]">⭐</span>
      </div>
      <div className="mt-2 text-sm sm:text-lg text-gray-600 dark:text-gray-300 font-medium text-center max-w-[90vw] sm:max-w-none px-2">
        Сказки, где главный герой — ваш ребёнок! 📚
      </div>
    </div>
  );
};
