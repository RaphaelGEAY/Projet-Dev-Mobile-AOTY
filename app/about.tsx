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
export default function AboutScreen() {
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
    <View style={styles.container}>
      {/* Titre principal : texte stylisé pour attirer l'attention */}
      <Text style={styles.title}>À propos de cette app</Text>

      {/* Description : explique brièvement l'app */}
      <Text style={styles.subtitle}>
        Cette application démontre les bases de React Native avec Expo et Expo Router.
      </Text>

      {/* Section des fonctionnalités : titre pour la liste */}
      <Text style={styles.sectionTitle}>Fonctionnalités :</Text>

      {/* Mapping sur le tableau features pour créer une liste de Text */}
      {/* map() : transforme chaque élément du tableau en un composant Text */}
      {features.map((feature, index) => (
        // key : propriété obligatoire pour les listes React (aide à l'optimisation)
        <Text key={index} style={styles.feature}>
          • {feature} {/* • : puce, feature : le texte de la fonctionnalité */}
        </Text>
      ))}

      {/* Bouton de retour : Text cliquable qui appelle goBack */}
      <Text style={styles.link} onPress={goBack}>
        Retour à l'accueil
      </Text>
    </View>
  );
}

// Définition des styles avec StyleSheet.create()
// Avantages : optimisation des performances, autocomplétion, erreurs à la compilation
const styles = StyleSheet.create({
  // Style du conteneur : layout flexible centré
  container: {
    flex: 1, // Occupe tout l'espace vertical disponible
    alignItems: 'center', // Centre les enfants horizontalement
    justifyContent: 'center', // Centre les enfants verticalement
    padding: 16, // Espace intérieur de 16 unités
    backgroundColor: '#f5f5f5', // Fond gris clair pour différencier de l'accueil
  },
  // Style du titre : grand et gras
  title: {
    fontSize: 24, // Taille de police 24 (grande)
    fontWeight: '700', // Poids gras (bold)
    marginBottom: 8, // Marge en bas pour espacer
    textAlign: 'center', // Centré horizontalement
  },
  // Style du sous-titre : plus petit et gris
  subtitle: {
    fontSize: 16, // Taille 16 (moyenne)
    color: '#666', // Couleur grise pour moins d'importance
    textAlign: 'center', // Centré
    marginBottom: 20, // Marge en bas
    lineHeight: 22, // Hauteur de ligne pour la lisibilité
  },
  // Style du titre de section : semi-gras
  sectionTitle: {
    fontSize: 20, // Taille 20
    fontWeight: '600', // Semi-gras
    marginBottom: 10, // Marge en bas
    alignSelf: 'flex-start', // Aligne à gauche (pas centré)
  },
  // Style des éléments de fonctionnalité : liste
  feature: {
    fontSize: 16, // Taille 16
    color: '#333', // Couleur sombre
    marginBottom: 5, // Petite marge entre les items
    alignSelf: 'flex-start', // Aligne à gauche
  },
  // Style du lien/bouton : bleu et souligné
  link: {
    fontSize: 18, // Taille 18
    color: '#007AFF', // Bleu standard iOS
    textDecorationLine: 'underline', // Souligné pour indiquer cliquable
    marginTop: 20, // Marge en haut pour espacer
  },
});