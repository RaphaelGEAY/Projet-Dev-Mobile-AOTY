import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
};

export default function SearchBar({
  value,
  onChangeText,
  placeholder,
}: SearchBarProps) {
  return (
    <View style={styles.wrapper}>
      <Ionicons name="search-outline" size={18} color="#98a1af" />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#66707d"
        autoCapitalize="none"
        autoCorrect={false}
        selectionColor="#f4c95d"
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChangeText("")}>
          <Ionicons name="close-circle" size={18} color="#98a1af" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#11141a",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f2530",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 16,
  },
  input: {
    flex: 1,
    color: "#f5f7fa",
    fontSize: 15,
    padding: 0,
  },
});
