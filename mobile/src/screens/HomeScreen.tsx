import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { createViewingRequest, getCurrentApiBaseUrl, getProperties, initiatePayment } from "../api/client";
import { Field } from "../components/Field";
import { PrimaryButton } from "../components/PrimaryButton";
import { PropertyCard } from "../components/PropertyCard";
import { PropertyDetails } from "../components/PropertyDetails";
import { Screen } from "../components/Screen";
import { amenities as amenityOptions } from "../data/amenities";
import { demoProperties } from "../data/demoProperties";
import { useFavorites } from "../state/FavoritesContext";
import { colors, spacing } from "../theme";
import { Property } from "../types";

export function HomeScreen() {
  const [location, setLocation] = useState("");
  const [purpose, setPurpose] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [properties, setProperties] = useState<Property[]>(demoProperties);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [bookingProperty, setBookingProperty] = useState<Property | null>(null);
  const [viewingDate, setViewingDate] = useState("");
  const [viewingTime, setViewingTime] = useState("");
  const [viewerPhone, setViewerPhone] = useState("");
  const [viewingMessage, setViewingMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  async function loadProperties() {
    setLoading(true);
    try {
      const results = await getProperties({
        location: location.trim(),
        purpose: purpose.trim().toLowerCase(),
        max_price: maxPrice,
        amenities: selectedAmenities.join(",")
      });
      setProperties(results);
      setSearched(true);
    } catch {
      setProperties(filterDemoProperties());
    } finally {
      setLoading(false);
    }
  }

  function filterDemoProperties() {
    const locationQuery = location.trim().toLowerCase();
    const purposeQuery = purpose.trim().toLowerCase();
    const max = Number(maxPrice);
    const requiredAmenities = selectedAmenities.map((amenity) => amenity.toLowerCase());

    return demoProperties.filter((property) => {
      const matchesLocation =
        !locationQuery ||
        property.city.toLowerCase().includes(locationQuery) ||
        property.suburb.toLowerCase().includes(locationQuery) ||
        property.title.toLowerCase().includes(locationQuery);
      const matchesPurpose = !purposeQuery || property.purpose === purposeQuery;
      const matchesPrice = !max || property.price_usd <= max;
      const propertyAmenities = property.amenities.map((amenity) => amenity.toLowerCase());
      const matchesAmenities = requiredAmenities.every((amenity) => propertyAmenities.includes(amenity));

      return matchesLocation && matchesPurpose && matchesPrice && matchesAmenities;
    });
  }

  function openBookingForm(property: Property) {
    setBookingProperty(property);
    setViewingMessage(`I would like to view ${property.title}.`);
  }

  function closeBookingForm() {
    setBookingProperty(null);
    setViewingDate("");
    setViewingTime("");
    setViewerPhone("");
    setViewingMessage("");
  }

  async function submitViewingBooking() {
    if (!bookingProperty) {
      return;
    }
    if (!viewingDate.trim() || !viewingTime.trim() || !viewerPhone.trim()) {
      Alert.alert("Booking details needed", "Add a viewing date, time, and phone number.");
      return;
    }

    setBookingLoading(true);
    try {
      const viewing = await createViewingRequest({
        property_id: bookingProperty.id,
        preferred_time: `${viewingDate.trim()} at ${viewingTime.trim()}`,
        message: viewingMessage.trim() || `Viewing requested for ${bookingProperty.title}`
      });
      const payment = await initiatePayment({
        payment_type: "viewing_fee",
        amount_usd: 2,
        channel: "paynow_ecocash",
        payer_reference: viewerPhone.trim(),
        property_id: bookingProperty.id
      });
      Alert.alert("Viewing requested", `Viewing: ${viewing.id.slice(0, 8)}\nPayment: ${payment.provider_reference}`);
      closeBookingForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again.";
      Alert.alert("Viewing request failed", `${message}\n\nBackend URL: ${getCurrentApiBaseUrl()}`);
    } finally {
      setBookingLoading(false);
    }
  }

  useEffect(() => {
    loadProperties();
  }, []);

  if (selectedProperty) {
    return (
      <Screen>
        <PropertyDetails
          property={selectedProperty}
          isFavorite={isFavorite(selectedProperty.id)}
          onBack={() => setSelectedProperty(null)}
          onBookViewing={openBookingForm}
          onToggleFavorite={toggleFavorite}
        />
        {bookingProperty ? (
          <ViewingForm
            property={bookingProperty}
            viewingDate={viewingDate}
            viewingTime={viewingTime}
            viewerPhone={viewerPhone}
            viewingMessage={viewingMessage}
            bookingLoading={bookingLoading}
            setViewingDate={setViewingDate}
            setViewingTime={setViewingTime}
            setViewerPhone={setViewerPhone}
            setViewingMessage={setViewingMessage}
            onSubmit={submitViewingBooking}
            onCancel={closeBookingForm}
          />
        ) : null}
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Find, Rent, Buy, Manage</Text>
        <Text style={styles.title}>Wana Imba</Text>
        <Text style={styles.copy}>Search verified rentals and properties for sale across Zimbabwe.</Text>
      </View>

      <View style={styles.panel}>
        <Field label="City, suburb, or title" value={location} onChangeText={setLocation} placeholder="Avondale, Harare, Borrowdale..." />
        <Field label="Purpose" value={purpose} onChangeText={setPurpose} placeholder="rent or buy" autoCapitalize="none" />
        <Field
          label="Max price USD"
          value={maxPrice}
          onChangeText={setMaxPrice}
          placeholder="800"
          keyboardType="number-pad"
        />
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Amenities needed</Text>
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
        <PrimaryButton label={loading ? "Searching..." : "Search"} onPress={loadProperties} disabled={loading} />
      </View>

      {bookingProperty ? (
        <ViewingForm
          property={bookingProperty}
          viewingDate={viewingDate}
          viewingTime={viewingTime}
          viewerPhone={viewerPhone}
          viewingMessage={viewingMessage}
          bookingLoading={bookingLoading}
          setViewingDate={setViewingDate}
          setViewingTime={setViewingTime}
          setViewerPhone={setViewerPhone}
          setViewingMessage={setViewingMessage}
          onSubmit={submitViewingBooking}
          onCancel={closeBookingForm}
        />
      ) : null}

      {properties.length ? (
        properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            isFavorite={isFavorite(property.id)}
            onBookViewing={openBookingForm}
            onToggleFavorite={toggleFavorite}
            onViewDetails={(selected) => setSelectedProperty(selected)}
          />
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No approved properties found</Text>
          <Text style={styles.emptyCopy}>
            {searched ? "Try a nearby suburb, clear the purpose filter, or confirm the property was approved in Admin." : "Search to see approved listings."}
          </Text>
        </View>
      )}
    </Screen>
  );
}

type ViewingFormProps = {
  property: Property;
  viewingDate: string;
  viewingTime: string;
  viewerPhone: string;
  viewingMessage: string;
  bookingLoading: boolean;
  setViewingDate: (value: string) => void;
  setViewingTime: (value: string) => void;
  setViewerPhone: (value: string) => void;
  setViewingMessage: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

function ViewingForm({
  property,
  viewingDate,
  viewingTime,
  viewerPhone,
  viewingMessage,
  bookingLoading,
  setViewingDate,
  setViewingTime,
  setViewerPhone,
  setViewingMessage,
  onSubmit,
  onCancel
}: ViewingFormProps) {
  return (
    <View style={styles.bookingPanel}>
      <Text style={styles.bookingTitle}>Book viewing</Text>
      <Text style={styles.bookingCopy}>{property.title}</Text>
      <Field label="Preferred date" value={viewingDate} onChangeText={setViewingDate} placeholder="2026-06-20" />
      <Field label="Preferred time" value={viewingTime} onChangeText={setViewingTime} placeholder="14:30" />
      <Field label="Phone number" value={viewerPhone} onChangeText={setViewerPhone} placeholder="+263..." keyboardType="phone-pad" />
      <Field label="Message" value={viewingMessage} onChangeText={setViewingMessage} placeholder="Any notes for the owner..." multiline />
      <Text style={styles.privacyNote}>Your phone, salary range, and references stay hidden until the landlord confirms interest.</Text>
      <View style={styles.bookingActions}>
        <PrimaryButton label={bookingLoading ? "Submitting..." : "Submit viewing request"} onPress={onSubmit} disabled={bookingLoading} />
        <PrimaryButton label="Cancel" onPress={onCancel} variant="secondary" />
      </View>
    </View>
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
  },
  filterSection: {
    gap: spacing.sm
  },
  filterTitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
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
  },
  bookingPanel: {
    gap: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.green,
    backgroundColor: colors.surface,
    padding: spacing.md
  },
  bookingTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900"
  },
  bookingCopy: {
    color: colors.muted,
    lineHeight: 21
  },
  bookingActions: {
    gap: spacing.sm
  },
  privacyNote: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18
  },
  emptyState: {
    gap: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: spacing.md
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  emptyCopy: {
    color: colors.muted,
    lineHeight: 21
  }
});
