import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { updateMe } from "../api/client";
import { Field } from "../components/Field";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { amenities as amenityOptions } from "../data/amenities";
import { colors, spacing } from "../theme";
import { User } from "../types";

type Props = {
  user: User;
  onUserUpdated: (user: User) => void;
};

export function ProfileScreen({ user, onUserUpdated }: Props) {
  const [phone, setPhone] = useState(user.phone ?? "");
  const [phoneVerified, setPhoneVerified] = useState(user.phone_verified);
  const [idSubmitted, setIdSubmitted] = useState(user.id_submitted);
  const [ownershipProofSubmitted, setOwnershipProofSubmitted] = useState(user.ownership_proof_submitted);
  const [employmentStatus, setEmploymentStatus] = useState(user.employment_status ?? "");
  const [salaryRange, setSalaryRange] = useState(user.salary_range ?? "");
  const [tenantReferences, setTenantReferences] = useState(user.tenant_references ?? "");
  const [householdSize, setHouseholdSize] = useState(user.household_size ? String(user.household_size) : "");
  const [preferredLocations, setPreferredLocations] = useState(user.preferred_locations ?? "");
  const [preferredPropertyType, setPreferredPropertyType] = useState(user.preferred_property_type ?? "");
  const [preferredAmenities, setPreferredAmenities] = useState<string[]>(user.preferred_amenities ?? []);
  const [budgetUsd, setBudgetUsd] = useState(user.budget_usd ? String(user.budget_usd) : "");
  const [saving, setSaving] = useState(false);
  const isLandlord = user.role === "owner" || user.role === "agent";

  async function saveProfile() {
    setSaving(true);
    try {
      const updated = await updateMe({
        phone: phone.trim() || null,
        phone_verified: phoneVerified,
        id_submitted: idSubmitted,
        ownership_proof_submitted: ownershipProofSubmitted,
        employment_status: employmentStatus.trim() || null,
        salary_range: salaryRange.trim() || null,
        tenant_references: tenantReferences.trim() || null,
        household_size: householdSize ? Number(householdSize) : null,
        preferred_locations: preferredLocations.trim() || null,
        preferred_property_type: preferredPropertyType.trim() || null,
        preferred_amenities: preferredAmenities,
        budget_usd: budgetUsd ? Number(budgetUsd) : null
      });
      onUserUpdated(updated);
      Alert.alert("Profile saved", "Your trust profile has been updated.");
    } catch (error) {
      Alert.alert("Could not save profile", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{user.role} profile</Text>
        <Text style={styles.title}>{user.full_name}</Text>
        <Text style={styles.headerCopy}>{user.email}</Text>
        <View style={styles.badgeRow}>
          {user.verification_badges.length ? (
            user.verification_badges.map((badge) => (
              <Text key={badge} style={styles.badge}>{badge}</Text>
            ))
          ) : (
            <Text style={styles.badgeMuted}>Unverified</Text>
          )}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Verification</Text>
        <Field label="Phone number" value={phone} onChangeText={setPhone} placeholder="+263..." keyboardType="phone-pad" />
        <ToggleRow label="Phone verified" value={phoneVerified} onToggle={() => setPhoneVerified((current) => !current)} />
        <ToggleRow label="ID submitted" value={idSubmitted} onToggle={() => setIdSubmitted((current) => !current)} />
        {isLandlord ? (
          <ToggleRow
            label="Ownership proof submitted"
            value={ownershipProofSubmitted}
            onToggle={() => setOwnershipProofSubmitted((current) => !current)}
          />
        ) : null}
      </View>

      {isLandlord ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Landlord profile</Text>
          <Text style={styles.copy}>Ownership proof, ID checks, and verified contact details help tenants trust your listings.</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tenant profile</Text>
          <Field label="Employment status" value={employmentStatus} onChangeText={setEmploymentStatus} placeholder="Employed, self-employed, student..." />
          <Field label="Salary range" value={salaryRange} onChangeText={setSalaryRange} placeholder="$500-$800, $800-$1200..." />
          <Field label="Household size" value={householdSize} onChangeText={setHouseholdSize} keyboardType="number-pad" />
          <Field label="Preferred locations" value={preferredLocations} onChangeText={setPreferredLocations} placeholder="Avondale, Borrowdale..." />
          <Field label="Property type" value={preferredPropertyType} onChangeText={setPreferredPropertyType} placeholder="flat, house, room" />
          <Field label="Budget USD" value={budgetUsd} onChangeText={setBudgetUsd} keyboardType="number-pad" />
          <View style={styles.amenitySection}>
            <Text style={styles.smallTitle}>Preferred amenities</Text>
            <View style={styles.amenityGrid}>
              {amenityOptions.map((amenity) => {
                const selected = preferredAmenities.includes(amenity);
                return (
                  <Pressable
                    key={amenity}
                    accessibilityRole="button"
                    onPress={() =>
                      setPreferredAmenities((current) =>
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
          <Field label="References" value={tenantReferences} onChangeText={setTenantReferences} placeholder="Previous landlord, employer, or guarantor..." multiline />
        </View>
      )}

      <PrimaryButton label={saving ? "Saving..." : "Save profile"} onPress={saveProfile} disabled={saving} />
    </Screen>
  );
}

function ToggleRow({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onToggle} style={styles.toggleRow}>
      <View style={[styles.toggleBox, value ? styles.toggleBoxActive : null]}>
        {value ? <Ionicons name="checkmark" size={17} color={colors.surface} /> : null}
      </View>
      <Text style={styles.toggleLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.green,
    padding: spacing.lg
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
    color: colors.muted,
    lineHeight: 21
  },
  headerCopy: {
    color: "#eaf4ed",
    lineHeight: 21
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  badge: {
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: "#eaf4ed",
    color: colors.green,
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: "900"
  },
  badgeMuted: {
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.16)",
    color: colors.surface,
    paddingHorizontal: 9,
    paddingVertical: 5,
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
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  toggleRow: {
    minHeight: 44,
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  toggleBox: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface
  },
  toggleBoxActive: {
    borderColor: colors.green,
    backgroundColor: colors.green
  },
  toggleLabel: {
    color: colors.ink,
    fontWeight: "800"
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
  }
});
