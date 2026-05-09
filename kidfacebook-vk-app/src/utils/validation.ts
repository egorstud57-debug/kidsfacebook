import type { BookStyle, ChildData } from '../types';

export type WizardStepSnapshot = {
  step: number;
  photosCount: number;
  childData: ChildData;
  selectedInterestsCount: number;
  bookStyle: BookStyle;
};

export function wizardStepCanProceed(snapshot: WizardStepSnapshot): boolean {
  const { step, photosCount, childData, selectedInterestsCount, bookStyle } = snapshot;
  switch (step) {
    case 0:
      return photosCount > 0;
    case 1:
      return (
        childData.name.trim().length >= 2 && childData.age >= 3 && childData.age <= 10
      );
    case 2:
      return selectedInterestsCount > 0;
    case 3:
      return Boolean(bookStyle);
    case 4:
      return true;
    default:
      return false;
  }
}
