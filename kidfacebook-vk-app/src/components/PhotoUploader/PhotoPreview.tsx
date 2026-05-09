import type { FC } from 'react';
import { Icon24Cancel } from '@vkontakte/icons';

interface PhotoPreviewProps {
  url: string;
  onRemove: () => void;
}

export const PhotoPreview: FC<PhotoPreviewProps> = ({ url, onRemove }) => {
  return (
    <div className="relative group">
      <img
        src={url}
        alt="Фото ребёнка"
        className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-2xl shadow-lg border-4 border-white dark:border-gray-700"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-9 h-9 sm:w-8 sm:h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
        aria-label="Удалить фото"
      >
        <Icon24Cancel width={18} height={18} />
      </button>
      <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">✓ Загружено</div>
    </div>
  );
};
