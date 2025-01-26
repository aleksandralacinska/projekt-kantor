import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Alert } from "react-native";

// Import ekranów
import EkranGlowny from "../screens/EkranGlowny";
import EkranKursow from "../screens/EkranKursow";
import EkranWplaty from "../screens/EkranWplaty";
import EkranWymiany from "../screens/EkranWymiany";
import EkranLogowania from "../screens/EkranLogowania";
import EkranRejestracji from "../screens/EkranRejestracji";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator({ route, navigation }) {
  const userId = route.params?.userId;

  console.log("Przekazano userId w TabNavigator:", userId);

  if (!userId) {
    console.error("Brak userId w TabNavigator!");
    Alert.alert(
      "Błąd",
      "Brak danych użytkownika. Zaloguj się ponownie.",
      [
        {
          text: "OK",
          onPress: () => {
            navigation.navigate("EkranLogowania"); // Powrót do logowania
          },
        },
      ]
    );
    return null; // Zapobiega renderowaniu ekranów bez userId
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: "#ffffff" },
        tabBarActiveTintColor: "#1E90FF",
        tabBarInactiveTintColor: "#555",
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Strona Główna") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Kursy Walut") {
            iconName = focused ? "cash" : "cash-outline";
          } else if (route.name === "Zasilenie Konta") {
            iconName = focused ? "wallet" : "wallet-outline";
          } else if (route.name === "Wymiana Walut") {
            iconName = focused
              ? "swap-horizontal"
              : "swap-horizontal-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Strona Główna">
        {(props) => (
          <EkranGlowny
            {...props}
            route={{ ...props.route, params: { userId } }}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Kursy Walut">
        {(props) => (
          <EkranKursow
            {...props}
            route={{ ...props.route, params: { userId } }}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Zasilenie Konta">
        {(props) => (
          <EkranWplaty
            {...props}
            route={{ ...props.route, params: { userId } }}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Wymiana Walut">
        {(props) => (
          <EkranWymiany
            {...props}
            route={{ ...props.route, params: { userId } }}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="EkranLogowania">
        {/* Ekran logowania */}
        <Stack.Screen
          name="EkranLogowania"
          component={EkranLogowania}
          options={{ title: "Witaj w aplikacji Kantor :)" }}
        />
        {/* Ekran rejestracji */}
        <Stack.Screen
          name="EkranRejestracji"
          component={EkranRejestracji}
          options={{ title: "Witaj w aplikacji Kantor :)" }}
        />
        {/* Główna aplikacja */}
        <Stack.Screen
          name="App"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}