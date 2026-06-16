import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { getMyProperties, getOwnedViewingRequests, updateMyProperty, updateMyPropertyStatus, updateViewingStatus } from "../api/client";
import { Field } from "../components/Field";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { amenities as amenityOptions } from "../data/amenities";
import { colors, spacing } from "../theme";
import { OwnerProperty, PropertyInput, ViewingRequest } from "../types";

export function ManagementScreen() {
  const [properties, setProperties] = useState<OwnerProperty[]>([]);
  const [applications, setApplications] = useState<ViewingRequest[]>([]);
  const [editingProperty, setEditingProperty] = useState<OwnerProperty | null>(null);
  const [editDraft, setEditDraft] = useState<PropertyInput | null>(null);
  const [loading, setLoading] = useState(false);

  const groupedApplications = useMemo(() => {
    return applications.reduce<Record<string, ViewingRequest[]>>((groups, application) => {
      const key = application.property_title ?? application.property_id;
      return { ...groups, [key]: [...(groups[key] ?? []), application] };
    }, {});
  }, [applications]);

  async function loadManagementData() {
    setLoading(true);
    try {
      const [ownerProperties, ownerApplications] = await Promise.all([getMyProperties(), getOwnedViewingRequests()]);
      setProperties(ownerProperties);
      setApplications(ownerApplications);
    } catch (error) {
      Alert.alert("Could not load management data", error instanceof Error ? error.message : "Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(application: ViewingRequest, status: "confirmed" | "completed" | "cancelled") {
    try {
      await updateViewingStatus(application.id, status);
      await loadManagementData();
    } catch (error) {
      Alert.alert("Could not update application", error instanceof Error ? error.message : "Please try again.");
    }
  }

  async function changePropertyStatus(property: OwnerProperty, status: "approved" | "unavailable") {
    try {
      await updateMyPropertyStatus(property.id, status);
      await loadManagementData();
    } catch (error) {
      Alert.alert("Could not update property", error instanceof Error ? error.message : "Please try again.");
    }
  }

  function startEditing(property: OwnerProperty) {
    setEditingProperty(property);
    setEditDraft({
      title: property.title,
      city: property.city,
      suburb: property.suburb,
      purpose: property.purpose,
      property_type: property.property_type,
      price_usd: property.price_usd,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      description: property.description,
      amenities: property.amenities,
      management_option: property.management_option
    });
  }

  async function saveEdit() {
    if (!editingProperty || !editDraft) {
      return;
    }

    try {
      await updateMyProperty(editingProperty.id, editDraft);
      setEditingProperty(null);
      setEditDraft(null);
      await loadManagementData();
      Alert.alert("Listing updated", "Your property changes have been saved.");
    } catch (error) {
      Alert.alert("Could not save listing", error instanceof Error ? error.message : "Please try again.");
    }
  }

  function updateDraft(patch: Partial<PropertyInput>) {
    setEditDraft((current) => (current ? { ...current, ...patch } : current));
  }

  useEffect(() => {
    loadManagementData();
  }, []);

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Landlord dashboard</Text>
        <Text style={styles.title}>Manage listings and tenant applications.</Text>
        <Text style={styles.copy}>Track approval status, application counts, and availability from one place.</Text>
        <PrimaryButton label={loading ? "Refreshing..." : "Refresh dashboard"} onPress={loadManagementData} disabled={loading} />
      </View>

      <Text style={styles.sectionTitle}>My Properties</Text>
      {properties.length ? (
        properties.map((property) => (
          <View key={property.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>{property.title}</Text>
              <Text style={styles.status}>{property.status}</Text>
            </View>
            <Text style={styles.cardCopy}>
              {property.suburb}, {property.city} - {property.bedrooms} bed - {property.bathrooms} bath
            </Text>
            <Text style={styles.price}>{property.purpose === "rent" ? `$${property.price_usd.toLocaleString()}/mo` : `$${property.price_usd.toLocaleString()}`}</Text>
            <View style={styles.metricRow}>
              <Text style={styles.metric}>{property.application_count} application{property.application_count === 1 ? "" : "s"}</Text>
              <Text style={styles.metric}>{property.pending_application_count} pending</Text>
            </View>
            <View style={styles.actionGrid}>
              <PrimaryButton label="Edit listing" onPress={() => startEditing(property)} variant="secondary" />
              {property.status === "unavailable" ? (
                <PrimaryButton label="Mark available" onPress={() => changePropertyStatus(property, "approved")} variant="secondary" />
              ) : (
                <PrimaryButton label="Mark unavailable" onPress={() => changePropertyStatus(property, "unavailable")} variant="secondary" />
              )}
            </View>
          </View>
        ))
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No properties yet</Text>
          <Text style={styles.cardCopy}>List a property first, then it will appear here with approval status and applications.</Text>
        </View>
      )}

      {editingProperty && editDraft ? (
        <View style={styles.editPanel}>
          <Text style={styles.sectionTitle}>Edit Listing</Text>
          <Text style={styles.cardCopy}>{editingProperty.title}</Text>
          <Field label="Title" value={editDraft.title} onChangeText={(value) => updateDraft({ title: value })} />
          <Field label="City" value={editDraft.city} onChangeText={(value) => updateDraft({ city: value })} />
          <Field label="Suburb" value={editDraft.suburb} onChangeText={(value) => updateDraft({ suburb: value })} />
          <Field
            label="Purpose"
            value={editDraft.purpose}
            onChangeText={(value) => updateDraft({ purpose: value === "buy" ? "buy" : "rent" })}
            autoCapitalize="none"
          />
          <Field label="Property type" value={editDraft.property_type} onChangeText={(value) => updateDraft({ property_type: value })} />
          <Field label="Price USD" value={String(editDraft.price_usd)} onChangeText={(value) => updateDraft({ price_usd: Number(value) })} keyboardType="number-pad" />
          <Field label="Bedrooms" value={String(editDraft.bedrooms)} onChangeText={(value) => updateDraft({ bedrooms: Number(value) })} keyboardType="number-pad" />
          <Field label="Bathrooms" value={String(editDraft.bathrooms)} onChangeText={(value) => updateDraft({ bathrooms: Number(value) })} keyboardType="number-pad" />
          <Field
            label="Management"
            value={editDraft.management_option}
            onChangeText={(value) => updateDraft({ management_option: value === "zimhomes_managed" ? "zimhomes_managed" : "self_managed" })}
            autoCapitalize="none"
          />
          <Field label="Description" value={editDraft.description} onChangeText={(value) => updateDraft({ description: value })} multiline />
          <View style={styles.amenitySection}>
            <Text style={styles.smallTitle}>Amenities</Text>
            <View style={styles.amenityGrid}>
              {amenityOptions.map((amenity) => {
                const selected = editDraft.amenities.includes(amenity);
                return (
                  <Pressable
                    key={amenity}
                    accessibilityRole="button"
                    onPress={() =>
                      updateDraft({
                        amenities: selected ? editDraft.amenities.filter((item) => item !== amenity) : [...editDraft.amenities, amenity]
                      })
                    }
                    style={({ pressed }) => [styles.amenityChip, selected ? styles.amenityChipSelected : null, pressed ? styles.pressed : null]}
                  >
                    <Text style={[styles.amenityText, selected ? styles.amenityTextSelected : null]}>{amenity}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={styles.actionGrid}>
            <PrimaryButton label="Save changes" onPress={saveEdit} />
            <PrimaryButton
              label="Cancel edit"
              onPress={() => {
                setEditingProperty(null);
                setEditDraft(null);
              }}
              variant="secondary"
            />
          </View>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Tenant Applications</Text>
      {Object.entries(groupedApplications).length ? (
        Object.entries(groupedApplications).map(([propertyTitle, propertyApplications]) => (
          <View key={propertyTitle} style={styles.propertyGroup}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupTitle}>{propertyTitle}</Text>
              <Text style={styles.countBadge}>{propertyApplications.length}</Text>
            </View>
            {propertyApplications.map((application) => (
              <View key={application.id} style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.cardTitle}>{application.requester_name ?? "Tenant applicant"}</Text>
                  <Text style={styles.status}>{application.status}</Text>
                </View>
                <View style={styles.badgeRow}>
                  {application.requester_badges.length ? (
                    application.requester_badges.map((badge) => (
                      <Text key={badge} style={styles.badge}>{badge}</Text>
                    ))
                  ) : (
                    <Text style={styles.badgeMuted}>Unverified</Text>
                  )}
                </View>
                {application.preferred_time ? <Text style={styles.cardCopy}>Preferred time: {application.preferred_time}</Text> : null}
                {application.household_size ? <Text style={styles.cardCopy}>Household size: {application.household_size}</Text> : null}
                {application.budget_usd ? <Text style={styles.cardCopy}>Budget: ${application.budget_usd.toLocaleString()}</Text> : null}
                {application.preferred_locations ? <Text style={styles.cardCopy}>Preferred areas: {application.preferred_locations}</Text> : null}
                {application.preferred_property_type ? <Text style={styles.cardCopy}>Property type: {application.preferred_property_type}</Text> : null}
                {application.message ? <Text style={styles.message}>{application.message}</Text> : null}

                {application.contact_unlocked ? (
                  <View style={styles.unlockedBox}>
                    <Text style={styles.unlockedTitle}>Contact unlocked</Text>
                    {application.requester_phone ? <Text style={styles.cardCopy}>Phone: {application.requester_phone}</Text> : null}
                    {application.requester_email ? <Text style={styles.cardCopy}>Email: {application.requester_email}</Text> : null}
                    {application.salary_range ? <Text style={styles.cardCopy}>Salary range: {application.salary_range}</Text> : null}
                    {application.tenant_references ? <Text style={styles.cardCopy}>References: {application.tenant_references}</Text> : null}
                  </View>
                ) : (
                  <Text style={styles.privacyNote}>Sensitive contact, salary, and references are hidden until you confirm interest.</Text>
                )}

                <View style={styles.actionGrid}>
                  <PrimaryButton label="Confirm and unlock contact" onPress={() => changeStatus(application, "confirmed")} variant="secondary" />
                  <PrimaryButton label="Mark completed" onPress={() => changeStatus(application, "completed")} variant="secondary" />
                  <PrimaryButton label="Reject application" onPress={() => changeStatus(application, "cancelled")} variant="secondary" />
                </View>
              </View>
            ))}
          </View>
        ))
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No tenant applications yet</Text>
          <Text style={styles.cardCopy}>Applications for properties you listed will appear here after tenants request a viewing.</Text>
        </View>
      )}
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
  propertyGroup: {
    gap: spacing.sm
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  groupHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  groupTitle: {
    flex: 1,
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  countBadge: {
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: colors.green,
    color: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
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
  cardCopy: {
    color: colors.muted,
    lineHeight: 21
  },
  price: {
    color: colors.green,
    fontSize: 18,
    fontWeight: "900"
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  metric: {
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: colors.soft,
    color: colors.ink,
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: "900"
  },
  editPanel: {
    gap: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.green,
    backgroundColor: colors.surface,
    padding: spacing.md
  },
  amenitySection: {
    gap: spacing.sm
  },
  smallTitle: {
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
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  badge: {
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    color: colors.green,
    backgroundColor: "#eaf4ed",
    fontSize: 12,
    fontWeight: "900"
  },
  badgeMuted: {
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    color: colors.muted,
    backgroundColor: colors.soft,
    fontSize: 12,
    fontWeight: "900"
  },
  message: {
    color: colors.ink,
    lineHeight: 21
  },
  privacyNote: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18
  },
  unlockedBox: {
    gap: spacing.xs,
    borderRadius: 8,
    backgroundColor: colors.soft,
    padding: spacing.sm
  },
  unlockedTitle: {
    color: colors.ink,
    fontWeight: "900"
  },
  actionGrid: {
    gap: spacing.sm
  }
});
