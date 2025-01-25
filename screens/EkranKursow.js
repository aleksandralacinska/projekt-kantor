import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from "react-native";
import axios from "axios";

export default function EkranKursow() {
  const [rates, setRates] = useState([]); // Przechowywanie kursów walut
  const [loading, setLoading] = useState(true); // Status ładowania

  // Funkcja pobierająca dane z API NBP
  const fetchExchangeRates = async () => {
    try {
      const response = await axios.get("https://api.nbp.pl/api/exchangerates/tables/A?format=json");
      console.log("Otrzymane dane z API NBP:", response.data);

      // Przypisanie kursów walut do stanu
      const fetchedRates = response.data[0].rates; // Kursy znajdują się w tablicy `rates`
      setRates(fetchedRates);
    } catch (error) {
      console.error("Błąd podczas pobierania danych z API NBP:", error);
      Alert.alert("Błąd", "Nie udało się pobrać kursów walut. Spróbuj ponownie później.");
    } finally {
      setLoading(false); // Zakończenie ładowania
    }
  };

  // Pobieranie danych przy pierwszym renderze
  useEffect(() => {
    fetchExchangeRates();
  }, []);

  // Renderowanie pojedynczego elementu na liście
  const renderRateItem = ({ item }) => (
    <View style={styles.rateItem}>
      <Text style={styles.currency}>{item.currency} ({item.code})</Text>
      <Text style={styles.rate}>{item.mid.toFixed(4)} PLN</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kursy Walut</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1E90FF" />
      ) : (
        <FlatList
          data={rates}
          renderItem={renderRateItem}
          keyExtractor={(item) => item.code} // Klucz to kod waluty (np. USD, EUR)
        />
      )}
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
  rateItem: {
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
  rate: {
    fontSize: 18,
    color: "#555",
  },
});
