import type { FC } from 'react';
import { MagicButton } from '../components/ui';
import type { BookGenerationResult } from '../api/bookGeneration';
import { resolveApiAssetUrl } from '../api/bookGeneration';

interface ResultPageProps {
  result: BookGenerationResult;
  onReset: () => void;
}

export const ResultPage: FC<ResultPageProps> = ({ result, onReset }) => {
  const pdfHref = resolveApiAssetUrl(result.pdfUrl);
  const previews = result.previewImages.slice(0, 6).map((u) => resolveApiAssetUrl(u));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-12 bg-gradient-to-br from-magic-cream via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <div className="text-center max-w-md w-full">
        <span className="text-8xl mb-6 block animate-bounce-slow">🎉</span>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">Сказка готова!</h1>

        <p className="text-base sm:text-lg text-magic-pink dark:text-magic-pink font-medium mb-1 max-w-sm mx-auto">
          «{result.title}»
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          {result.pageCount} страниц • PDF можно скачать ниже
        </p>

        {previews.length > 0 && (
          <div className="flex gap-2 justify-center overflow-x-auto pb-2 mb-6 max-w-full">
            {previews.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="h-20 w-14 sm:h-24 sm:w-[4.5rem] rounded-lg object-cover border border-white/80 shadow shrink-0"
              />
            ))}
          </div>
        )}

        <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-5 sm:p-6 mb-6 max-w-sm mx-auto shadow-[0_16px_34px_rgba(155,89,182,0.2)] border border-white/70 dark:border-white/10">
          <h3 className="font-bold text-gray-800 dark:text-white mb-3">📬 Что дальше?</h3>
          <ul className="text-left text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <li>1. Сохраните PDF на устройство</li>
            <li>2. При необходимости распечатайте дома или в типографии</li>
            <li>3. Печатная версия «под ключ» — скоро в приложении</li>
          </ul>
        </div>

        <MagicButton
          type="button"
          variant="primary"
          fullWidth
          className="max-w-sm mx-auto mb-4 shadow-[0_12px_28px_rgba(255,77,148,0.35)]"
          onClick={() => window.open(pdfHref, '_blank', 'noopener,noreferrer')}
        >
          Скачать PDF
        </MagicButton>

        <MagicButton onClick={onReset} variant="secondary" fullWidth className="max-w-sm mx-auto shadow-[0_12px_28px_rgba(64,224,208,0.28)]">
          Создать ещё одну сказку
        </MagicButton>
      </div>
    </div>
  );
};
