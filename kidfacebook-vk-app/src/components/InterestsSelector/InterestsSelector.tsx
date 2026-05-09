import type { FC } from 'react';
import { useWizard } from '../../hooks';
import { INTERESTS, type Interest } from '../../types';

function InterestCard({
  interest,
  isSelected,
  onToggle,
  disabled = false,
}: {
  interest: Interest;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled && !isSelected}
      className={`
        p-3 sm:p-3.5 rounded-2xl border-2 transition-all duration-300
        flex items-center gap-2
        ${
          isSelected
            ? 'border-magic-pink bg-pink-50 dark:bg-pink-900/30 shadow-[0_10px_24px_rgba(255,77,148,0.24)] scale-[1.03]'
            : disabled
              ? 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
              : 'border-gray-200/80 dark:border-gray-600 hover:border-magic-pink/50 hover:bg-pink-50/50 dark:hover:bg-pink-900/10 bg-white/70 dark:bg-gray-800/60'
        }
      `}
    >
      <span className="text-xl sm:text-2xl">{interest.emoji}</span>
      <span
        className={`font-medium text-xs sm:text-sm ${
          isSelected ? 'text-magic-pink' : 'text-gray-700 dark:text-gray-300'
        }`}
      >
        {interest.label}
      </span>
      {isSelected && <span className="ml-auto text-magic-pink">✓</span>}
    </button>
  );
}

export const InterestsSelector: FC = () => {
  const { selectedInterests, customInterest, toggleInterest, setCustomInterest } = useWizard();

  const maxInterests = 5;
  const isMaxReached = selectedInterests.length >= maxInterests;

  const groupedInterests = {
    russian: INTERESTS.filter((i) => i.category === 'russian'),
    soviet: INTERESTS.filter((i) => i.category === 'soviet'),
    modern: INTERESTS.filter((i) => i.category === 'modern'),
    themes: INTERESTS.filter((i) => i.category === 'themes'),
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">⭐ Выберите интересы</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Что любит ваш ребёнок? (до {maxInterests} вариантов)</p>
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-magic-pink/10 rounded-full border border-magic-pink/20">
          <span className="text-magic-pink font-semibold">
            {selectedInterests.length} / {maxInterests}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">🇷🇺 Русские мультфильмы</h3>
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2">
          {groupedInterests.russian.map((interest) => (
            <InterestCard
              key={interest.id}
              interest={interest}
              isSelected={selectedInterests.includes(interest.id)}
              onToggle={() => toggleInterest(interest.id)}
              disabled={isMaxReached}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">📺 Советская классика</h3>
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2">
          {groupedInterests.soviet.map((interest) => (
            <InterestCard
              key={interest.id}
              interest={interest}
              isSelected={selectedInterests.includes(interest.id)}
              onToggle={() => toggleInterest(interest.id)}
              disabled={isMaxReached}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">🎬 Современные мультфильмы</h3>
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2">
          {groupedInterests.modern.map((interest) => (
            <InterestCard
              key={interest.id}
              interest={interest}
              isSelected={selectedInterests.includes(interest.id)}
              onToggle={() => toggleInterest(interest.id)}
              disabled={isMaxReached}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">🎯 Тематики</h3>
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2">
          {groupedInterests.themes.map((interest) => (
            <InterestCard
              key={interest.id}
              interest={interest}
              isSelected={selectedInterests.includes(interest.id)}
              onToggle={() => toggleInterest(interest.id)}
              disabled={isMaxReached}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200" htmlFor="custom-interest">
          ✏️ Или напишите своё:
        </label>
        <input
          id="custom-interest"
          type="text"
          value={customInterest}
          onChange={(e) => setCustomInterest(e.target.value)}
          placeholder="Например: Супергерои Marvel"
          maxLength={50}
          className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-white/85 dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:border-magic-pink focus:outline-none transition-colors"
        />
      </div>
    </div>
  );
};
