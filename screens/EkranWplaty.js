import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import axios from "axios";
import { backendURL } from "../services/config";

export default function EkranWplaty({ route, navigation }) {
  const [amount, setAmount] = useState("");
  const userId = route.params?.userId; // Pobieranie userId z parametrów
  const currency = "PLN"; // Domyślna waluta

  // Walidacja userId
  if (!userId) {
    console.error("Nie znaleziono userId w parametrach!");
    Alert.alert("Błąd", "Brak danych użytkownika. Zaloguj się ponownie.");
    navigation.navigate("EkranLogowania"); // Powrót do logowania
    return null;
  }

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount); // Konwersja kwoty na liczbę
    if (isNaN(depositAmount) || depositAmount <= 0) {
      Alert.alert("Błąd", "Proszę wprowadzić poprawną kwotę");
      return;
    }
  
    console.log("Próba zasilenia konta:", {
      user_id: userId,
      currency: currency,
      amount: depositAmount,
    });
  
    try {
      const response = await axios.post(`${backendURL}/deposit/`, {
        user_id: userId,
        currency: currency,
        amount: depositAmount,
      });
  
      if (response.status === 200) {
        const newBalance = response.data.new_balance;
        Alert.alert(
          "Sukces",
          `Twoje konto zostało zasilone. Nowe saldo: ${newBalance.toFixed(2)} PLN`
        );
  
        // Przekazanie userId podczas nawigacji
        navigation.navigate("App", {
          userId: userId,
        });
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
    <View style={styles.container}>
      <Text style={styles.title}>Zasilenie Konta</Text>

      <TextInput
        style={styles.input}
        placeholder="Wprowadź kwotę"
        value={amount}
        onChangeText={(text) => setAmount(text)}
        keyboardType="numeric"
      />

      <Button title="Zasil konto" onPress={handleDeposit} />

      <Button title="Powrót" onPress={() => navigation.goBack()} color="gray" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
});
