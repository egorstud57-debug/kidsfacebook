import type { ChangeEvent, FC } from 'react';
import { useWizard } from '../../hooks';
import type { Gender } from '../../types';

export const ChildDataForm: FC = () => {
  const { childData, setChildData } = useWizard();

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setChildData({ name: e.target.value });
  };

  const handleAgeChange = (value: number) => {
    setChildData({ age: value });
  };

  const handleGenderChange = (gender: Gender) => {
    setChildData({ gender });
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">👤 Расскажите о ребёнке</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Эти данные помогут создать персональную сказку</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200" htmlFor="child-name">
          Имя ребёнка
        </label>
        <input
          id="child-name"
          type="text"
          value={childData.name}
          onChange={handleNameChange}
          placeholder="Например: Маша"
          maxLength={20}
          className="w-full px-4 py-3 min-h-[44px] rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:border-magic-pink focus:outline-none transition-colors text-base sm:text-lg"
        />
        {childData.name.length > 0 && childData.name.length < 2 && (
          <p className="text-sm text-red-500">Минимум 2 символа</p>
        )}
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
          Возраст: <span className="text-magic-pink text-xl sm:text-2xl font-bold">{childData.age}</span> лет
        </label>
        <div className="px-2">
          <input
            type="range"
            min={3}
            max={10}
            value={childData.age}
            onChange={(e) => handleAgeChange(Number(e.target.value))}
            className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #FF4D94 0%, #FF4D94 ${((childData.age - 3) / 7) * 100}%, #e5e7eb ${
                ((childData.age - 3) / 7) * 100
              }%, #e5e7eb 100%)`,
            }}
          />
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
            <span>3 года</span>
            <span>10 лет</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">Пол</span>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => handleGenderChange('boy')}
            className={`
              p-3 sm:p-4 min-h-[96px] rounded-2xl border-3 transition-all duration-300
              flex flex-col items-center gap-2
              ${
                childData.gender === 'boy'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 scale-105'
                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
              }
            `}
          >
            <span className="text-4xl sm:text-5xl">👦</span>
            <span
              className={`font-semibold ${
                childData.gender === 'boy' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Мальчик
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleGenderChange('girl')}
            className={`
              p-3 sm:p-4 min-h-[96px] rounded-2xl border-3 transition-all duration-300
              flex flex-col items-center gap-2
              ${
                childData.gender === 'girl'
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30 scale-105'
                  : 'border-gray-200 dark:border-gray-600 hover:border-pink-300'
              }
            `}
          >
            <span className="text-4xl sm:text-5xl">👧</span>
            <span
              className={`font-semibold ${
                childData.gender === 'girl' ? 'text-pink-600 dark:text-pink-400' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Девочка
            </span>
          </button>
        </div>
      </div>

      {childData.name.length > 0 && (
        <div className="bg-gradient-to-r from-magic-cream to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-4 text-center">
          <p className="text-gray-600 dark:text-gray-300">В сказке будет написано:</p>
          <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mt-1">
            «{childData.gender === 'girl' ? 'Отважная' : 'Отважный'} {childData.name} отправил
            {childData.gender === 'girl' ? 'ась' : 'ся'} в путешествие...»
          </p>
        </div>
      )}
    </div>
  );
};
