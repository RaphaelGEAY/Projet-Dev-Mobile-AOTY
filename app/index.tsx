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

  // Le return définit ce que le composant affiche à l'écran
  // Tout est enveloppé dans une View (conteneur) avec des styles
  return (
    // View principale : conteneur flexible qui centre son contenu
    <View style={styles.container}>
      {/* Titre de bienvenue : texte stylisé avec des propriétés CSS-like */}
      <Text style={styles.title}>Bienvenue dans l'app</Text>

      {/* Sous-titre explicatif */}
      <Text style={styles.subtitle}>Ceci est la page d'accueil minimale.</Text>

      {/* Affichage du compteur : montre la valeur actuelle de count */}
      <Text style={styles.counter}>Compteur : {count}</Text>

      {/* Boutons pour modifier le compteur */}
      {/* Text avec onPress : agit comme un bouton cliquable */}
      <Text style={styles.button} onPress={increment}>
        + Augmenter
      </Text>
      <Text style={styles.button} onPress={decrement}>
        - Diminuer
      </Text>

      {/* Lien pour naviguer vers la page À propos */}
      {/* router.push('/home/about') : ajoute '/home/about' à la pile de navigation (route typée) */}
      <Text style={styles.link} onPress={() => router.push('/home/about')}>
        Aller à À propos
      </Text>
    </View>
  );
}

// Définition des styles avec StyleSheet.create()
// Cela optimise les performances et permet une syntaxe proche du CSS
const styles = StyleSheet.create({
  // Style pour le conteneur principal
  container: {
    flex: 1, // Prend tout l'espace disponible
    alignItems: 'center', // Centre horizontalement les enfants
    justifyContent: 'center', // Centre verticalement les enfants
    padding: 16, // Marge intérieure de 16 pixels
    backgroundColor: '#fff', // Fond blanc
  },
  // Style pour le titre
  title: {
    fontSize: 24, // Taille de police 24
    fontWeight: '700', // Gras
    marginBottom: 8, // Marge en bas
  },
  // Style pour le sous-titre
  subtitle: {
    fontSize: 16, // Taille 16
    color: '#666', // Couleur grise
    textAlign: 'center', // Centré
    marginBottom: 20, // Marge en bas
  },
  // Style pour le compteur
  counter: {
    fontSize: 20, // Taille 20
    fontWeight: '600', // Semi-gras
    marginBottom: 20, // Marge en bas
  },
  // Style pour les boutons
  button: {
    fontSize: 18, // Taille 18
    color: '#007AFF', // Bleu iOS
    textDecorationLine: 'underline', // Souligné
    marginBottom: 10, // Marge en bas
  },
  // Style pour le lien de navigation
  link: {
    fontSize: 18, // Taille 18
    color: '#007AFF', // Bleu
    textDecorationLine: 'underline', // Souligné
  },
});