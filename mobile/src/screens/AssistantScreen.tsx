import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { askAssistant } from "../api/client";
import { Screen } from "../components/Screen";
import { colors, spacing } from "../theme";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

const starterMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    text: "Hi, I am the Wana Imba assistant. Ask me about rentals, buying, listing a property, bookings, payments, or management."
  }
];

const quickQuestions = ["How do I list a property?", "How do I book a viewing?", "What is Wana Imba managed?"];

export function AssistantScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(text = draft) {
    const trimmed = text.trim();
    if (!trimmed || loading) {
      return;
    }

    const userMessage: ChatMessage = { id: `${Date.now()}-user`, role: "user", text: trimmed };
    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setLoading(true);

    try {
      const response = await askAssistant(trimmed);
      setMessages((current) => [...current, { id: `${Date.now()}-assistant`, role: "assistant", text: response.reply }]);
    } catch (error) {
      const fallback =
        error instanceof Error
          ? `I could not reach the assistant service. ${error.message}`
          : "I could not reach the assistant service.";
      setMessages((current) => [...current, { id: `${Date.now()}-assistant`, role: "assistant", text: fallback }]);
      Alert.alert("Assistant offline", "Restart the backend and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Wana Imba AI</Text>
        <Text style={styles.title}>Assistant</Text>
        <Text style={styles.copy}>Get help with searching, listing, bookings, payments, and property management.</Text>
      </View>

      <View style={styles.quickRow}>
        {quickQuestions.map((question) => (
          <Pressable key={question} style={styles.quickButton} onPress={() => sendMessage(question)}>
            <Text style={styles.quickText}>{question}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.chatPanel}>
        {messages.map((message) => (
          <View key={message.id} style={[styles.bubble, message.role === "user" ? styles.userBubble : styles.assistantBubble]}>
            <Text style={[styles.bubbleText, message.role === "user" ? styles.userText : null]}>{message.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.inputRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Ask Wana Imba..."
          placeholderTextColor="#8b948d"
          style={styles.input}
          multiline
        />
        <Pressable accessibilityRole="button" accessibilityLabel="Send message" onPress={() => sendMessage()} style={styles.sendButton}>
          <Ionicons name={loading ? "hourglass-outline" : "send"} size={22} color={colors.surface} />
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
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
    fontSize: 36,
    fontWeight: "900"
  },
  copy: {
    color: "#eaf4ed",
    fontSize: 16,
    lineHeight: 23
  },
  quickRow: {
    gap: spacing.sm
  },
  quickButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: spacing.md
  },
  quickText: {
    color: colors.green,
    fontWeight: "900"
  },
  chatPanel: {
    gap: spacing.sm
  },
  bubble: {
    maxWidth: "88%",
    borderRadius: 8,
    padding: spacing.md
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.green
  },
  bubbleText: {
    color: colors.ink,
    lineHeight: 21
  },
  userText: {
    color: colors.surface,
    fontWeight: "800"
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: spacing.sm
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    color: colors.ink,
    paddingHorizontal: spacing.sm
  },
  sendButton: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.green
  }
});
