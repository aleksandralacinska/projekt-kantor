import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, Alert } from "react-native";
import axios from "axios";
import { backendURL } from "../services/config";
import { useFocusEffect } from "@react-navigation/native"; // Importujemy useFocusEffect

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

  // Hook useFocusEffect uruchamia fetchBalances za każdym razem, gdy ekran jest w centrum uwagi
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
      <View style={styles.balanceItem}>
        <Text style={styles.currency}>{currency}</Text>
        <Text style={styles.balance}>
          {balance.toFixed(2)} {currency}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stan konta użytkownika</Text>
      <FlatList
        data={Object.entries(balances)} // Konwersja obiektu na tablicę
        renderItem={renderBalanceItem}
        keyExtractor={([currency]) => currency}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  balanceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  currency: {
    fontSize: 18,
    fontWeight: "bold",
  },
  balance: {
    fontSize: 18,
    color: "#555",
  },
});
