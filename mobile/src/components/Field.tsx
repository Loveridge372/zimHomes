import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

import { colors, spacing } from "../theme";

type Props = TextInputProps & {
  label: string;
};

export function Field({ label, ...inputProps }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor="#8b948d" style={styles.input} {...inputProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    color: colors.ink
  }
});
