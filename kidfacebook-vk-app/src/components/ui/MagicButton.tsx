import type { ButtonHTMLAttributes, FC, ReactNode } from 'react';

interface MagicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold';
  fullWidth?: boolean;
  icon?: ReactNode;
}

export const MagicButton: FC<MagicButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  icon,
  className = '',
  type = 'button',
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-magic-pink to-magic-purple hover:from-magic-purple hover:to-magic-pink',
    secondary: 'bg-gradient-to-r from-magic-turquoise to-emerald-700',
    gold: 'bg-gradient-to-r from-magic-gold to-magic-orange',
  };

  return (
    <button
      type={type}
      className={`
        magic-button
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        text-white font-bold py-3.5 sm:py-4 px-6 sm:px-8 rounded-2xl
        min-h-[44px]
        shadow-lg hover:shadow-xl
        transform hover:scale-105 active:scale-95
        transition-all duration-200
        flex items-center justify-center gap-2
        text-base sm:text-lg
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${className}
      `}
      {...props}
    >
      {icon != null && <span className="text-xl">{icon}</span>}
      {children}
    </button>
  );
};
