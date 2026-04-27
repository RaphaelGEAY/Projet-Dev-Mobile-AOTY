import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

const rows = [
  {
    label: "Remote catalog",
    value: "MusicBrainz release-group search",
  },
  {
    label: "Artwork",
    value: "Cover Art Archive front covers",
  },
  {
    label: "Search mode",
    value: "Live API queries, no hardcoded album array",
  },
  {
    label: "Album detail",
    value: "Genres, community score, tracklist, release metadata",
  },
];

export default function DataScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Data Stack</Text>
        <Text style={styles.copy}>
          The app now consumes a real music catalog API instead of static objects
          inside the screen files. That gives us live albums, real identifiers,
          and a path toward reviews, saved lists, and auth later.
        </Text>

        <View style={styles.section}>
          {rows.map((row) => (
            <View key={row.label} style={styles.row}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next backend step</Text>
          <Text style={styles.copy}>
            If you want full AOTY behavior with user reviews, lists, likes, and
            authentication, the clean next move is a small custom API backed by
            Supabase or Firebase. The UI and service layer are now separated so
            that swap will be straightforward.
          </Text>
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
    gap: 20,
  },
  title: {
    color: "#f5f7fa",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 0,
  },
  copy: {
    color: "#98a1af",
    fontSize: 15,
    lineHeight: 23,
  },
  section: {
    backgroundColor: "#11141a",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1f2530",
    gap: 14,
  },
  sectionTitle: {
    color: "#f5f7fa",
    fontSize: 18,
    fontWeight: "700",
  },
  row: {
    gap: 6,
  },
  rowLabel: {
    color: "#f4c95d",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  rowValue: {
    color: "#d8dde6",
    fontSize: 15,
    lineHeight: 22,
  },
});
