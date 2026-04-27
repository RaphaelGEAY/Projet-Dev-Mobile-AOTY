import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ScrollView } from "react-native";

const albums = [
  {
    id: "1",
    title: "Midnight Echoes",
    artist: "Luna Grey",
    cover: "https://picsum.photos/200?random=1",
    critic: 82,
    user: 76,
  },
  {
    id: "2",
    title: "Neon Skies",
    artist: "Atlas Wave",
    cover: "https://picsum.photos/200?random=2",
    critic: 74,
    user: 81,
  },
  {
    id: "3",
    title: "Fragments",
    artist: "Nova Hale",
    cover: "https://picsum.photos/200?random=3",
    critic: 79,
    user: 84,
  },
  {
    id: "4",
    title: "Bloom",
    artist: "Eden Vale",
    cover: "https://picsum.photos/200?random=4",
    critic: 71,
    user: 68,
  },
];

export default function Home() {
  return (
    <View style={styles.container}>

      {/* HEADER */}
      <Text style={styles.header}>AOTY</Text>

      {/* NAV TABS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
        {["Latest", "Reviews", "Genres", "Charts", "News"].map((tab) => (
          <Text key={tab} style={styles.tabText}>{tab}</Text>
        ))}
      </ScrollView>

      {/* GRID ALBUMS */}
      <FlatList
        data={albums}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Image source={{ uri: item.cover }} style={styles.cover} />

            <Text style={styles.artist} numberOfLines={1}>{item.artist}</Text>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>

            <View style={styles.scores}>
              <View style={styles.scoreCriticBox}>
                <Text style={styles.scoreCritic}>{item.critic}</Text>
              </View>

              <View style={styles.scoreUserBox}>
                <Text style={styles.scoreUser}>{item.user}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    paddingTop: 30,      
    paddingHorizontal: 12, 
  },

  header: {
    color: "white",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 10,
  },

  tabs: {
    marginBottom: 16,
  },

  tabText: {
    color: "#aaa",
    marginRight: 18,
    fontSize: 15,
    fontWeight: "600",
  },

  card: {
    width: "47%",        
    marginBottom: 16,
  },

  cover: {
    width: "100%",
    aspectRatio: 1,       
    borderRadius: 6,
    marginBottom: 4,
  },

  artist: {
    color: "#ccc",
    fontSize: 11,
    marginBottom: 1,
  },

  title: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },

  scores: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: 2,
  },

  scoreCriticBox: {
    backgroundColor: "#1f3d1f",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },

  scoreUserBox: {
    backgroundColor: "#1f2d3d",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },

  scoreCritic: {
    color: "#4CAF50",
    fontWeight: "700",
    fontSize: 12,
  },

  scoreUser: {
    color: "#2196F3",
    fontWeight: "700",
    fontSize: 12,
  },
});
