import { ScrollView, Pressable, StyleSheet, Text } from "react-native";

import { DiscoverFeedOption, DiscoverFeed } from "@/services/api";

type CategoryTabsProps = {
  tabs: DiscoverFeedOption[];
  activeTab: DiscoverFeed;
  onChange: (tab: DiscoverFeed) => void;
};

export default function CategoryTabs({
  tabs,
  activeTab,
  onChange,
}: CategoryTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabs}
    >
      {tabs.map((tab) => {
        const active = tab.key === activeTab;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabs: {
    gap: 10,
    paddingTop: 18,
  },
  tab: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#262d38",
    backgroundColor: "#151921",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tabActive: {
    backgroundColor: "#f4c95d",
    borderColor: "#f4c95d",
  },
  tabLabel: {
    color: "#d8dde6",
    fontSize: 13,
    fontWeight: "700",
  },
  tabLabelActive: {
    color: "#11141a",
  },
});
