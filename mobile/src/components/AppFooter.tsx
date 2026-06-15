import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, spacing } from "../theme";

const payments = [
  { name: "Paynow", wordmark: "paynow", color: "#0f5ca8", icon: "card-outline" },
  { name: "EcoCash", wordmark: "EcoCash", color: "#127f3f", icon: "phone-portrait-outline" },
  { name: "OneMoney", wordmark: "OneMoney", color: "#c5222f", icon: "phone-portrait-outline" },
  { name: "Visa", wordmark: "VISA", color: "#1a4fa3", icon: "card-outline" },
  { name: "Mastercard", wordmark: "mastercard", color: "#231f20", icon: "card-outline" },
  { name: "ZimSwitch", wordmark: "ZimSwitch", color: "#1b4d89", icon: "swap-horizontal-outline" },
  { name: "InnBucks", wordmark: "InnBucks", color: "#e07d13", icon: "wallet-outline" }
] as const;
const socials = [
  { icon: "logo-facebook", label: "@WanaImba" },
  { icon: "logo-instagram", label: "@wanaimba" },
  { icon: "logo-whatsapp", label: "+263 77 000 0000" },
  { icon: "mail-outline", label: "hello@wanaimba.co.zw" }
] as const;

export function AppFooter() {
  return (
    <View style={styles.footer}>
      <Text style={styles.title}>Accepted payments</Text>
      <View style={styles.paymentWrap}>
        {payments.map((payment) => (
          <PaymentLogo key={payment.name} {...payment} />
        ))}
      </View>

      <Text style={styles.title}>Connect with Wana Imba</Text>
      <View style={styles.socialList}>
        {socials.map((social) => (
          <View key={social.label} style={styles.socialRow}>
            <Ionicons name={social.icon} size={18} color={colors.gold} />
            <Text style={styles.socialText}>{social.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function PaymentLogo({ name, wordmark, color, icon }: (typeof payments)[number]) {
  if (name === "Mastercard") {
    return (
      <View accessibilityLabel={name} style={[styles.logoBadge, styles.mastercardBadge]}>
        <View style={styles.mastercardMark}>
          <View style={[styles.cardCircle, styles.mastercardRed]} />
          <View style={[styles.cardCircle, styles.mastercardGold]} />
        </View>
        <Text style={[styles.logoText, { color }]}>{wordmark}</Text>
      </View>
    );
  }

  if (name === "Visa") {
    return (
      <View accessibilityLabel={name} style={[styles.logoBadge, styles.visaBadge]}>
        <Text style={[styles.visaText, { color }]}>{wordmark}</Text>
      </View>
    );
  }

  return (
    <View accessibilityLabel={name} style={styles.logoBadge}>
      <Ionicons name={icon} size={13} color={color} />
      <Text style={[styles.logoText, { color }]}>{wordmark}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.green,
    padding: spacing.md
  },
  title: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: "900"
  },
  paymentWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  logoBadge: {
    minWidth: 74,
    height: 32,
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 8
  },
  logoText: {
    color: colors.green,
    fontSize: 11,
    fontWeight: "900"
  },
  visaBadge: {
    backgroundColor: "#ffffff"
  },
  visaText: {
    color: "#1a4fa3",
    fontSize: 15,
    fontWeight: "900"
  },
  mastercardBadge: {
    minWidth: 104,
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#ffffff"
  },
  mastercardMark: {
    flexDirection: "row"
  },
  cardCircle: {
    width: 22,
    height: 22,
    borderRadius: 11
  },
  mastercardRed: {
    marginRight: -7,
    backgroundColor: "#eb001b"
  },
  mastercardGold: {
    backgroundColor: "#f79e1b"
  },
  socialList: {
    gap: spacing.xs
  },
  socialRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  socialText: {
    color: colors.surface,
    fontWeight: "800"
  }
});
