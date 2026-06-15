import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { getCurrentApiBaseUrl, initiatePayment, submitProperty } from "../api/client";
import { Field } from "../components/Field";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
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
  const [management, setManagement] = useState<"self_managed" | "zimhomes_managed">("self_managed");
  const [submitting, setSubmitting] = useState(false);

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
      management_option: management
    };

    setSubmitting(true);
    try {
      const property = await submitProperty(payload);
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
        <Text style={styles.heading}>Owners can advertise or ask ZimHomes to manage the property.</Text>
        <Text style={styles.copy}>Basic listing fee is $5. Featured listing can be added later for $20.</Text>
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
  }
});
