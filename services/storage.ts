import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "@aoty_onboarding_completed";

export const getHasSeenOnboarding = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === "true";
  } catch (e) {
    console.error("Failed to fetch onboarding state", e);
    return false;
  }
};

export const setHasSeenOnboarding = async (completed: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, completed ? "true" : "false");
  } catch (e) {
    console.error("Failed to save onboarding state", e);
  }
};
