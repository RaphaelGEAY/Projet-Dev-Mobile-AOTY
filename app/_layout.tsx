import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LogBox, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { SocialProvider } from "@/services/social";

if (Platform.OS === "web") {
  LogBox.ignoreLogs([
    "props.pointerEvents is deprecated. Use style.pointerEvents",
  ]);
}

export default function RootLayout() {
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
