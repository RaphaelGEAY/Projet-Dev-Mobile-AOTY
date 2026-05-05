import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useState } from "react";

import { useSocial } from "@/services/social";

function formatReviewDate(value: string) {
  const date = new Date(value);

  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
}

export default function ProfileScreen() {
  const { currentUser, myReviews, signIn, signOut } = useSocial();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleSignIn = () => {
    const result = signIn({ username, email, password });

    if (!result.ok) {
      setStatus(result.error);
      return;
    }

    setPassword("");
    setStatus(`Bienvenue ${result.user.username}, ton compte local est actif.`);
  };

  const handleSignOut = () => {
    signOut();
    setStatus("Tu es maintenant deconnecte.");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Compte</Text>
        <Text style={styles.copy}>
          Connecte-toi pour publier des avis sur les morceaux et retrouver tes
          critiques dans l&apos;app.
        </Text>

        {currentUser ? (
          <View style={styles.card}>
            <View style={styles.identityRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {currentUser.username.slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <View style={styles.identityText}>
                <Text style={styles.userName}>{currentUser.username}</Text>
                <Text style={styles.userMeta}>{currentUser.email}</Text>
                <Text style={styles.userMeta}>
                  Membre depuis {currentUser.joinedLabel}
                </Text>
              </View>
            </View>

            <View style={styles.badgeRow}>
              <Text style={styles.badge}>Session locale</Text>
              <Text style={styles.badge}>{myReviews.length} avis postes</Text>
            </View>

            <Pressable style={styles.primaryButton} onPress={handleSignOut}>
              <Text style={styles.primaryButtonText}>Se deconnecter</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Connexion</Text>

            <TextInput
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              placeholder="Pseudo"
              placeholderTextColor="#66707d"
              autoCapitalize="words"
              selectionColor="#f4c95d"
            />

            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#66707d"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              selectionColor="#f4c95d"
            />

            <TextInput
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor="#66707d"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              selectionColor="#f4c95d"
            />

            <Pressable style={styles.primaryButton} onPress={handleSignIn}>
              <Text style={styles.primaryButtonText}>Se connecter</Text>
            </Pressable>

            <Text style={styles.helperText}>
              Prototype local: la session reste dans l&apos;app, sans backend ni
              synchronisation distante pour le moment.
            </Text>
          </View>
        )}

        {status ? <Text style={styles.status}>{status}</Text> : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mes avis sur les morceaux</Text>

          {!currentUser ? (
            <Text style={styles.copy}>
              Connecte-toi pour commencer a noter les chansons et suivre ce que
              tu as poste.
            </Text>
          ) : myReviews.length > 0 ? (
            myReviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewTextBlock}>
                    <Text style={styles.reviewTrack}>{review.trackTitle}</Text>
                    <Text style={styles.reviewMeta}>
                      {review.artist} • {review.albumTitle}
                    </Text>
                  </View>
                  <View style={styles.ratingPill}>
                    <Text style={styles.ratingValue}>{review.rating}/5</Text>
                  </View>
                </View>

                <Text style={styles.reviewComment}>{review.comment}</Text>
                <Text style={styles.reviewDate}>
                  Modifie le {formatReviewDate(review.createdAt)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.copy}>
              Aucun avis pour l&apos;instant. Ouvre un album, choisis un morceau et
              poste ton premier retour.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0b0d10",
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 18,
    paddingBottom: 42,
  },
  title: {
    color: "#f5f7fa",
    fontSize: 30,
    fontWeight: "800",
  },
  copy: {
    color: "#98a1af",
    fontSize: 15,
    lineHeight: 23,
  },
  card: {
    backgroundColor: "#11141a",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1f2530",
    padding: 18,
    gap: 14,
  },
  sectionTitle: {
    color: "#f5f7fa",
    fontSize: 18,
    fontWeight: "700",
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f4c95d",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#11141a",
    fontSize: 24,
    fontWeight: "800",
  },
  identityText: {
    flex: 1,
    gap: 4,
  },
  userName: {
    color: "#f5f7fa",
    fontSize: 22,
    fontWeight: "800",
  },
  userMeta: {
    color: "#98a1af",
    fontSize: 14,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  badge: {
    backgroundColor: "#151921",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#262d38",
    color: "#d8dde6",
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    backgroundColor: "#151921",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1f2530",
    color: "#f5f7fa",
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  helperText: {
    color: "#7f8794",
    fontSize: 13,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: "#f4c95d",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: "#11141a",
    fontSize: 15,
    fontWeight: "800",
  },
  status: {
    color: "#f4c95d",
    fontSize: 14,
    fontWeight: "600",
  },
  reviewCard: {
    backgroundColor: "#151921",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#262d38",
    padding: 14,
    gap: 10,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  reviewTextBlock: {
    flex: 1,
    gap: 4,
  },
  reviewTrack: {
    color: "#f5f7fa",
    fontSize: 16,
    fontWeight: "700",
  },
  reviewMeta: {
    color: "#98a1af",
    fontSize: 13,
  },
  ratingPill: {
    backgroundColor: "#1a2117",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2b3821",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  ratingValue: {
    color: "#c9ef76",
    fontSize: 12,
    fontWeight: "800",
  },
  reviewComment: {
    color: "#d8dde6",
    fontSize: 14,
    lineHeight: 21,
  },
  reviewDate: {
    color: "#7f8794",
    fontSize: 12,
    fontWeight: "600",
  },
});
