import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Alert } from "react-native";
import axios from "axios";
import GlobalStyles from "../styles/GlobalStyles";

export default function EkranKursow() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExchangeRates = async () => {
    try {
      const response = await axios.get(
        "https://api.nbp.pl/api/exchangerates/tables/A?format=json"
      );
      console.log("Otrzymane dane z API NBP:", response.data);
      const fetchedRates = response.data[0].rates;
      setRates(fetchedRates);
    } catch (error) {
      console.error("Błąd podczas pobierania danych z API NBP:", error);
      Alert.alert(
        "Błąd",
        "Nie udało się pobrać kursów walut. Spróbuj ponownie później."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const renderRateItem = ({ item }) => (
    <View style={GlobalStyles.rateItem}>
      <Text style={GlobalStyles.currency}>
        {item.currency} ({item.code})
      </Text>
      <Text style={GlobalStyles.rate}>{item.mid.toFixed(4)} PLN</Text>
    </View>
  );

  return (
    <View style={GlobalStyles.container}>
      <Text style={GlobalStyles.title}>Kursy Walut</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#1E90FF" />
      ) : (
        <FlatList
          data={rates}
          renderItem={renderRateItem}
          keyExtractor={(item) => item.code}
        />
      )}
    </View>
  );
}
