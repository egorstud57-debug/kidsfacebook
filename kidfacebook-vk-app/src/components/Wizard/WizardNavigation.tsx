import type { FC } from 'react';
import { Icon24ChevronLeft } from '@vkontakte/icons';
import { MagicButton } from '../ui';

interface WizardNavigationProps {
  showBack: boolean;
  showNext: boolean;
  canProceed: boolean;
  onBack: () => void;
  onNext: () => void;
}

export const WizardNavigation: FC<WizardNavigationProps> = ({
  showBack,
  showNext,
  canProceed,
  onBack,
  onNext,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 px-3 sm:px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)] bg-white/85 dark:bg-gray-900/85 backdrop-blur-md border-t border-white/40 dark:border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.12)]">
      <div className="max-w-lg mx-auto flex gap-2 sm:gap-3">
        {showBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gray-100/95 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-white/60 dark:border-white/10"
          >
            <Icon24ChevronLeft />
          </button>
        )}

        {showNext && (
          <MagicButton fullWidth onClick={onNext} disabled={!canProceed} icon="→">
            Далее
          </MagicButton>
        )}
      </div>
    </div>
  );
};
