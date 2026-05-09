import type { FC } from 'react';
import { useWizard } from '../../hooks';
import { INTERESTS, BOOK_STYLES } from '../../types';
import {
  startBookGeneration,
  waitForJobCompletion,
  type BookGenerationResult,
} from '../../api/bookGeneration';
import { MagicButton } from '../ui';

interface PreviewScreenProps {
  onOrderComplete?: (result: BookGenerationResult) => void;
}

export const PreviewScreen: FC<PreviewScreenProps> = ({ onOrderComplete }) => {
  const { photos, photoUrls, childData, selectedInterests, customInterest, bookStyle, setGenerating } = useWizard();

  const selectedStyle = BOOK_STYLES.find((s) => s.id === bookStyle);
  const selectedInterestLabels = selectedInterests
    .map((id) => INTERESTS.find((i) => i.id === id))
    .filter((i): i is NonNullable<typeof i> => Boolean(i));

  const handleCreateBook = async () => {
    setGenerating(true);
    try {
      const interestsPayload = [
        ...selectedInterestLabels.map((interest) => interest.label),
        ...(customInterest.trim() ? [customInterest.trim()] : []),
      ];

      const { jobId } = await startBookGeneration({
        childName: childData.name.trim(),
        childAge: childData.age,
        childGender: childData.gender,
        interests: interestsPayload,
        style: bookStyle,
        photos,
      });

      const result = await waitForJobCompletion(jobId);
      onOrderComplete?.(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Не удалось создать сказку. Попробуйте еще раз.';
      window.alert(message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">📚 Проверьте данные</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Всё верно? Тогда создаём сказку!</p>
      </div>

      <div className="bg-gradient-to-br from-magic-cream to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-4 sm:p-6 space-y-4 border border-white/70 dark:border-white/10 shadow-[0_16px_34px_rgba(255,77,148,0.12)]">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-2xl">📸</span>
          <div className="flex gap-2">
            {photoUrls.map((url, index) => (
              <img
                key={url}
                src={url}
                alt={`Фото ${index + 1}`}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border-2 border-white shadow"
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-2xl">{childData.gender === 'girl' ? '👧' : '👦'}</span>
          <div>
            <p className="font-bold text-gray-800 dark:text-white">{childData.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{childData.age} лет</p>
          </div>
        </div>

        <div className="flex items-start gap-3 sm:gap-4">
          <span className="text-2xl">⭐</span>
          <div className="flex flex-wrap gap-2">
            {selectedInterestLabels.map((interest) => (
              <span
                key={interest.id}
                className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                {interest.emoji} {interest.label}
              </span>
            ))}
            {customInterest.length > 0 && (
              <span className="px-3 py-1 bg-magic-pink/20 rounded-full text-xs sm:text-sm font-medium text-magic-pink">
                ✏️ {customInterest}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-2xl">🎨</span>
          <p className="font-medium text-gray-800 dark:text-white">
            {selectedStyle?.emoji} {selectedStyle?.title}
          </p>
        </div>
      </div>

      <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-4 border-2 border-magic-gold/80 shadow-[0_10px_26px_rgba(255,215,0,0.16)]">
        <h3 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">🎁 Что вы получите:</h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            20 уникальных страниц с иллюстрациями
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Ребёнок — главный герой истории
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            PDF для печати + электронная версия
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Обычно готово за несколько минут
          </li>
        </ul>
      </div>

      <div className="text-center space-y-4 bg-white/70 dark:bg-gray-800/70 rounded-2xl p-4 border border-white/70 dark:border-white/10">
        <div className="inline-flex items-baseline gap-2">
          <span className="text-gray-400 line-through text-base sm:text-lg">499 ₽</span>
          <span className="text-3xl sm:text-4xl font-extrabold text-magic-pink">249 ₽</span>
        </div>
        <p className="text-sm text-green-600 dark:text-green-400 font-medium">🔥 Скидка 50% — только сегодня!</p>

        <MagicButton fullWidth variant="gold" onClick={() => void handleCreateBook()} icon="✨" className="shadow-[0_14px_30px_rgba(255,140,66,0.3)]">
          Создать сказку за 249 ₽
        </MagicButton>

        <p className="text-xs text-gray-500 dark:text-gray-400">🔒 Безопасная оплата через VK Pay</p>
      </div>
    </div>
  );
};
