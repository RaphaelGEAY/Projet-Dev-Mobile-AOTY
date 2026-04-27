import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import AlbumCard from "@/components/Albumcard";
import CategoryTabs from "@/components/Categorytabs";
import {
  DISCOVER_FEEDS,
  fetchDiscoverAlbums,
  type DiscoverFeed,
} from "@/services/api";
import { Album } from "@/types/album";

export default function DiscoverScreen() {
  const [activeFeed, setActiveFeed] = useState<DiscoverFeed>("fresh");
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadAlbums = async () => {
      setError(null);
      setLoading(true);

      try {
        const nextAlbums = await fetchDiscoverAlbums(activeFeed);

        if (!cancelled) {
          setAlbums(nextAlbums);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load albums from MusicBrainz right now.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadAlbums();

    return () => {
      cancelled = true;
    };
  }, [activeFeed]);

  const handleRefresh = async () => {
    setError(null);
    setRefreshing(true);

    try {
      const nextAlbums = await fetchDiscoverAlbums(activeFeed, { force: true });
      setAlbums(nextAlbums);
    } catch {
      setError("Unable to refresh albums right now.");
    } finally {
      setRefreshing(false);
    }
  };

  const header = (
    <View style={styles.headerBlock}>
      <Text style={styles.brand}>AOTY</Text>
      <Text style={styles.subtitle}>
        Album discovery powered by the MusicBrainz catalog instead of local mock
        data.
      </Text>
      <CategoryTabs
        tabs={DISCOVER_FEEDS}
        activeTab={activeFeed}
        onChange={setActiveFeed}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={albums}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={header}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              if (!refreshing) {
                void handleRefresh();
              }
            }}
            tintColor="#f4c95d"
          />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.centerState}>
              <ActivityIndicator color="#f4c95d" size="large" />
              <Text style={styles.stateText}>Loading live albums...</Text>
            </View>
          ) : (
            <View style={styles.centerState}>
              <Text style={styles.stateTitle}>Nothing to show yet</Text>
              <Text style={styles.stateText}>
                {error ?? "Try another feed or pull to refresh."}
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
  brand: {
    color: "#f5f7fa",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
  },
  subtitle: {
    color: "#98a1af",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
    maxWidth: 520,
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
