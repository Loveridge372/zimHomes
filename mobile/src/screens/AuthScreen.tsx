import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { login, register, setAuthToken } from "../api/client";
import { Field } from "../components/Field";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { colors, spacing } from "../theme";
import { User } from "../types";

type Props = {
  onAuthenticated: (token: string, user: User) => void;
};

export function AuthScreen({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [role, setRole] = useState("owner");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);

  function validateForm() {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail.includes("@")) {
      Alert.alert("Check email", "Enter a valid email address.");
      return false;
    }
    if (trimmedPassword.length < 8) {
      Alert.alert("Check password", "Password must be at least 8 characters.");
      return false;
    }
    if (mode === "register" && fullName.trim().length < 2) {
      Alert.alert("Check name", "Enter your full name.");
      return false;
    }
    if (mode === "register" && password !== passwordConfirmation) {
      Alert.alert("Check password", "Password and confirmation must match.");
      return false;
    }
    return true;
  }

  async function submit() {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response =
        mode === "register"
          ? await register({
              full_name: fullName.trim(),
              email: email.trim().toLowerCase(),
              phone: phone.trim(),
              password,
              role: role.trim().toLowerCase()
            })
          : await login({ email: email.trim().toLowerCase(), password });

      setAuthToken(response.token);
      onAuthenticated(response.token, response.user);
    } catch (error) {
      Alert.alert("Account error", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Welcome to</Text>
        <Text style={styles.title}>ZimHomes</Text>
        <Text style={styles.copy}>Create an account to list properties, request viewings, manage payments, and save your activity.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.switchRow}>
          <PrimaryButton label="Register" onPress={() => setMode("register")} variant={mode === "register" ? "primary" : "secondary"} />
          <PrimaryButton label="Login" onPress={() => setMode("login")} variant={mode === "login" ? "primary" : "secondary"} />
        </View>

        {mode === "register" ? (
          <>
            <Field label="Full name" value={fullName} onChangeText={setFullName} placeholder="Loveridge Moyo" />
            <Field label="Phone" value={phone} onChangeText={setPhone} placeholder="+263 77 000 0000" keyboardType="phone-pad" />
            <Field label="Role" value={role} onChangeText={setRole} placeholder="owner, seeker, buyer, agent" autoCapitalize="none" />
          </>
        ) : null}

        <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 8 characters"
          secureTextEntry={!showPassword}
          rightElement={
            <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? "Hide password" : "Show password"} onPress={() => setShowPassword((value) => !value)}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color={colors.muted} />
            </Pressable>
          }
        />
        {mode === "register" ? (
          <Field
            label="Confirm password"
            value={passwordConfirmation}
            onChangeText={setPasswordConfirmation}
            placeholder="Repeat your password"
            secureTextEntry={!showPasswordConfirmation}
            rightElement={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showPasswordConfirmation ? "Hide password confirmation" : "Show password confirmation"}
                onPress={() => setShowPasswordConfirmation((value) => !value)}
              >
                <Ionicons name={showPasswordConfirmation ? "eye-off-outline" : "eye-outline"} size={22} color={colors.muted} />
              </Pressable>
            }
          />
        ) : null}
        <PrimaryButton label={loading ? "Please wait..." : mode === "register" ? "Create account" : "Login"} onPress={submit} disabled={loading} />
      </View>
    </Screen>
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
  card: {
    gap: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: spacing.md
  },
  switchRow: {
    flexDirection: "row",
    gap: spacing.sm
  }
});
