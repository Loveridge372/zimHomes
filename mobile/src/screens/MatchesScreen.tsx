import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { getMyMatches } from "../api/client";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { colors, spacing } from "../theme";
import { PropertyMatch } from "../types";

function money(value: number, purpose: string) {
  return purpose === "rent" ? `$${value.toLocaleString()}/mo` : `$${value.toLocaleString()}`;
}

export function MatchesScreen() {
  const [matches, setMatches] = useState<PropertyMatch[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadMatches() {
    setLoading(true);
    try {
      setMatches(await getMyMatches());
    } catch (error) {
      Alert.alert("Could not load matches", error instanceof Error ? error.message : "Please complete your profile and try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatches();
  }, []);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Your Matches</Text>
        <Text style={styles.copy}>Ranked by budget, preferred area, property type, household size, and amenities.</Text>
        <PrimaryButton label={loading ? "Matching..." : "Refresh matches"} onPress={loadMatches} disabled={loading} />
      </View>

      {matches.length ? (
        matches.map((match) => (
          <View key={match.property.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>{match.property.title}</Text>
              <Text style={styles.score}>{match.score}%</Text>
            </View>
            <Text style={styles.copy}>
              {match.property.suburb}, {match.property.city} - {match.property.bedrooms} bed - {match.property.bathrooms} bath
            </Text>
            <Text style={styles.price}>{money(match.property.price_usd, match.property.purpose)}</Text>
            <View style={styles.reasonRow}>
              {match.reasons.map((reason) => (
                <Text key={reason} style={styles.reason}>{reason}</Text>
              ))}
            </View>
            {match.property.amenities.length ? (
              <View style={styles.amenityRow}>
                {match.property.amenities.slice(0, 6).map((amenity) => (
                  <Text key={amenity} style={styles.amenity}>{amenity}</Text>
                ))}
              </View>
            ) : null}
          </View>
        ))
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No matches yet</Text>
          <Text style={styles.copy}>Complete your Profile with budget, preferred areas, household size, and amenities, then refresh matches.</Text>
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
  copy: {
    color: colors.muted,
    lineHeight: 21
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
  score: {
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: colors.green,
    color: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    fontWeight: "900"
  },
  price: {
    color: colors.green,
    fontSize: 20,
    fontWeight: "900"
  },
  reasonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  reason: {
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: "#eaf4ed",
    color: colors.green,
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: "900"
  },
  amenityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  amenity: {
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: colors.soft,
    color: colors.ink,
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: "800"
  }
});
