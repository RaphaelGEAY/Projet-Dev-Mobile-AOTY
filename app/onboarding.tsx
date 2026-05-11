import React, { useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { setHasSeenOnboarding } from "@/services/storage";

const { width } = Dimensions.get("window");

const ONBOARDING_STEPS = [
  {
    title: "Welcome to AOTY",
    description: "Discover your next favorite album from a vast catalog of music.",
    color: "#f4c95d",
  },
  {
    title: "Real Data",
    description: "Powered by the MusicBrainz catalog, providing you with accurate and up-to-date music information.",
    color: "#98a1af",
  },
  {
    title: "Join the Community",
    description: "Rate, review, and share your findings with other music lovers.",
    color: "#f5f7fa",
  },
];

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / width);
    setActiveIndex(index);
  };

  const handleFinish = async () => {
    await setHasSeenOnboarding(true);
    router.replace("/(tabs)");
  };

  const handleNext = () => {
    if (activeIndex < ONBOARDING_STEPS.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (activeIndex + 1) * width,
        animated: true,
      });
    } else {
      void handleFinish();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {ONBOARDING_STEPS.map((step, index) => (
          <View key={index} style={styles.page}>
            <View style={[styles.circle, { backgroundColor: step.color }]} />
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.description}>{step.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.indicatorContainer}>
          {ONBOARDING_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === activeIndex && styles.activeIndicator,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {activeIndex === ONBOARDING_STEPS.length - 1 ? "Get Started" : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0d10",
  },
  page: {
    width,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 40,
    opacity: 0.8,
  },
  title: {
    color: "#f5f7fa",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    color: "#98a1af",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  footer: {
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  indicatorContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#333",
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: "#f4c95d",
    width: 20,
  },
  button: {
    backgroundColor: "#f4c95d",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    minWidth: 200,
    alignItems: "center",
  },
  buttonText: {
    color: "#0b0d10",
    fontSize: 16,
    fontWeight: "700",
  },
});
