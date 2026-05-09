import type { FC } from 'react';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
}

const stepLabels = ['📸 Фото', '👤 Данные', '⭐ Интересы', '🎨 Стиль', '💳 Оплата'];

export const WizardProgress: FC<WizardProgressProps> = ({ currentStep, totalSteps }) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full px-3 sm:px-4 py-2.5 sm:py-3">
      <div className="relative h-2.5 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2.5 sm:mb-3">
        <div
          className="absolute h-full bg-gradient-to-r from-magic-pink via-fuchsia-500 to-magic-purple rounded-full transition-all duration-500 ease-out shadow-[0_0_16px_rgba(255,77,148,0.45)]"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 text-sm transition-all duration-500"
          style={{ left: `calc(${progress}% - 8px)` }}
        >
          ✨
        </div>
      </div>

      <div className="flex justify-between gap-1">
        {stepLabels.map((label, index) => (
          <div
            key={label}
            className={`flex flex-col items-center transition-all duration-300 ${
              index <= currentStep ? 'text-magic-pink' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            <div
              className={`
                w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mb-1
                transition-all duration-300
                ${
                  index < currentStep
                    ? 'bg-magic-pink text-white shadow-[0_8px_18px_rgba(255,77,148,0.35)]'
                    : index === currentStep
                      ? 'bg-gradient-to-r from-magic-pink to-magic-purple text-white scale-110 shadow-[0_10px_22px_rgba(155,89,182,0.35)]'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }
              `}
            >
              {index < currentStep ? '✓' : index + 1}
            </div>
            <span className="text-xs font-medium hidden sm:block">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
