import bridge, { UserInfo } from '@vkontakte/vk-bridge';
import type { VKUserData } from '../types';

export const initVKBridge = async (): Promise<void> => {
  try {
    await bridge.send('VKWebAppInit');
    console.log('VK Bridge initialized');
  } catch (error) {
    console.error('VK Bridge init error:', error);
  }
};

export const getVKUser = async (): Promise<VKUserData | null> => {
  try {
    const user: UserInfo = await bridge.send('VKWebAppGetUserInfo');
    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      photo: user.photo_200 || user.photo_100 || '',
    };
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};

export const getPhotosFromVK = async (): Promise<string[]> => {
  try {
    return [];
  } catch (error) {
    console.error('Get photos error:', error);
    return [];
  }
};

export const showPayment = async (amount: number): Promise<boolean> => {
  try {
    if (!Number.isFinite(amount) || amount <= 0) {
      console.log('Генерация бесплатная (цена 0 или не задана).');
      return true;
    }
    console.log(`Payment requested: ${amount} RUB`);
    return true;
  } catch (error) {
    console.error('Payment error:', error);
    return false;
  }
};

export const setVKTheme = (scheme: 'light' | 'dark'): void => {
  document.body.setAttribute('data-vk-scheme', scheme);
  if (scheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
