import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { approveProperty, getPendingProperties } from "../api/client";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { colors, spacing } from "../theme";
import { Property } from "../types";

export function AdminScreen() {
  const [pending, setPending] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadPending() {
    setLoading(true);
    try {
      setPending(await getPendingProperties());
    } catch {
      setPending([]);
    } finally {
      setLoading(false);
    }
  }

  async function approve(property: Property) {
    try {
      await approveProperty(property.id);
      Alert.alert("Approved", `${property.title} is now live.`);
      loadPending();
    } catch {
      Alert.alert("Backend needed", "Run the FastAPI backend to approve listings.");
    }
  }

  useEffect(() => {
    loadPending();
  }, []);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Listing approval</Text>
        <PrimaryButton label={loading ? "Refreshing..." : "Refresh"} onPress={loadPending} disabled={loading} />
      </View>
      {pending.length ? (
        pending.map((property) => (
          <View key={property.id} style={styles.card}>
            <Text style={styles.cardTitle}>{property.title}</Text>
            <Text style={styles.copy}>
              {property.suburb}, {property.city} - {property.management_option}
            </Text>
            <PrimaryButton label="Approve" onPress={() => approve(property)} />
          </View>
        ))
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No pending listings</Text>
          <Text style={styles.copy}>New owner submissions will appear here once the backend is running.</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: spacing.md
  },
  title: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "900"
  },
  card: {
    gap: spacing.sm,
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
  copy: {
    color: colors.muted,
    lineHeight: 21
  }
});
