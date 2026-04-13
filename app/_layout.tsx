// Import de Stack depuis expo-router
// Stack : composant pour gérer une pile de navigation (empilement d'écrans)
// Permet de naviguer entre les écrans avec des animations natives
import { Stack } from 'expo-router';

// Définition du layout racine de l'application
// _layout.tsx : fichier spécial dans Expo Router qui définit le layout pour toutes les routes
// Ce layout enveloppe toutes les pages de l'app
export default function RootLayout() {
  // Retourne le composant Stack
  // Stack gère automatiquement la navigation basée sur les fichiers dans app/
  // Par exemple, app/index.tsx devient la route '/', app/about.tsx devient '/about'
  return <Stack />;
}