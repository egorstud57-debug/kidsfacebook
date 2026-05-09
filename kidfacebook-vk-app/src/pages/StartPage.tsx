import type { FC } from 'react';
import { Logo, MagicButton } from '../components/ui';
import { useVKUser } from '../hooks';

interface StartPageProps {
  onStart: () => void;
}

export const StartPage: FC<StartPageProps> = ({ onStart }) => {
  const { user, loading } = useVKUser();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 bg-gradient-to-br from-magic-cream via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 overflow-hidden">
      <div className="pointer-events-none absolute -top-28 -left-20 w-72 h-72 rounded-full bg-magic-pink/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-24 -right-12 w-72 h-72 rounded-full bg-magic-turquoise/20 blur-3xl animate-pulse [animation-delay:700ms]" />
      <div className="pointer-events-none absolute top-10 left-6 text-3xl sm:text-4xl animate-float hidden sm:block">🦋</div>
      <div className="pointer-events-none absolute top-20 right-6 text-2xl sm:text-3xl animate-float [animation-delay:500ms] hidden sm:block">⭐</div>
      <div className="pointer-events-none absolute bottom-20 left-6 text-3xl sm:text-4xl animate-float [animation-delay:1000ms] hidden sm:block">🌈</div>
      <div className="pointer-events-none absolute bottom-10 right-8 text-2xl sm:text-3xl animate-float [animation-delay:700ms] hidden sm:block">🦄</div>

      {!loading && user && (
        <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 bg-white/80 dark:bg-gray-800/80 px-3 sm:px-4 py-2 rounded-full shadow z-10 text-sm sm:text-base">
          {user.photo.length > 0 && (
            <img
              src={user.photo}
              alt={user.firstName}
              className="w-10 h-10 rounded-full border-2 border-magic-pink"
            />
          )}
          <span className="text-gray-700 dark:text-gray-200">
            Привет, <span className="font-bold">{user.firstName}</span>! 👋
          </span>
        </div>
      )}

      <div className="mb-5 sm:mb-8 z-10">
        <Logo size="lg" animated />
      </div>

      <div className="relative w-52 h-52 sm:w-64 sm:h-64 mb-6 sm:mb-8 z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-magic-pink/20 to-magic-purple/20 rounded-full animate-pulse" />
        <div className="absolute inset-4 flex items-center justify-center">
          <img
            src="/images/start-hero.png"
            alt="Пример персональной сказки"
            className="w-full h-full object-cover rounded-full shadow-2xl border-4 border-white/80"
          />
        </div>
        <span className="absolute top-2 right-2 text-4xl animate-sparkle">✨</span>
        <span className="absolute bottom-2 left-2 text-3xl animate-sparkle [animation-delay:500ms]">💫</span>
      </div>

      <div className="max-w-sm text-center mb-6 sm:mb-8 space-y-3 z-10">
        <div className="inline-flex items-center gap-2 sm:gap-3 text-gray-700 dark:text-gray-200 text-sm sm:text-base bg-white/70 dark:bg-gray-800/70 rounded-2xl px-3 py-2 shadow-sm">
          <span className="text-xl sm:text-2xl">👶</span>
          <span>Ваш ребёнок — главный герой</span>
        </div>
        <div className="inline-flex items-center gap-2 sm:gap-3 text-gray-700 dark:text-gray-200 text-sm sm:text-base bg-white/70 dark:bg-gray-800/70 rounded-2xl px-3 py-2 shadow-sm">
          <span className="text-xl sm:text-2xl">🎨</span>
          <span>Уникальные иллюстрации в стиле Pixar</span>
        </div>
        <div className="inline-flex items-center gap-2 sm:gap-3 text-gray-700 dark:text-gray-200 text-sm sm:text-base bg-white/70 dark:bg-gray-800/70 rounded-2xl px-3 py-2 shadow-sm">
          <span className="text-xl sm:text-2xl">⚡</span>
          <span>Обычно готово за несколько минут</span>
        </div>
      </div>

      <div className="z-10 w-full max-w-sm">
        <MagicButton onClick={onStart} variant="primary" icon="✨" fullWidth className="shadow-[0_12px_30px_rgba(255,77,148,0.35)]">
          Создать сказку за 249 ₽
        </MagicButton>
      </div>

      <p className="mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 z-10 text-center">
        от <span className="font-bold text-magic-pink">249 ₽</span> •<span className="line-through mx-1">499 ₽</span>
        <span className="text-green-500">-50%</span>
      </p>

      <div className="mt-8 text-center z-10 bg-white/70 dark:bg-gray-800/70 rounded-2xl px-4 py-3 shadow-sm">
        <div className="flex items-center justify-center gap-1 text-yellow-500 mb-2">⭐⭐⭐⭐⭐</div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Более <span className="font-bold">10,000</span> счастливых семей
        </p>
      </div>
    </div>
  );
};
