import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import axios from "axios";
import GlobalStyles from "../styles/GlobalStyles";
import { LinearGradient } from "expo-linear-gradient";

export default function EkranKursow({ navigation }) {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExchangeRates = async () => {
    try {
      const response = await axios.get( //zapytanie GET do API NBP, aby pobrać tabelę kursów
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
    fetchExchangeRates(); // Pobranie danych kursów walut
  }, []);

  // pojedynczy element kursu waluty
  const renderRateItem = ({ item }) => (
    <View style={GlobalStyles.rateItem}>
      <Text style={GlobalStyles.currency}>
        {item.currency} ({item.code})
      </Text>
      <Text style={GlobalStyles.rate}>{item.mid.toFixed(4)} PLN</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={["#006466", "#4d194d"]}
      style={GlobalStyles.gradientContainer}
    >
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
        {/* Przycisk nawigujący do ekranu z historią kursów */}
        <TouchableOpacity
          style={GlobalStyles.button}
          onPress={() => {
            console.log("Nawigacja do: EkranHistorii");
            navigation.navigate("EkranHistorii");
          }}
        >
          <Text style={GlobalStyles.buttonText}>Historia Kursów</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
