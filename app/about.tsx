// Import de router depuis expo-router : pour la navigation
// Permet de revenir en arrière ou naviguer vers d'autres routes
import { router } from 'expo-router';

// Import des composants de base depuis React Native
// StyleSheet : pour créer des styles optimisés
// Text : pour afficher du texte
// View : conteneur flexible pour organiser les éléments
import { StyleSheet, Text, View } from 'react-native';

// Définition du composant AboutScreen
// C'est une fonction composant React qui retourne du JSX
// export default : rend ce composant importable ailleurs
export default function About() {
  // Fonction pour gérer le retour à l'accueil
  // router.back() : retire l'écran actuel de la pile de navigation
  const goBack = () => {
    router.back();
  };

  // Liste des fonctionnalités de l'app (tableau de chaînes)
  // Utilisée pour afficher une liste dynamique
  const features = [
    'Navigation avec Expo Router', // Chaîne 1
    'Composants React Native', // Chaîne 2
    'Styles avec StyleSheet', // Chaîne 3
    'État local avec useState', // Chaîne 4
  ];
  // Le return contient le JSX : la structure de l'interface
  return (
    // View conteneur principal : enveloppe tout le contenu
    <View>
      {/* Titre principal : texte stylisé pour attirer l'attention */}
      <Text>À propos de cette app</Text>

      {/* Description : explique brièvement l'app */}
      <Text>
        Cette application démontre les bases de React Native avec Expo et Expo Router.
      </Text>

      {/* Section des fonctionnalités : titre pour la liste */}
      <Text>Fonctionnalités :</Text>

      {/* Mapping sur le tableau features pour créer une liste de Text */}
      {/* map() : transforme chaque élément du tableau en un composant Text */}
      {features.map((feature, index) => (
        // key : propriété obligatoire pour les listes React (aide à l'optimisation)
        <Text key={index}>
          • {feature} {/* • : puce, feature : le texte de la fonctionnalité */}
        </Text>
      ))}
      <Text onPress={() => router.push('/caca')}>
        Aller à caca
      </Text>
    </View>
  );
}
