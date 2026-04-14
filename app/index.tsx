import { router } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  useEffect(() => {
    // Délai pour s'assurer que le layout est monté
    setTimeout(() => {
      router.replace('/accueil');
    }, 0);
  }, []);

  return null;
}
