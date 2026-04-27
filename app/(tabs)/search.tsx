import { useDeferredValue, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import AlbumCard from "@/components/Albumcard";
import SearchBar from "@/components/Searchbar";
import { QUICK_SEARCHES, searchAlbums } from "@/services/api";
import { Album } from "@/types/album";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query.trim());

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (deferredQuery.length < 2) {
        setResults([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const nextResults = await searchAlbums(deferredQuery);

        if (!cancelled) {
          setResults(nextResults);
        }
      } catch {
        if (!cancelled) {
          setError("Search is unavailable for the moment.");
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
  }, [deferredQuery]);

  const header = (
    <View style={styles.headerBlock}>
      <Text style={styles.heading}>Search Albums</Text>
      <Text style={styles.copy}>
        Query the MusicBrainz release catalog live. Try an artist, album title,
        or genre.
      </Text>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search artists, albums, genres..."
      />
      <View style={styles.quickRow}>
        {QUICK_SEARCHES.map((item) => (
          <Text key={item} style={styles.quickChip} onPress={() => setQuery(item)}>
            {item}
          </Text>
        ))}
      </View>
    </View>
  );

  const shouldShowEmpty = !loading && deferredQuery.length >= 2 && results.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={results}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={header}
        ListEmptyComponent={
          loading ? (
            <View style={styles.centerState}>
              <ActivityIndicator color="#f4c95d" size="large" />
              <Text style={styles.stateText}>Searching the live catalog...</Text>
            </View>
          ) : shouldShowEmpty ? (
            <View style={styles.centerState}>
              <Text style={styles.stateTitle}>No albums found</Text>
              <Text style={styles.stateText}>
                {error ?? "Try another spelling, artist name, or broader genre."}
              </Text>
            </View>
          ) : (
            <View style={styles.centerState}>
              <Text style={styles.stateTitle}>Start with a query</Text>
              <Text style={styles.stateText}>
                Two characters are enough to start a live album search.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <AlbumCard
            album={item}
            onPress={() => router.push(`/album/${item.id}`)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0b0d10",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 120,
  },
  headerBlock: {
    paddingBottom: 18,
  },
  heading: {
    color: "#f5f7fa",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0,
  },
  copy: {
    color: "#98a1af",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  quickChip: {
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
  row: {
    justifyContent: "space-between",
  },
  centerState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 18,
    gap: 10,
  },
  stateTitle: {
    color: "#f5f7fa",
    fontSize: 20,
    fontWeight: "700",
  },
  stateText: {
    color: "#98a1af",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
