import { create } from 'zustand';
import type { WizardState, ChildData, BookStyle } from '../types';

interface WizardActions {
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setPhotos: (photos: File[], urls: string[]) => void;
  addPhoto: (photo: File, url: string) => void;
  removePhoto: (index: number) => void;
  setChildData: (data: Partial<ChildData>) => void;
  toggleInterest: (interestId: string) => void;
  setCustomInterest: (interest: string) => void;
  setBookStyle: (style: BookStyle) => void;
  setGenerating: (isGenerating: boolean) => void;
  reset: () => void;
}

const LAST_STEP_INDEX = 4;

const initialState: WizardState = {
  step: 0,
  photos: [],
  photoUrls: [],
  childData: {
    name: '',
    age: 5,
    gender: 'boy',
  },
  selectedInterests: [],
  customInterest: '',
  bookStyle: 'pixar',
  isGenerating: false,
};

export const useWizard = create<WizardState & WizardActions>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  nextStep: () => {
    const { step } = get();
    if (step < LAST_STEP_INDEX) {
      set({ step: step + 1 });
    }
  },

  prevStep: () => {
    const { step } = get();
    if (step > 0) {
      set({ step: step - 1 });
    }
  },

  setPhotos: (photos, urls) => set({ photos, photoUrls: urls }),

  addPhoto: (photo, url) => {
    const { photos, photoUrls } = get();
    if (photos.length < 2) {
      set({
        photos: [...photos, photo],
        photoUrls: [...photoUrls, url],
      });
    }
  },

  removePhoto: (index) => {
    const { photos, photoUrls } = get();
    const newPhotos = photos.filter((_, i) => i !== index);
    const newUrls = photoUrls.filter((_, i) => i !== index);
    URL.revokeObjectURL(photoUrls[index]);
    set({ photos: newPhotos, photoUrls: newUrls });
  },

  setChildData: (data) => {
    const { childData } = get();
    set({ childData: { ...childData, ...data } });
  },

  toggleInterest: (interestId) => {
    const { selectedInterests } = get();
    const isSelected = selectedInterests.includes(interestId);
    if (isSelected) {
      set({ selectedInterests: selectedInterests.filter((id) => id !== interestId) });
    } else if (selectedInterests.length < 5) {
      set({ selectedInterests: [...selectedInterests, interestId] });
    }
  },

  setCustomInterest: (interest) => set({ customInterest: interest }),
  setBookStyle: (style) => set({ bookStyle: style }),
  setGenerating: (isGenerating) => set({ isGenerating }),

  reset: () => {
    const { photoUrls } = get();
    photoUrls.forEach((url) => URL.revokeObjectURL(url));
    set(initialState);
  },
}));
