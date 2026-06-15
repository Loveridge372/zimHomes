import { StyleSheet, Text, View } from "react-native";

import { Screen } from "../components/Screen";
import { colors, spacing } from "../theme";

const services = [
  ["Tenant sourcing", "Advertise, screen inquiries, schedule viewings, and prepare tenant applications."],
  ["Rent collection", "Collect rent through supported local payment channels and track arrears."],
  ["Maintenance", "Log repair requests, assign contractors, and update owners."],
  ["Owner reports", "Monthly statements show income, fees, costs, and occupancy."]
];

export function ManagementScreen() {
  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Wana Imba managed</Text>
        <Text style={styles.title}>We can act as your property agent.</Text>
        <Text style={styles.copy}>Recommended monthly management fee: 8% to 12% of collected rent.</Text>
      </View>
      {services.map(([title, copy]) => (
        <View key={title} style={styles.card}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardCopy}>{copy}</Text>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.sm,
    borderRadius: 8,
    padding: spacing.lg,
    backgroundColor: "#15261d"
  },
  eyebrow: {
    color: colors.gold,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  title: {
    color: colors.surface,
    fontSize: 28,
    fontWeight: "900"
  },
  copy: {
    color: "#eaf4ed",
    lineHeight: 22
  },
  card: {
    gap: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: spacing.md
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  cardCopy: {
    color: colors.muted,
    lineHeight: 21
  }
});
