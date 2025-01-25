import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import axios from "axios";
import { backendURL } from "../services/config";
import GlobalStyles from "../styles/GlobalStyles";
import { LinearGradient } from "expo-linear-gradient";

// Import nowego komponentu
import DismissKeyboard from "../components/DismissKeyboard";

export default function EkranWplaty({ route, navigation }) {
  const [amount, setAmount] = useState("");
  const userId = route.params?.userId;
  const currency = "PLN";

  if (!userId) {
    console.error("Nie znaleziono userId w parametrach!");
    Alert.alert("Błąd", "Brak danych użytkownika. Zaloguj się ponownie.");
    navigation.navigate("EkranLogowania");
    return null;
  }

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      Alert.alert("Błąd", "Proszę wprowadzić poprawną kwotę");
      return;
    }

    console.log("Próba zasilenia konta:", {
      user_id: userId,
      currency,
      amount: depositAmount,
    });

    try {
      const response = await axios.post(`${backendURL}/deposit/`, {
        user_id: userId,
        currency,
        amount: depositAmount,
      });

      if (response.status === 200) {
        const newBalance = response.data.new_balance;
        Alert.alert(
          "Sukces",
          `Twoje konto zostało zasilone. Nowe saldo: ${newBalance.toFixed(2)} PLN`
        );
        navigation.navigate("App", { userId });
      }
    } catch (error) {
      console.error("Błąd podczas zasilenia konta:", error);

      if (error.response) {
        Alert.alert(
          "Błąd",
          error.response.data?.detail || "Nie udało się zasilić konta"
        );
      } else {
        Alert.alert(
          "Błąd",
          "Wystąpił problem z połączeniem. Sprawdź swoje połączenie internetowe."
        );
      }
    }
  };

  return (
    <DismissKeyboard>
      <LinearGradient
        colors={["#006466", "#4d194d"]}
        style={GlobalStyles.gradientContainer}
      >
        <View style={GlobalStyles.container}>
          <Text style={GlobalStyles.title}>Zasilenie Konta</Text>

          <TextInput
            style={GlobalStyles.input}
            placeholder="Wprowadź kwotę"
            value={amount}
            onChangeText={(text) => setAmount(text)}
            keyboardType="numeric"
          />

          <TouchableOpacity style={GlobalStyles.button} onPress={handleDeposit}>
            <Text style={GlobalStyles.buttonText}>Zasil konto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={GlobalStyles.backButton} onPress={() => navigation.goBack()}>
            <Text style={GlobalStyles.backButtonText}>Powrót</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </DismissKeyboard>
  );
}
