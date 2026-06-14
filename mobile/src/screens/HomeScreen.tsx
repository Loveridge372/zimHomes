import { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { getProperties, initiatePayment } from "../api/client";
import { Field } from "../components/Field";
import { PrimaryButton } from "../components/PrimaryButton";
import { PropertyCard } from "../components/PropertyCard";
import { Screen } from "../components/Screen";
import { demoProperties } from "../data/demoProperties";
import { colors, spacing } from "../theme";
import { Property } from "../types";

export function HomeScreen() {
  const [location, setLocation] = useState("");
  const [purpose, setPurpose] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [properties, setProperties] = useState<Property[]>(demoProperties);
  const [loading, setLoading] = useState(false);

  const locationParts = useMemo(() => location.trim().split(",").map((item) => item.trim()), [location]);

  async function loadProperties() {
    setLoading(true);
    try {
      const results = await getProperties({
        city: locationParts[0],
        suburb: locationParts[1],
        purpose,
        max_price: maxPrice
      });
      setProperties(results.length ? results : demoProperties);
    } catch {
      setProperties(demoProperties);
    } finally {
      setLoading(false);
    }
  }

  async function bookViewing(property: Property) {
    try {
      const payment = await initiatePayment({
        payment_type: "viewing_fee",
        amount_usd: 2,
        channel: "paynow_ecocash",
        payer_reference: "+263770000000",
        property_id: property.id
      });
      Alert.alert("Viewing payment started", `Reference: ${payment.provider_reference}`);
    } catch {
      Alert.alert("Viewing request", "Payment will be connected once the backend is running.");
    }
  }

  useEffect(() => {
    loadProperties();
  }, []);

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Find, Rent, Buy, Manage</Text>
        <Text style={styles.title}>ZimHomes</Text>
        <Text style={styles.copy}>Search verified rentals and properties for sale across Zimbabwe.</Text>
      </View>

      <View style={styles.panel}>
        <Field label="City or city, suburb" value={location} onChangeText={setLocation} placeholder="Harare, Borrowdale" />
        <Field label="Purpose" value={purpose} onChangeText={setPurpose} placeholder="rent or buy" autoCapitalize="none" />
        <Field
          label="Max price USD"
          value={maxPrice}
          onChangeText={setMaxPrice}
          placeholder="800"
          keyboardType="number-pad"
        />
        <PrimaryButton label={loading ? "Searching..." : "Search"} onPress={loadProperties} disabled={loading} />
      </View>

      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} onBookViewing={bookViewing} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.sm,
    borderRadius: 8,
    padding: spacing.lg,
    backgroundColor: colors.green
  },
  eyebrow: {
    color: colors.gold,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  title: {
    color: colors.surface,
    fontSize: 42,
    fontWeight: "900"
  },
  copy: {
    color: "#eaf4ed",
    fontSize: 16,
    lineHeight: 23
  },
  panel: {
    gap: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: spacing.md
  }
});
