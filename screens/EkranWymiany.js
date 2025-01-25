import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { backendURL } from "../services/config";

export default function EkranWymiany({ route, navigation }) {
  const userId = route.params?.userId; // Pobranie userId z parametrów
  const [amount, setAmount] = useState(""); // Kwota do wymiany
  const [targetCurrency, setTargetCurrency] = useState("USD"); // Domyślna waluta docelowa
  const [rates, setRates] = useState([]); // Przechowywanie kursów walut
  const sourceCurrency = "PLN"; // Waluta źródłowa (domyślnie PLN)

  // Pobierz kursy walut z API NBP
  const fetchExchangeRates = async () => {
    try {
      const response = await axios.get("https://api.nbp.pl/api/exchangerates/tables/A?format=json");
      const fetchedRates = response.data[0].rates.map((rate) => ({
        code: rate.code, // Kod waluty (np. USD)
        currency: rate.currency, // Nazwa waluty (np. Dolar amerykański)
      }));
      setRates(fetchedRates);
    } catch (error) {
      console.error("Błąd podczas pobierania kursów walut:", error);
      Alert.alert("Błąd", "Nie udało się pobrać kursów walut. Spróbuj ponownie później.");
    }
  };

  useEffect(() => {
    fetchExchangeRates(); // Pobierz kursy walut przy załadowaniu ekranu
  }, []);

  const handleExchange = async () => {
    const exchangeAmount = parseFloat(amount); // Konwersja kwoty na liczbę
    if (isNaN(exchangeAmount) || exchangeAmount <= 0) {
      Alert.alert("Błąd", "Proszę wprowadzić poprawną kwotę");
      return;
    }

    console.log("Próba wymiany waluty:", {
      user_id: userId,
      source_currency: sourceCurrency.toUpperCase(),
      target_currency: targetCurrency.toUpperCase(),
      amount: exchangeAmount,
    });

    try {
      const response = await axios.post(`${backendURL}/exchange/`, {
        user_id: userId,
        source_currency: sourceCurrency.toUpperCase(),
        target_currency: targetCurrency.toUpperCase(),
        amount: exchangeAmount,
      });

      if (response.status === 200) {
        Alert.alert(
          "Sukces",
          `Wymieniono ${exchangeAmount.toFixed(2)} ${sourceCurrency} na ${response.data.exchanged_amount.toFixed(2)} ${targetCurrency}`
        );

        // Powrót na ekran główny z przekazaniem userId
        navigation.navigate("App", {
          userId: userId,
        });
      }
    } catch (error) {
      console.error("Błąd podczas wymiany walut:", error);

      Alert.alert(
        "Błąd",
        error.response?.data?.detail || "Nie udało się wymienić walut. Spróbuj ponownie."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wymiana Walut</Text>

      <TextInput
        style={styles.input}
        placeholder={`Kwota w ${sourceCurrency}`}
        value={amount}
        onChangeText={(text) => setAmount(text)}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Wybierz walutę docelową:</Text>
      <Picker
        selectedValue={targetCurrency}
        style={styles.picker}
        onValueChange={(itemValue) => setTargetCurrency(itemValue)}
      >
        {rates.map((rate) => (
          <Picker.Item key={rate.code} label={`${rate.currency} (${rate.code})`} value={rate.code} />
        ))}
      </Picker>

      <Button title="Wymień walutę" onPress={handleExchange} />
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
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  picker: {
    height: 50,
    marginBottom: 16,
  },
});
