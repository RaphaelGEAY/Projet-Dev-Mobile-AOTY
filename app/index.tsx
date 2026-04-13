// Import des modules nécessaires depuis React Native et Expo Router
// StyleSheet : pour définir les styles CSS-like pour les composants
// Text et View : composants de base pour afficher du texte et des conteneurs
// router : objet pour naviguer entre les écrans dans Expo Router
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

// Import de useState depuis React : hook pour gérer l'état local du composant
// L'état permet de stocker des données qui changent au cours du temps (comme un compteur)
import { useState } from 'react';

// Définition du composant principal de la page d'accueil
// export default : exporte le composant pour qu'il soit utilisé par Expo Router
export default function Home() {
  // Déclaration d'un état local : count est la valeur actuelle, setCount est la fonction pour la modifier
  // useState(0) : initialise count à 0
  // Quand setCount est appelée, React "réagit" en re-rendant le composant avec la nouvelle valeur
  const [count, setCount] = useState(0);

  // Fonction pour incrémenter le compteur
  // Elle appelle setCount avec la nouvelle valeur (count + 1)
  const increment = () => {
    setCount(count + 1);
  };

  // Fonction pour décrémenter le compteur
  // Elle appelle setCount avec la nouvelle valeur (count - 1)
  const decrement = () => {
    setCount(count - 1);
  };

  const explose = () => {
    setCount(count ** 2);
  };

  const divide = () => {
    setCount(count/ 2);
  };

 const reset = () => {
    setCount(0);
  };

  // Le return définit ce que le composant affiche à l'écran
  // Tout est enveloppé dans une View (conteneur) avec des styles
  return (
    // View principale : conteneur flexible qui centre son contenu
    <View>
      {/* Titre de bienvenue : texte stylisé avec des propriétés CSS-like */}
      <Text>Bienvenue dans l'app</Text>

      {/* Sous-titre explicatif */}
      <Text>Ceci est la page d'accueil minimale.</Text>

      {/* Affichage du compteur : montre la valeur actuelle de count */}
      <Text>{count}</Text>
      <Text>{count}</Text>
      <Text>{count}</Text>
      <Text>{count}</Text>
      <Text>{count}</Text>
      <Text>{count}</Text>
      <Text>{count}</Text>
      <Text>{count}</Text>
      <Text>{count}</Text>
      <Text>{count}</Text>
      <Text>{count}</Text>

      {/* Boutons pour modifier le compteur */}
      {/* Text avec onPress : agit comme un bouton cliquable */}
      <Text onPress={increment}>
        ---L Ajouter J---
      </Text>
      <Text onPress={decrement}>
        ---L Enlever J---
      </Text>
      <Text onPress={explose}>
        ---L Explode J---
      </Text>
      <Text onPress={divide}>
        ---L Divide  J---
      </Text>
      <Text onPress={reset}>
        ---L  Reset  J---
      </Text>

      {/* Lien pour naviguer vers la page À propos */}
      {/* router.push('/home/about') : ajoute '/home/about' à la pile de navigation (route typée) */}
      <Text onPress={() => router.push('/about')}>
        Aller à À propos
      </Text>
    </View>
  );
}
