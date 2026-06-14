import { StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../theme";
import { Property } from "../types";
import { PrimaryButton } from "./PrimaryButton";

type Props = {
  property: Property;
  onBookViewing?: (property: Property) => void;
};

function money(value: number, purpose: string) {
  return purpose === "rent" ? `$${value.toLocaleString()}/mo` : `$${value.toLocaleString()}`;
}

export function PropertyCard({ property, onBookViewing }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.imageStub}>
        <Text style={styles.imageText}>{property.suburb}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.chips}>
          <Text style={styles.chip}>{property.purpose === "rent" ? "For rent" : "For sale"}</Text>
          <Text style={styles.chip}>{property.property_type}</Text>
          {property.is_verified ? <Text style={styles.chip}>Verified</Text> : null}
        </View>
        <Text style={styles.title}>{property.title}</Text>
        <Text style={styles.meta}>
          {property.suburb}, {property.city} - {property.bedrooms} bed - {property.bathrooms} bath
        </Text>
        <Text style={styles.price}>{money(property.price_usd, property.purpose)}</Text>
        <Text style={styles.description}>{property.description}</Text>
        <PrimaryButton label="Book viewing" onPress={() => onBookViewing?.(property)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface
  },
  imageStub: {
    height: 150,
    justifyContent: "flex-end",
    padding: spacing.md,
    backgroundColor: colors.green
  },
  imageText: {
    color: colors.surface,
    fontSize: 24,
    fontWeight: "900"
  },
  body: {
    gap: spacing.sm,
    padding: spacing.md
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  chip: {
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: "#eaf4ed",
    color: colors.green,
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: "800"
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  meta: {
    color: colors.muted,
    fontWeight: "700"
  },
  price: {
    color: colors.green,
    fontSize: 22,
    fontWeight: "900"
  },
  description: {
    color: colors.muted,
    lineHeight: 21
  }
});
