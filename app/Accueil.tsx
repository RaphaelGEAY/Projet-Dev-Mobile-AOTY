import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function Accueil() {

  return (
    <View style={styles.container}>

      <Text style={styles.title}>AOTY</Text>

      <Text style={styles.subtitle}>New releases</Text>

      <Text style={styles.link} onPress={() => router.push('/home')}>
        Aller à index pour manger le caca
      </Text>
    </View>
  );
}

// Styles pour les composants
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1FBBC6',
    padding: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#A6C',
    marginBottom: 20,
  },
  counter: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF00FF',
    marginBottom: 30,
  },
  button: {
    fontSize: 24,
    color: '#fff',
    backgroundColor: '#007bff',
    padding: 10,
    margin: 5,
    borderRadius: 50,
    textAlign: 'center',
  },
  link: {
    fontSize: 16,
    color: '#F56F2F',
    backgroundColor: '#007bff',
    padding: 10,
    margin: 5,
    borderRadius: 50,
    textAlign: 'center',
  },
});
