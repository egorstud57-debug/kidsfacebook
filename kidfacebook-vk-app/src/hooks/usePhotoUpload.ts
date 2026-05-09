import { useCallback, useRef, useState, type DragEvent } from 'react';
import { useWizard } from './useWizard';

export function usePhotoUpload() {
  const photos = useWizard((s) => s.photos);
  const photoUrls = useWizard((s) => s.photoUrls);
  const removePhoto = useWizard((s) => s.removePhoto);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const { photos: current, addPhoto: add } = useWizard.getState();
      if (current.length >= 2) return;
      add(file, URL.createObjectURL(file));
    });
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect],
  );

  const openPicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
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
  };
}
