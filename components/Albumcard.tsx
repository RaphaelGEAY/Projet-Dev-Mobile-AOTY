import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";

import { Album } from "@/types/album";

type AlbumCardProps = {
  album: Album;
  onPress?: () => void;
};

export default function AlbumCard({ album, onPress }: AlbumCardProps) {
  const [coverFailed, setCoverFailed] = useState(false);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {coverFailed ? (
        <View style={styles.coverFallback}>
          <Text style={styles.coverFallbackText}>
            {album.artist.slice(0, 1).toUpperCase()}
          </Text>
        </View>
      ) : (
        <Image
          source={{ uri: album.coverUrl }}
          style={styles.cover}
          contentFit="cover"
          transition={180}
          onError={() => setCoverFailed(true)}
        />
      )}

      <Text style={styles.artist} numberOfLines={1}>
        {album.artist}
      </Text>

      <Text style={styles.title} numberOfLines={2}>
        {album.title}
      </Text>

      <View style={styles.metaRow}>
        <Text style={styles.metaChip}>{album.year}</Text>
        <Text style={styles.metaChip}>{album.typeLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    marginBottom: 18,
    gap: 8,
  },
  cover: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: "#151921",
  },
  coverFallback: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: "#151921",
    alignItems: "center",
    justifyContent: "center",
  },
  coverFallbackText: {
    color: "#f4c95d",
    fontSize: 38,
    fontWeight: "800",
  },
  artist: {
    color: "#98a1af",
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    color: "#f5f7fa",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
    minHeight: 40,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaChip: {
    backgroundColor: "#151921",
    color: "#d8dde6",
    borderColor: "#262d38",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "700",
  },
});
