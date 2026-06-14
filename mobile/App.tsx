import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AdminScreen } from "./src/screens/AdminScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ListPropertyScreen } from "./src/screens/ListPropertyScreen";
import { ManagementScreen } from "./src/screens/ManagementScreen";
import { PaymentsScreen } from "./src/screens/PaymentsScreen";
import { colors } from "./src/theme";

export type RootTabParamList = {
  Search: undefined;
  List: undefined;
  Manage: undefined;
  Payments: undefined;
  Admin: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
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
                List: "add-circle-outline",
                Manage: "business-outline",
                Payments: "card-outline",
                Admin: "shield-checkmark-outline"
              };
              return <Ionicons name={icons[route.name]} color={color} size={size} />;
            }
          })}
        >
          <Tab.Screen name="Search" component={HomeScreen} options={{ title: "ZimHomes" }} />
          <Tab.Screen name="List" component={ListPropertyScreen} options={{ title: "List Property" }} />
          <Tab.Screen name="Manage" component={ManagementScreen} options={{ title: "Management" }} />
          <Tab.Screen name="Payments" component={PaymentsScreen} options={{ title: "Payments" }} />
          <Tab.Screen name="Admin" component={AdminScreen} options={{ title: "Admin" }} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
