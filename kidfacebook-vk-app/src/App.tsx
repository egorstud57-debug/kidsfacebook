import { useState, useEffect, type FC } from 'react';
import { AdaptivityProvider, ConfigProvider, AppRoot } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import bridge from '@vkontakte/vk-bridge';
import { StartPage } from './pages/StartPage';
import { WizardPage } from './pages/WizardPage';
import { ResultPage } from './pages/ResultPage';
import { useWizard } from './hooks';
import type { BookGenerationResult } from './api/bookGeneration';

type AppPage = 'start' | 'wizard' | 'result';

const App: FC = () => {
  const [activePage, setActivePage] = useState<AppPage>('start');
  const [bookResult, setBookResult] = useState<BookGenerationResult | null>(null);
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  const { reset } = useWizard();

  useEffect(() => {
    void bridge.send('VKWebAppInit');

    bridge.subscribe((event) => {
      if (event.detail.type === 'VKWebAppUpdateConfig') {
        const scheme = event.detail.data.scheme;
        setAppearance(scheme === 'space_gray' || scheme === 'vkcom_dark' ? 'dark' : 'light');
      }
    });

    void bridge.send('VKWebAppGetConfig').then((config) => {
      if (config.scheme) {
        setAppearance(config.scheme === 'space_gray' || config.scheme === 'vkcom_dark' ? 'dark' : 'light');
      }
    });
  }, []);

  const handleStart = () => {
    setActivePage('wizard');
  };

  const handleReset = () => {
    reset();
    setBookResult(null);
    setActivePage('start');
  };

  const handleComplete = (result: BookGenerationResult) => {
    setBookResult(result);
    setActivePage('result');
  };

  return (
    <ConfigProvider appearance={appearance}>
      <AdaptivityProvider>
        <AppRoot>
          <div className={appearance === 'dark' ? 'dark' : ''}>
            {activePage === 'start' && <StartPage onStart={handleStart} />}
            {activePage === 'wizard' && <WizardPage onComplete={handleComplete} />}
            {activePage === 'result' && bookResult && (
              <ResultPage result={bookResult} onReset={handleReset} />
            )}
          </div>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
};

export default App;

