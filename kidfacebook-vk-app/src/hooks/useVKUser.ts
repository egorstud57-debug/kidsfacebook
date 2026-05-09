import { useState, useEffect } from 'react';
import type { VKUserData } from '../types';
import { getVKUser, initVKBridge } from '../utils/vkBridge';

export const useVKUser = () => {
  const [user, setUser] = useState<VKUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initVKBridge();
        const userData = await getVKUser();
        setUser(userData);
      } catch (err) {
        setError('Не удалось загрузить данные пользователя');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  return { user, loading, error };
};
