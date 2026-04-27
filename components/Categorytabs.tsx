import { ScrollView, Text, StyleSheet } from "react-native";

const tabs = ["Latest", "Reviews", "Genres", "Charts", "News"];

export default function CategoryTabs() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.tabs}
    >
      {tabs.map((tab) => (
        <Text key={tab} style={styles.tabText}>
          {tab}
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabs: {
    marginBottom: 20,
  },
  tabText: {
    color: "#aaa",
    marginRight: 20,
    fontSize: 16,
    fontWeight: "600",
  },
});
