import { ReactNode } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

import { colors, spacing } from "../theme";

type Props = TextInputProps & {
  label: string;
  rightElement?: ReactNode;
};

export function Field({ label, rightElement, style, ...inputProps }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput placeholderTextColor="#8b948d" style={[styles.input, rightElement ? styles.inputWithAction : null, style]} {...inputProps} />
        {rightElement ? <View style={styles.action}>{rightElement}</View> : null}
      </View>
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
  inputWrap: {
    position: "relative",
    justifyContent: "center"
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    color: colors.ink
  },
  inputWithAction: {
    paddingRight: 48
  },
  action: {
    position: "absolute",
    right: 6,
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center"
  }
});
