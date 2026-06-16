import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";

import { getCurrentApiBaseUrl, initiatePayment, submitProperty, uploadPropertyImages } from "../api/client";
import { Field } from "../components/Field";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { amenities as amenityOptions } from "../data/amenities";
import { colors, spacing } from "../theme";
import { PropertyInput } from "../types";

export function ListPropertyScreen() {
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [suburb, setSuburb] = useState("");
  const [purpose, setPurpose] = useState("rent");
  const [propertyType, setPropertyType] = useState("flat");
  const [price, setPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [management, setManagement] = useState<"self_managed" | "zimhomes_managed">("self_managed");
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function pickImages() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Photo access needed", "Allow photo access to upload property pictures.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ["images"],
      quality: 0.82,
      selectionLimit: 10
    });

    if (!result.canceled) {
      setImages(result.assets.slice(0, 10));
    }
  }

  async function submit() {
    const payload: PropertyInput = {
      title,
      city,
      suburb,
      purpose: purpose === "buy" ? "buy" : "rent",
      property_type: propertyType,
      price_usd: Number(price),
      bedrooms: Number(bedrooms),
      bathrooms: 1,
      description,
      amenities: selectedAmenities,
      management_option: management
    };

    setSubmitting(true);
    try {
      const property = await submitProperty(payload);
      if (images.length) {
        await uploadPropertyImages(property.id, images);
      }
      const payment = await initiatePayment({
        payment_type: "listing_fee",
        amount_usd: 5,
        channel: "paynow_ecocash",
        payer_reference: "+263770000000",
        property_id: property.id
      });
      Alert.alert("Submitted for approval", `Listing fee reference: ${payment.provider_reference}`);
      setTitle("");
      setCity("");
      setSuburb("");
      setPrice("");
      setBedrooms("");
      setDescription("");
      setSelectedAmenities([]);
      setImages([]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      Alert.alert(
        "Could not reach backend",
        `The app tried ${getCurrentApiBaseUrl()}.\n\nRestart backend with --host 0.0.0.0, then restart Expo.\n\n${message}`
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <View style={styles.info}>
        <Text style={styles.heading}>Owners can advertise or ask Wana Imba to manage the property.</Text>
        <Text style={styles.copy}>Basic listing fee is $5. Featured listing can be added later for $20.</Text>
      </View>
      <View style={styles.photoPanel}>
        <View style={styles.photoHeader}>
          <View>
            <Text style={styles.photoTitle}>Property photos</Text>
            <Text style={styles.photoCopy}>{images.length ? `${images.length} selected` : "Add up to 10 photos"}</Text>
          </View>
          <PrimaryButton label="Choose" onPress={pickImages} variant="secondary" />
        </View>
        {images.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.previewRow}>
            {images.map((image) => (
              <Image key={image.assetId ?? image.uri} source={{ uri: image.uri }} style={styles.previewImage} />
            ))}
          </ScrollView>
        ) : null}
      </View>
      <Field label="Property title" value={title} onChangeText={setTitle} placeholder="2-bedroom flat in Avondale" />
      <Field label="City" value={city} onChangeText={setCity} placeholder="Harare" />
      <Field label="Suburb" value={suburb} onChangeText={setSuburb} placeholder="Avondale" />
      <Field label="Purpose" value={purpose} onChangeText={setPurpose} placeholder="rent or buy" autoCapitalize="none" />
      <Field label="Property type" value={propertyType} onChangeText={setPropertyType} placeholder="flat, house, room" />
      <Field label="Price USD" value={price} onChangeText={setPrice} keyboardType="number-pad" />
      <Field label="Bedrooms" value={bedrooms} onChangeText={setBedrooms} keyboardType="number-pad" />
      <Field
        label="Management"
        value={management}
        onChangeText={(value) => setManagement(value === "zimhomes_managed" ? "zimhomes_managed" : "self_managed")}
        placeholder="self_managed or zimhomes_managed"
        autoCapitalize="none"
      />
      <Field
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Security, water, parking, lease terms..."
        multiline
      />
      <View style={styles.amenitiesPanel}>
        <Text style={styles.photoTitle}>Amenities</Text>
        <Text style={styles.photoCopy}>Select everything available at the property.</Text>
        <View style={styles.amenityGrid}>
          {amenityOptions.map((amenity) => {
            const selected = selectedAmenities.includes(amenity);
            return (
              <Pressable
                key={amenity}
                accessibilityRole="button"
                onPress={() =>
                  setSelectedAmenities((current) =>
                    selected ? current.filter((item) => item !== amenity) : [...current, amenity]
                  )
                }
                style={({ pressed }) => [styles.amenityChip, selected ? styles.amenityChipSelected : null, pressed ? styles.pressed : null]}
              >
                <Text style={[styles.amenityText, selected ? styles.amenityTextSelected : null]}>{amenity}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <PrimaryButton label={submitting ? "Submitting..." : "Submit for approval"} onPress={submit} disabled={submitting} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  info: {
    gap: spacing.sm,
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1
  },
  heading: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  copy: {
    color: colors.muted,
    lineHeight: 21
  },
  photoPanel: {
    gap: spacing.sm,
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1
  },
  photoHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  photoTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  photoCopy: {
    color: colors.muted,
    fontWeight: "700"
  },
  previewRow: {
    gap: spacing.sm,
    paddingRight: spacing.sm
  },
  previewImage: {
    width: 92,
    height: 92,
    borderRadius: 8,
    backgroundColor: colors.line
  },
  amenitiesPanel: {
    gap: spacing.sm,
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1
  },
  amenityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  amenityChip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  amenityChipSelected: {
    borderColor: colors.green,
    backgroundColor: colors.green
  },
  amenityText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "800"
  },
  amenityTextSelected: {
    color: colors.surface
  },
  pressed: {
    opacity: 0.8
  }
});
