import type { FC } from 'react';
import { WizardContainer } from '../components/Wizard';
import { GeneratingPage } from './GeneratingPage';
import { useWizard } from '../hooks';
import type { BookGenerationResult } from '../api/bookGeneration';

interface WizardPageProps {
  onComplete?: (result: BookGenerationResult) => void;
}

export const WizardPage: FC<WizardPageProps> = ({ onComplete }) => {
  const { isGenerating } = useWizard();

  if (isGenerating) {
    return <GeneratingPage />;
  }

  return <WizardContainer onBookOrderComplete={onComplete} />;
};
