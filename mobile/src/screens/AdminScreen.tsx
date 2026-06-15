import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { approveProperty, getPayments, getPendingProperties, getUsers, getViewingRequests, refreshPayment, updateViewingStatus } from "../api/client";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { colors, spacing } from "../theme";
import { Payment, Property, User, ViewingRequest } from "../types";

export function AdminScreen() {
  const [pending, setPending] = useState<Property[]>([]);
  const [viewings, setViewings] = useState<ViewingRequest[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadAdminData() {
    setLoading(true);
    try {
      const [pendingProperties, viewingRequests, paymentRecords, registeredUsers] = await Promise.all([
        getPendingProperties(),
        getViewingRequests(),
        getPayments(),
        getUsers()
      ]);
      setPending(pendingProperties);
      setViewings(viewingRequests);
      setPayments(paymentRecords);
      setUsers(registeredUsers);
    } catch {
      setPending([]);
      setViewings([]);
      setPayments([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  async function approve(property: Property) {
    try {
      await approveProperty(property.id);
      Alert.alert("Approved", `${property.title} is now live.`);
      loadAdminData();
    } catch {
      Alert.alert("Backend needed", "Run the FastAPI backend to approve listings.");
    }
  }

  async function changeViewingStatus(viewing: ViewingRequest, status: "confirmed" | "completed" | "cancelled") {
    try {
      await updateViewingStatus(viewing.id, status);
      loadAdminData();
    } catch (error) {
      Alert.alert("Could not update viewing", error instanceof Error ? error.message : "Please try again.");
    }
  }

  async function refreshPaymentStatus(payment: Payment) {
    try {
      await refreshPayment(payment.id);
      loadAdminData();
    } catch (error) {
      Alert.alert("Could not refresh payment", error instanceof Error ? error.message : "Please try again.");
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.copy}>Approve listings and manage viewing requests.</Text>
        <PrimaryButton label={loading ? "Refreshing..." : "Refresh"} onPress={loadAdminData} disabled={loading} />
      </View>
      <Text style={styles.sectionTitle}>Pending listings</Text>
      {pending.length ? (
        pending.map((property) => (
          <View key={property.id} style={styles.card}>
            <Text style={styles.cardTitle}>{property.title}</Text>
            <Text style={styles.copy}>
              {property.suburb}, {property.city} - {property.management_option}
            </Text>
            <PrimaryButton label="Approve" onPress={() => approve(property)} />
          </View>
        ))
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No pending listings</Text>
          <Text style={styles.copy}>New owner submissions will appear here once the backend is running.</Text>
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Registered users</Text>
            <Text style={styles.copy}>{users.length} user{users.length === 1 ? "" : "s"} registered</Text>
          </View>
          <Text style={styles.status}>{users.length}</Text>
        </View>
        <PrimaryButton label={showUsers ? "Hide users" : "View registered users"} onPress={() => setShowUsers((current) => !current)} />
      </View>

      {showUsers ? (
        users.length ? (
          users.map((user) => (
            <View key={user.id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.cardTitle}>{user.full_name}</Text>
                <Text style={styles.status}>{user.role}</Text>
              </View>
              <Text style={styles.copy}>{user.email}</Text>
              {user.phone ? <Text style={styles.copy}>{user.phone}</Text> : null}
              <Text style={styles.reference}>User ID: {user.id.slice(0, 8)}</Text>
            </View>
          ))
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>No registered users</Text>
            <Text style={styles.copy}>Users will appear here after registration or login data is available.</Text>
          </View>
        )
      ) : null}

      <Text style={styles.sectionTitle}>Viewing requests</Text>
      {viewings.length ? (
        viewings.map((viewing) => (
          <View key={viewing.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>{viewing.property_title ?? "Property viewing"}</Text>
              <Text style={styles.status}>{viewing.status}</Text>
            </View>
            <Text style={styles.copy}>{viewing.property_location ?? viewing.property_id}</Text>
            {viewing.message ? <Text style={styles.copy}>{viewing.message}</Text> : null}
            <Text style={styles.reference}>Reference: {viewing.id.slice(0, 8)}</Text>
            <View style={styles.actionGrid}>
              <PrimaryButton label="Confirm" onPress={() => changeViewingStatus(viewing, "confirmed")} variant="secondary" />
              <PrimaryButton label="Complete" onPress={() => changeViewingStatus(viewing, "completed")} variant="secondary" />
              <PrimaryButton label="Cancel" onPress={() => changeViewingStatus(viewing, "cancelled")} variant="secondary" />
            </View>
          </View>
        ))
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No viewing requests</Text>
          <Text style={styles.copy}>Bookings from tenants and buyers will appear here.</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Payments</Text>
      {payments.length ? (
        payments.map((payment) => (
          <View key={payment.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>{payment.payment_type}</Text>
              <Text style={styles.status}>{payment.status}</Text>
            </View>
            <Text style={styles.copy}>Amount: ${payment.amount_usd}</Text>
            <Text style={styles.copy}>Reference: {payment.provider_reference}</Text>
            {payment.provider_status_message ? <Text style={styles.copy}>{payment.provider_status_message}</Text> : null}
            <PrimaryButton label="Refresh status" onPress={() => refreshPaymentStatus(payment)} variant="secondary" />
          </View>
        ))
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No payments yet</Text>
          <Text style={styles.copy}>Listing fees, viewing fees, deposits, rent, and management payments will appear here.</Text>
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
    fontSize: 22,
    fontWeight: "900"
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
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
  cardTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  cardText: {
    flex: 1,
    gap: spacing.xs
  },
  copy: {
    color: colors.muted,
    lineHeight: 21
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm
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
  reference: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  actionGrid: {
    gap: spacing.sm
  }
});
