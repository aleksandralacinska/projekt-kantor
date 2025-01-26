import React from "react";
import AppNavigator from "./navigation/AppNavigator";
import { UserProvider } from "./services/UserContext";
import { useFonts } from "expo-font";
import { Text } from "react-native";

export default function App() {
  const [fontsLoaded] = useFonts({
    Montserrat: require("./assets/fonts/Montserrat-Regular.ttf"),
    MontserratBold: require("./assets/fonts/Montserrat-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  // Globalne ustawienie stylu tekstu
  Text.defaultProps = Text.defaultProps || {};
  Text.defaultProps.style = { fontFamily: "Montserrat" };

  return (
    <UserProvider>
      <AppNavigator />
    </UserProvider>
  );
}
