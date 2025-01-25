import React, { useState, useCallback } from "react";
import { View, Text, FlatList, Alert } from "react-native";
import axios from "axios";
import { backendURL } from "../services/config";
import { useFocusEffect } from "@react-navigation/native";
import GlobalStyles from "../styles/GlobalStyles";

export default function EkranGlowny({ route }) {
  const [balances, setBalances] = useState({});
  const userId = route.params?.userId;

  const fetchBalances = async () => {
    try {
      const response = await axios.get(`${backendURL}/balance/`, {
        params: { user_id: userId },
      });
      console.log("Odpowiedź z backendu (balance):", response.data);
      setBalances(response.data.balances);
    } catch (error) {
      console.error("Błąd podczas ładowania sald:", error);
      Alert.alert("Błąd", "Nie udało się pobrać sald.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchBalances();
      }
    }, [userId])
  );

  const renderBalanceItem = ({ item }) => {
    const [currency, balance] = item;
    return (
      <View style={GlobalStyles.balanceItem}>
        <Text style={GlobalStyles.currency}>{currency}</Text>
        <Text style={GlobalStyles.balance}>
          {balance.toFixed(2)} {currency}
        </Text>
      </View>
    );
  };

  return (
    <View style={GlobalStyles.container}>
      <Text style={GlobalStyles.title}>Stan konta użytkownika</Text>
      <FlatList
        data={Object.entries(balances)}
        renderItem={renderBalanceItem}
        keyExtractor={([currency]) => currency}
      />
    </View>
  );
}
