import { View, Text, Image, StyleSheet } from "react-native";
import { Album } from "../types/album";

export default function AlbumCard({ album }: { album: Album }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: album.cover }} style={styles.cover} />

      <Text style={styles.artist} numberOfLines={1}>
        {album.artist}
      </Text>

      <Text style={styles.title} numberOfLines={1}>
        {album.title}
      </Text>

      <View style={styles.scores}>
        <View style={styles.scoreCriticBox}>
          <Text style={styles.scoreCritic}>{album.critic}</Text>
        </View>

        <View style={styles.scoreUserBox}>
          <Text style={styles.scoreUser}>{album.user}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "150%",
    marginBottom: 18,
  },

  cover: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 6,
    marginBottom: 6,
  },

  artist: {
    color: "#ccc",
    fontSize: 12,
    marginBottom: 1,
  },

  title: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },

  scores: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: 4,
  },

  scoreCriticBox: {
    backgroundColor: "#1f3d1f",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },

  scoreUserBox: {
    backgroundColor: "#1f2d3d",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },

  scoreCritic: {
    color: "#4CAF50",
    fontWeight: "700",
    fontSize: 13,
  },

  scoreUser: {
    color: "#2196F3",
    fontWeight: "700",
    fontSize: 13,
  },
});
