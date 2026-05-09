import type { FC } from 'react';
import { Icon28CameraOutline, Icon24Gallery } from '@vkontakte/icons';
import { usePhotoUpload } from '../../hooks';
import { PhotoPreview } from './PhotoPreview';

export const PhotoUploader: FC = () => {
  const {
    photos,
    photoUrls,
    removePhoto,
    fileInputRef,
    isDragging,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    openPicker,
  } = usePhotoUpload();

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">📸 Загрузите фото ребёнка</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">1-2 фотографии, где хорошо видно лицо</p>
      </div>

      {photoUrls.length > 0 && (
        <div className="flex gap-4 justify-center flex-wrap">
          {photoUrls.map((url, index) => (
            <PhotoPreview key={url} url={url} onRemove={() => removePhoto(index)} />
          ))}
        </div>
      )}

      {photos.length < 2 && (
        <div
          className={`
            relative border-3 border-dashed rounded-3xl p-5 sm:p-8
            transition-all duration-300 cursor-pointer
            ${
              isDragging
                ? 'border-magic-pink bg-pink-50 dark:bg-pink-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-magic-pink hover:bg-pink-50/50 dark:hover:bg-pink-900/10'
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openPicker();
            }
          }}
          role="button"
          tabIndex={0}
        >
          <div className="text-center">
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 animate-bounce-slow">📷</div>
            <p className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Перетащите фото сюда</p>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4">или нажмите для выбора</p>

            <div className="flex gap-3 justify-center flex-wrap">
              <button
                type="button"
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base bg-magic-turquoise text-white rounded-xl hover:bg-opacity-90 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  openPicker();
                }}
              >
                <Icon28CameraOutline width={20} height={20} />
                С устройства
              </button>

              <button
                type="button"
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-500 text-white rounded-xl hover:bg-opacity-90 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  alert('Скоро: выбор из галереи VK');
                }}
              >
                <Icon24Gallery width={20} height={20} />
                Из VK
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>
      )}

      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-4">
        <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">💡 Советы:</h4>
        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
          <li>• Лицо должно быть хорошо освещено</li>
          <li>• Лучше всего подходят портретные фото</li>
          <li>• Избегайте фото в солнечных очках</li>
        </ul>
      </div>
    </div>
  );
};
