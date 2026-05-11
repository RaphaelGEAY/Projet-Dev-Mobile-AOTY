import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LogBox, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { SocialProvider } from "@/services/social";
import { getHasSeenOnboarding } from "@/services/storage";

if (Platform.OS === "web") {
  LogBox.ignoreLogs([
    "props.pointerEvents is deprecated. Use style.pointerEvents",
  ]);
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkOnboarding = async () => {
      const hasSeen = await getHasSeenOnboarding();

      const inOnboardingGroup = segments[0] === "onboarding";

      if (!hasSeen && !inOnboardingGroup) {
        // Redirect to onboarding if they haven't seen it
        router.replace("/onboarding");
      } else if (hasSeen && inOnboardingGroup) {
        // Redirect away from onboarding if they have seen it
        router.replace("/(tabs)");
      }

      setIsReady(true);
    };

    void checkOnboarding();
  }, [segments, router]);

  if (!isReady) {
    return null; // Or a splash screen
  }

  return (
    <SafeAreaProvider>
      <SocialProvider>
        <>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: "#0b0d10" },
              headerTintColor: "#f5f7fa",
              contentStyle: { backgroundColor: "#0b0d10" },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen
              name="album/[id]"
              options={{
                title: "Album",
                headerBackTitle: "Back",
              }}
            />
          </Stack>
        </>
      </SocialProvider>
    </SafeAreaProvider>
  );
}
