import type { FC } from 'react';
import { useWizard } from '../../hooks';
import { BOOK_STYLES, type BookStyleOption } from '../../types';

function StyleCard({
  style,
  isSelected,
  onSelect,
}: {
  style: BookStyleOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        relative p-4 sm:p-6 rounded-3xl border-3 transition-all duration-300
        min-h-[140px] sm:min-h-[160px]
        flex flex-col items-center text-center
        overflow-hidden
        ${
          isSelected
            ? 'border-magic-pink shadow-[0_16px_34px_rgba(255,77,148,0.24)] scale-[1.02]'
            : 'border-gray-200 dark:border-gray-600 hover:border-magic-pink/50 bg-white/70 dark:bg-gray-800/60'
        }
      `}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-10`} />

      <div className="relative z-10">
        <span className="text-4xl sm:text-5xl mb-2 sm:mb-3 block">{style.emoji}</span>
        <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white mb-1.5 sm:mb-2">{style.title}</h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{style.description}</p>
      </div>

      {isSelected && (
        <div className="absolute top-3 right-3 w-8 h-8 bg-magic-pink rounded-full flex items-center justify-center text-white shadow-[0_8px_20px_rgba(255,77,148,0.45)]">
          ✓
        </div>
      )}
    </button>
  );
}

export const StyleSelector: FC = () => {
  const { bookStyle, setBookStyle } = useWizard();

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">🎨 Выберите стиль книги</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Как должны выглядеть иллюстрации?</p>
      </div>

      <div className="space-y-4">
        {BOOK_STYLES.map((style) => (
          <StyleCard
            key={style.id}
            style={style}
            isSelected={bookStyle === style.id}
            onSelect={() => setBookStyle(style.id)}
          />
        ))}
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 text-center border border-white/60 dark:border-white/10 shadow-sm">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          💡 Стиль <span className="font-bold text-magic-pink">&quot;Pixar 3D&quot;</span> — самый популярный!
          <br />
          Дети обожают объёмных персонажей ✨
        </p>
      </div>
    </div>
  );
};
