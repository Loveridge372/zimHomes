import { useState } from "react";
import { Alert, Linking, StyleSheet, Text, View } from "react-native";

import { getCurrentApiBaseUrl, initiatePayment, refreshPayment } from "../api/client";
import { Field } from "../components/Field";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { colors, spacing } from "../theme";
import { Payment } from "../types";

export function PaymentsScreen() {
  const [paymentType, setPaymentType] = useState("listing_fee");
  const [amount, setAmount] = useState("5");
  const [channel, setChannel] = useState("paynow_ecocash");
  const [reference, setReference] = useState("+263770000000");
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);

  async function startPayment() {
    setLoading(true);
    try {
      const payment = await initiatePayment({
        payment_type: paymentType,
        amount_usd: Number(amount),
        channel,
        payer_reference: reference
      });
      setPayment(payment);
      Alert.alert("Payment started", `${payment.provider_reference} is ${payment.status}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Backend needed", `The app tried ${getCurrentApiBaseUrl()}.\n\nRestart backend with --host 0.0.0.0.\n\n${message}`);
    } finally {
      setLoading(false);
    }
  }

  async function openCheckout() {
    const checkoutUrl = payment?.paynow_browser_url || payment?.redirect_url;
    if (!checkoutUrl || checkoutUrl.includes("paynow.example")) {
      Alert.alert("Demo payment", "Paynow credentials are not configured yet, so this payment has a demo checkout reference.");
      return;
    }
    await Linking.openURL(checkoutUrl);
  }

  async function refreshCurrentPayment() {
    if (!payment) {
      return;
    }
    setLoading(true);
    try {
      setPayment(await refreshPayment(payment.id));
    } catch (error) {
      Alert.alert("Could not refresh payment", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.card}>
        <Text style={styles.title}>Payment types</Text>
        <Text style={styles.copy}>listing_fee, featured_listing, viewing_fee, rent, deposit, management_fee</Text>
      </View>
      <Field label="Payment type" value={paymentType} onChangeText={setPaymentType} autoCapitalize="none" />
      <Field label="Amount USD" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
      <Field label="Channel" value={channel} onChangeText={setChannel} autoCapitalize="none" />
      <Field label="Phone or reference" value={reference} onChangeText={setReference} />
      <PrimaryButton label={loading ? "Starting..." : "Start payment"} onPress={startPayment} disabled={loading} />
      {payment ? (
        <View style={styles.paymentCard}>
          <Text style={styles.title}>Latest payment</Text>
          <Text style={styles.copy}>Reference: {payment.provider_reference}</Text>
          <Text style={styles.copy}>Status: {payment.status}</Text>
          {payment.provider_status_message ? <Text style={styles.copy}>{payment.provider_status_message}</Text> : null}
          <PrimaryButton label="Open checkout" onPress={openCheckout} variant="secondary" />
          <PrimaryButton label={loading ? "Refreshing..." : "Refresh status"} onPress={refreshCurrentPayment} disabled={loading} variant="secondary" />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: spacing.md
  },
  title: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900"
  },
  copy: {
    color: colors.muted,
    lineHeight: 21
  },
  paymentCard: {
    gap: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: spacing.md
  }
});
