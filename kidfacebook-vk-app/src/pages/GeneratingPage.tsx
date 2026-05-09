import { useState, useEffect, type FC } from 'react';
import { Logo } from '../components/ui';

const funFacts = [
  '🎨 Рисуем волшебный лес...',
  '✨ Добавляем капельку магии...',
  '🦄 Приглашаем сказочных персонажей...',
  '📖 Пишем увлекательную историю...',
  '🌟 Полируем каждую страничку...',
  '🎭 Оживляем героев...',
  '🏰 Строим сказочный замок...',
  '🌈 Раскрашиваем радугой...',
];

export const GeneratingPage: FC = () => {
  const [factIndex, setFactIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const factInterval = window.setInterval(() => {
      setFactIndex((prev) => (prev + 1) % funFacts.length);
    }, 3000);

    const progressInterval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 5;
      });
    }, 500);

    return () => {
      window.clearInterval(factInterval);
      window.clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-magic-cream via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <div className="mb-8">
        <Logo size="md" animated />
      </div>

      <div className="relative w-48 h-48 mb-8">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-8xl animate-bounce-slow">📚</span>
        </div>
        <span className="absolute top-0 left-1/4 text-2xl animate-sparkle">✨</span>
        <span className="absolute top-1/4 right-0 text-xl animate-sparkle [animation-delay:300ms]">⭐</span>
        <span className="absolute bottom-1/4 left-0 text-2xl animate-sparkle [animation-delay:500ms]">💫</span>
        <span className="absolute bottom-0 right-1/4 text-xl animate-sparkle [animation-delay:700ms]">🌟</span>
      </div>

      <div className="w-full max-w-xs mb-6">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-magic-pink to-magic-purple rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-2">{Math.round(progress)}%</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-2">Создаём вашу сказку!</h2>

      <p className="text-lg text-magic-pink dark:text-magic-pink font-medium text-center animate-pulse">
        {funFacts[factIndex]}
      </p>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-8 text-center">Обычно это занимает 2-3 минуты 🕐</p>
    </div>
  );
};
