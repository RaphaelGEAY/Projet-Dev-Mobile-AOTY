import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

// Import de useState depuis React : hook pour gérer l'état local du composant
// L'état permet de stocker des données qui changent au cours du temps (comme un compteur)
import { useState } from 'react';

export default function Grandombre() {
  return (
      // View principale : conteneur flexible qui centre son contenu
      <View>
        {/* Titre de bienvenue : texte stylisé avec des propriétés CSS-like */}
        <Text>Grosse Crotte</Text>
        <Text>HA</Text>
        <Text onPress={() => router.push('/about')}>
                Aller à À propos
        </Text>
      </View>
  );
}
