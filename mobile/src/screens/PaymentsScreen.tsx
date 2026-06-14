import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { initiatePayment } from "../api/client";
import { Field } from "../components/Field";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { colors, spacing } from "../theme";

export function PaymentsScreen() {
  const [paymentType, setPaymentType] = useState("listing_fee");
  const [amount, setAmount] = useState("5");
  const [channel, setChannel] = useState("paynow_ecocash");
  const [reference, setReference] = useState("+263770000000");
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
      Alert.alert("Payment started", `${payment.provider_reference} is ${payment.status}.`);
    } catch {
      Alert.alert("Backend needed", "Run the FastAPI backend to create real payment records.");
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
  }
});
