import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { backendURL } from "../services/config";
import GlobalStyles from "../styles/GlobalStyles";

export default function EkranWymiany({ route, navigation }) {
  const userId = route.params?.userId;
  const [amount, setAmount] = useState("");
  const [targetCurrency, setTargetCurrency] = useState("USD");
  const [rates, setRates] = useState([]);
  const sourceCurrency = "PLN";

  const fetchExchangeRates = async () => {
    try {
      const response = await axios.get(
        "https://api.nbp.pl/api/exchangerates/tables/A?format=json"
      );
      const fetchedRates = response.data[0].rates.map((rate) => ({
        code: rate.code,
        currency: rate.currency,
      }));
      setRates(fetchedRates);
    } catch (error) {
      console.error("Błąd podczas pobierania kursów walut:", error);
      Alert.alert(
        "Błąd",
        "Nie udało się pobrać kursów walut. Spróbuj ponownie później."
      );
    }
  };

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const handleExchange = async () => {
    const exchangeAmount = parseFloat(amount);
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
          `Wymieniono ${exchangeAmount.toFixed(
            2
          )} ${sourceCurrency} na ${response.data.exchanged_amount.toFixed(
            2
          )} ${targetCurrency}`
        );
        navigation.navigate("App", { userId: userId });
      }
    } catch (error) {
      console.error("Błąd podczas wymiany walut:", error);
      Alert.alert(
        "Błąd",
        error.response?.data?.detail || "Nie udało się wymienić walut."
      );
    }
  };

  return (
    <View style={GlobalStyles.container}>
      <Text style={GlobalStyles.title}>Wymiana Walut</Text>

      <TextInput
        style={GlobalStyles.input}
        placeholder={`Kwota w ${sourceCurrency}`}
        value={amount}
        onChangeText={(text) => setAmount(text)}
        keyboardType="numeric"
      />

      <Text style={GlobalStyles.label}>Wybierz walutę docelową:</Text>
      <Picker
        selectedValue={targetCurrency}
        style={GlobalStyles.picker}
        onValueChange={(itemValue) => setTargetCurrency(itemValue)}
      >
        {rates.map((rate) => (
          <Picker.Item
            key={rate.code}
            label={`${rate.currency} (${rate.code})`}
            value={rate.code}
          />
        ))}
      </Picker>

      <Button title="Wymień walutę" onPress={handleExchange} />
    </View>
  );
}
