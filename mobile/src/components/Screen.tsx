import { PropsWithChildren } from "react";
import { ImageBackground, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { spacing } from "../theme";

const backgroundImage = require("../../assets/wana-imba-background.jpeg");

export function Screen({ children }: PropsWithChildren) {
  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.background}>
        <View style={styles.scrim}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.inner}>{children}</View>
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1
  },
  background: {
    flex: 1
  },
  scrim: {
    flex: 1,
    backgroundColor: "rgba(244, 246, 241, 0.74)"
  },
  content: {
    padding: spacing.md
  },
  inner: {
    gap: spacing.md
  }
});
