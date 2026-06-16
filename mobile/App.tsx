import { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthScreen } from "./src/screens/AuthScreen";
import { ActivityScreen } from "./src/screens/ActivityScreen";
import { AdminScreen } from "./src/screens/AdminScreen";
import { AssistantScreen } from "./src/screens/AssistantScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ListPropertyScreen } from "./src/screens/ListPropertyScreen";
import { MatchesScreen } from "./src/screens/MatchesScreen";
import { ManagementScreen } from "./src/screens/ManagementScreen";
import { PaymentsScreen } from "./src/screens/PaymentsScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { FavoritesProvider } from "./src/state/FavoritesContext";
import { colors } from "./src/theme";
import { User } from "./src/types";

export type RootTabParamList = {
  Search: undefined;
  Matches: undefined;
  List: undefined;
  Manage: undefined;
  Payments: undefined;
  Activity: undefined;
  Profile: undefined;
  Assistant: undefined;
  Admin: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  return (
    <SafeAreaProvider>
      <FavoritesProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          {currentUser ? (
            <Tab.Navigator
              screenOptions={({ route }) => ({
                headerStyle: { backgroundColor: colors.surface },
                headerTitleStyle: { color: colors.ink, fontWeight: "800" },
                tabBarActiveTintColor: colors.green,
                tabBarInactiveTintColor: colors.muted,
                tabBarStyle: { borderTopColor: colors.line },
                tabBarIcon: ({ color, size }) => {
                  const icons: Record<keyof RootTabParamList, keyof typeof Ionicons.glyphMap> = {
                    Search: "search",
                    Matches: "sparkles-outline",
                    List: "add-circle-outline",
                    Manage: "business-outline",
                    Payments: "card-outline",
                    Activity: "calendar-outline",
                    Profile: "person-circle-outline",
                    Assistant: "chatbubble-ellipses-outline",
                    Admin: "shield-checkmark-outline"
                  };
                  return <Ionicons name={icons[route.name]} color={color} size={size} />;
                }
              })}
            >
              <Tab.Screen name="Search" component={HomeScreen} options={{ title: `Wana Imba - ${currentUser.role}` }} />
              <Tab.Screen name="Matches" component={MatchesScreen} options={{ title: "Matches" }} />
              <Tab.Screen name="List" component={ListPropertyScreen} options={{ title: "List Property" }} />
              <Tab.Screen name="Manage" component={ManagementScreen} options={{ title: "Management" }} />
              <Tab.Screen name="Payments" component={PaymentsScreen} options={{ title: "Payments" }} />
              <Tab.Screen name="Activity" component={ActivityScreen} options={{ title: "My Activity" }} />
              <Tab.Screen name="Profile" options={{ title: "Profile" }}>
                {() => <ProfileScreen user={currentUser} onUserUpdated={setCurrentUser} />}
              </Tab.Screen>
              <Tab.Screen name="Assistant" component={AssistantScreen} options={{ title: "Assistant" }} />
              <Tab.Screen name="Admin" component={AdminScreen} options={{ title: "Admin" }} />
            </Tab.Navigator>
          ) : (
            <AuthScreen onAuthenticated={(_token, user) => setCurrentUser(user)} />
          )}
        </NavigationContainer>
      </FavoritesProvider>
    </SafeAreaProvider>
  );
}
