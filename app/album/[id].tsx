import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";

import { fetchAlbumDetails } from "@/services/api";
import { AlbumDetails } from "@/types/album";

export default function AlbumDetailsScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const [album, setAlbum] = useState<AlbumDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!params.id) {
        setError("Album not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const details = await fetchAlbumDetails(params.id);

        if (!cancelled) {
          setAlbum(details);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load this album.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  return (
    <>
      <Stack.Screen options={{ title: album?.title ?? "Album" }} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color="#f4c95d" size="large" />
            <Text style={styles.stateText}>Loading album details...</Text>
          </View>
        ) : error || !album ? (
          <View style={styles.centerState}>
            <Text style={styles.stateTitle}>Album unavailable</Text>
            <Text style={styles.stateText}>{error ?? "Please try again later."}</Text>
          </View>
        ) : (
          <>
            <Image
              source={{ uri: album.coverUrl }}
              style={styles.cover}
              contentFit="cover"
              transition={200}
            />

            <Text style={styles.artist}>{album.artist}</Text>
            <Text style={styles.title}>{album.title}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaChip}>{album.year}</Text>
              <Text style={styles.metaChip}>{album.typeLabel}</Text>
              <Text style={styles.metaChip}>{album.trackCount} tracks</Text>
            </View>

            {album.communityScore ? (
              <View style={styles.scoreRow}>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreValue}>{album.communityScore}</Text>
                  <Text style={styles.scoreLabel}>Community</Text>
                </View>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreValue}>{album.ratingCount}</Text>
                  <Text style={styles.scoreLabel}>Votes</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Release info</Text>
              <Text style={styles.copy}>
                First release: {album.releaseDate || "Unknown"}{"\n"}
                Release status: {album.releaseStatus || "Unknown"}{"\n"}
                Country: {album.releaseCountry || "Unknown"}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Genres</Text>
              <View style={styles.genreWrap}>
                {album.genres.length > 0 ? (
                  album.genres.map((genre) => (
                    <Text key={genre} style={styles.genreChip}>
                      {genre}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.copy}>No genre tags were returned.</Text>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tracklist</Text>
              {album.tracks.length > 0 ? (
                album.tracks.map((track) => (
                  <View key={track.id} style={styles.trackRow}>
                    <View style={styles.trackNumber}>
                      <Text style={styles.trackNumberText}>{track.position}</Text>
                    </View>
                    <View style={styles.trackMain}>
                      <Text style={styles.trackTitle}>{track.title}</Text>
                      <Text style={styles.trackArtist}>{track.artist}</Text>
                    </View>
                    <Text style={styles.trackLength}>{track.length ?? "--:--"}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.copy}>
                  This release does not expose a tracklist in the selected API
                  response.
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0b0d10",
  },
  content: {
    padding: 20,
    paddingBottom: 48,
    gap: 18,
  },
  cover: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 24,
    backgroundColor: "#151921",
  },
  artist: {
    color: "#f4c95d",
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0,
  },
  title: {
    color: "#f5f7fa",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 36,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metaChip: {
    backgroundColor: "#151921",
    color: "#d8dde6",
    borderColor: "#262d38",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: "600",
  },
  scoreRow: {
    flexDirection: "row",
    gap: 12,
  },
  scoreBox: {
    flex: 1,
    backgroundColor: "#11141a",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1f2530",
    padding: 18,
    gap: 6,
  },
  scoreValue: {
    color: "#f5f7fa",
    fontSize: 28,
    fontWeight: "800",
  },
  scoreLabel: {
    color: "#98a1af",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  section: {
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
  copy: {
    color: "#98a1af",
    fontSize: 15,
    lineHeight: 23,
  },
  genreWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  genreChip: {
    backgroundColor: "#1a2117",
    color: "#c9ef76",
    borderColor: "#2b3821",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: "600",
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  trackNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#151921",
    alignItems: "center",
    justifyContent: "center",
  },
  trackNumberText: {
    color: "#d8dde6",
    fontSize: 13,
    fontWeight: "700",
  },
  trackMain: {
    flex: 1,
    gap: 2,
  },
  trackTitle: {
    color: "#f5f7fa",
    fontSize: 15,
    fontWeight: "600",
  },
  trackArtist: {
    color: "#98a1af",
    fontSize: 13,
  },
  trackLength: {
    color: "#98a1af",
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
  centerState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 72,
    gap: 10,
  },
  stateTitle: {
    color: "#f5f7fa",
    fontSize: 22,
    fontWeight: "700",
  },
  stateText: {
    color: "#98a1af",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
});
