import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { getMyViewingRequests } from "../api/client";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { useFavorites } from "../state/FavoritesContext";
import { colors, spacing } from "../theme";
import { ViewingRequest } from "../types";

export function ActivityScreen() {
  const [viewings, setViewings] = useState<ViewingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const { favoriteProperties, removeFavorite } = useFavorites();

  async function loadViewings() {
    setLoading(true);
    try {
      setViewings(await getMyViewingRequests());
    } catch (error) {
      Alert.alert("Could not load activity", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadViewings();
  }, []);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>My Activity</Text>
        <Text style={styles.copy}>Track your viewing requests and booking status.</Text>
        <PrimaryButton label={loading ? "Refreshing..." : "Refresh"} onPress={loadViewings} disabled={loading} />
      </View>

      <View style={styles.header}>
        <View style={styles.row}>
          <Text style={styles.title}>Saved properties</Text>
          <Text style={styles.countBadge}>{favoriteProperties.length}</Text>
        </View>
        <Text style={styles.copy}>Homes you saved while searching.</Text>
      </View>

      {favoriteProperties.length ? (
        favoriteProperties.map((property) => (
          <View key={property.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>{property.title}</Text>
              <Text style={styles.price}>${property.price_usd.toLocaleString()}{property.purpose === "rent" ? "/mo" : ""}</Text>
            </View>
            <Text style={styles.copy}>
              {property.suburb}, {property.city} - {property.bedrooms} bed - {property.bathrooms} bath
            </Text>
            <PrimaryButton label="Remove from saved" onPress={() => removeFavorite(property.id)} variant="secondary" />
          </View>
        ))
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No saved properties yet</Text>
          <Text style={styles.copy}>Tap the heart on a property to keep it here.</Text>
        </View>
      )}

      {viewings.length ? (
        viewings.map((viewing) => (
          <View key={viewing.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>{viewing.property_title ?? "Property viewing"}</Text>
              <Text style={[styles.status, styles[`status_${viewing.status}` as keyof typeof styles]]}>{viewing.status}</Text>
            </View>
            <Text style={styles.copy}>{viewing.property_location ?? viewing.property_id}</Text>
            {viewing.preferred_time ? <Text style={styles.copy}>Preferred time: {viewing.preferred_time}</Text> : null}
            <Text style={viewing.contact_unlocked ? styles.unlockedNote : styles.lockedNote}>
              {viewing.contact_unlocked ? "Landlord confirmed interest. Contact details are unlocked." : "Sensitive profile details remain private until confirmed."}
            </Text>
            {viewing.message ? <Text style={styles.message}>{viewing.message}</Text> : null}
            <Text style={styles.reference}>Reference: {viewing.id.slice(0, 8)}</Text>
          </View>
        ))
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No viewing requests yet</Text>
          <Text style={styles.copy}>Book a viewing from a property card or detail page, then it will appear here.</Text>
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
    fontSize: 24,
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
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  cardTitle: {
    flex: 1,
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  countBadge: {
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: "#eaf4ed",
    color: colors.green,
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: "900"
  },
  price: {
    color: colors.green,
    fontSize: 16,
    fontWeight: "900"
  },
  copy: {
    color: colors.muted,
    lineHeight: 21
  },
  message: {
    color: colors.ink,
    lineHeight: 21
  },
  reference: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  status: {
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    color: colors.green,
    backgroundColor: "#eaf4ed",
    fontSize: 12,
    fontWeight: "900"
  },
  status_confirmed: {
    color: colors.blue,
    backgroundColor: "#e8f2f7"
  },
  status_cancelled: {
    color: colors.red,
    backgroundColor: "#fbece8"
  },
  status_completed: {
    color: colors.ink,
    backgroundColor: colors.soft
  },
  lockedNote: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18
  },
  unlockedNote: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 18
  }
});
