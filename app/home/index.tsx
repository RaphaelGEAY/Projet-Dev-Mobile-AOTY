import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue dans l'app</Text>
      <Text style={styles.subtitle}>Ceci est la page d'accueil minimale.</Text>
      <Text style={styles.link} onPress={() => router.push('/about')}>
        Aller à À propos
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  link: {
    fontSize: 18,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});
