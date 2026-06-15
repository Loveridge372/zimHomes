import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { getMediaUrl } from "../api/client";
import { colors, spacing } from "../theme";
import { Property } from "../types";
import { PrimaryButton } from "./PrimaryButton";

type Props = {
  property: Property;
  isFavorite?: boolean;
  onBack: () => void;
  onBookViewing: (property: Property) => void;
  onToggleFavorite?: (property: Property) => void;
};

function money(value: number, purpose: string) {
  return purpose === "rent" ? `$${value.toLocaleString()}/mo` : `$${value.toLocaleString()}`;
}

function managementLabel(value: string) {
  return value === "zimhomes_managed" ? "Wana Imba managed" : "Self managed";
}

export function PropertyDetails({ property, isFavorite, onBack, onBookViewing, onToggleFavorite }: Props) {
  const { width } = useWindowDimensions();
  const imageWidth = Math.max(300, width - 32);
  const imageUrls = property.image_urls?.map(getMediaUrl).filter(Boolean) ?? [];

  return (
    <>
      <PrimaryButton label="Back to search" onPress={onBack} variant="secondary" />

      <View style={styles.details}>
        {imageUrls.length ? (
          <View>
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.gallery}>
              {imageUrls.map((imageUrl, index) => (
                <Image key={`${imageUrl}-${index}`} source={{ uri: imageUrl }} style={[styles.heroImage, { width: imageWidth }]} />
              ))}
            </ScrollView>
            <View style={styles.photoBadge}>
              <Text style={styles.photoBadgeText}>{imageUrls.length} photo{imageUrls.length === 1 ? "" : "s"}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.imageStub}>
            <Text style={styles.imageText}>{property.suburb}</Text>
          </View>
        )}

        <View style={styles.body}>
          <View style={styles.chips}>
            <Text style={styles.chip}>{property.purpose === "rent" ? "For rent" : "For sale"}</Text>
            <Text style={styles.chip}>{property.property_type}</Text>
            <Text style={styles.chip}>{managementLabel(property.management_option)}</Text>
            {property.is_verified ? <Text style={styles.chip}>Verified</Text> : null}
          </View>

          <View style={styles.headerRow}>
            <Text style={styles.title}>{property.title}</Text>
            {onToggleFavorite ? (
              <Pressable
                accessibilityLabel={isFavorite ? "Remove from saved properties" : "Save property"}
                accessibilityRole="button"
                onPress={() => onToggleFavorite(property)}
                style={({ pressed }) => [styles.favoriteButton, isFavorite ? styles.favoriteActive : null, pressed ? styles.pressed : null]}
              >
                <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={22} color={isFavorite ? colors.surface : colors.green} />
              </Pressable>
            ) : null}
          </View>
          <Text style={styles.location}>
            {property.suburb}, {property.city}
          </Text>
          <Text style={styles.price}>{money(property.price_usd, property.purpose)}</Text>

          <View style={styles.featureGrid}>
            <View style={styles.feature}>
              <Text style={styles.featureValue}>{property.bedrooms}</Text>
              <Text style={styles.featureLabel}>Bedrooms</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureValue}>{property.bathrooms}</Text>
              <Text style={styles.featureLabel}>Bathrooms</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureValue}>{property.status}</Text>
              <Text style={styles.featureLabel}>Status</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{property.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documents</Text>
            <Text style={styles.description}>
              Lease and property-management agreements can be generated after the viewing or owner approval flow.
            </Text>
          </View>

          <PrimaryButton label="Book viewing" onPress={() => onBookViewing(property)} />
          <PrimaryButton
            label="Generate lease draft"
            onPress={() => Alert.alert("Lease draft", "Lease generation will use the saved lease template after tenant details are captured.")}
            variant="secondary"
          />
          <PrimaryButton
            label="Management agreement"
            onPress={() => Alert.alert("Management agreement", "Management agreement generation will use owner and Wana Imba details after onboarding.")}
            variant="secondary"
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  details: {
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface
  },
  gallery: {
    backgroundColor: colors.line
  },
  heroImage: {
    height: 280,
    backgroundColor: colors.line
  },
  photoBadge: {
    position: "absolute",
    right: spacing.sm,
    bottom: spacing.sm,
    borderRadius: 8,
    backgroundColor: "rgba(23, 34, 29, 0.82)",
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  photoBadgeText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "900"
  },
  imageStub: {
    height: 240,
    justifyContent: "flex-end",
    padding: spacing.md,
    backgroundColor: colors.green
  },
  imageText: {
    color: colors.surface,
    fontSize: 30,
    fontWeight: "900"
  },
  body: {
    gap: spacing.md,
    padding: spacing.md
  },
  headerRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  favoriteButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface
  },
  favoriteActive: {
    borderColor: colors.green,
    backgroundColor: colors.green
  },
  pressed: {
    opacity: 0.8
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
    fontSize: 28,
    fontWeight: "900"
  },
  location: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: "800"
  },
  price: {
    color: colors.green,
    fontSize: 30,
    fontWeight: "900"
  },
  featureGrid: {
    flexDirection: "row",
    gap: spacing.sm
  },
  feature: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.soft,
    padding: spacing.sm
  },
  featureValue: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  featureLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  section: {
    gap: spacing.xs
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  description: {
    color: colors.muted,
    lineHeight: 22
  }
});
