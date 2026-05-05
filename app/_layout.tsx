import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { SocialProvider } from "@/services/social";

export default function RootLayout() {
  return (
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
  );
}
