import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
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
  );
}
