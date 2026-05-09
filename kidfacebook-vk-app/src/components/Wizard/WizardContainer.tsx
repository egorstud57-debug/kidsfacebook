import type { FC } from 'react';
import { WizardProgress } from './WizardProgress';
import { WizardNavigation } from './WizardNavigation';
import { PhotoUploader } from '../PhotoUploader';
import { ChildDataForm } from '../ChildDataForm';
import { InterestsSelector } from '../InterestsSelector';
import { StyleSelector } from '../StyleSelector';
import { PreviewScreen } from '../PreviewScreen';
import { useWizard } from '../../hooks';
import { wizardStepCanProceed } from '../../utils/validation';
import { MagicCard } from '../ui';
import type { BookGenerationResult } from '../../api/bookGeneration';

interface WizardContainerProps {
  onBookOrderComplete?: (result: BookGenerationResult) => void;
}

export const WizardContainer: FC<WizardContainerProps> = ({ onBookOrderComplete }) => {
  const { step, prevStep, nextStep, photos, childData, selectedInterests, bookStyle } = useWizard();

  const canProceed = wizardStepCanProceed({
    step,
    photosCount: photos.length,
    childData,
    selectedInterestsCount: selectedInterests.length,
    bookStyle,
  });

  const renderStep = () => {
    switch (step) {
      case 0:
        return <PhotoUploader />;
      case 1:
        return <ChildDataForm />;
      case 2:
        return <InterestsSelector />;
      case 3:
        return <StyleSelector />;
      case 4:
        return <PreviewScreen onOrderComplete={onBookOrderComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-36 sm:pb-32">
      <div className="sticky top-0 z-10 bg-magic-cream/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm">
        <WizardProgress currentStep={step} totalSteps={5} />
      </div>

      <div className="px-3 sm:px-4 py-4 sm:py-6">
        <MagicCard>{renderStep()}</MagicCard>
      </div>

      <WizardNavigation
        showBack={step > 0}
        showNext={step < 4}
        canProceed={canProceed}
        onBack={prevStep}
        onNext={nextStep}
      />
    </div>
  );
};
