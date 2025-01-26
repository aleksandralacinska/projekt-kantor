import React, { useState, useEffect } from "react";
import {View, Text, ActivityIndicator, Alert, Dimensions, ScrollView, StyleSheet } from "react-native";
import { LineChart } from "react-native-chart-kit";
import axios from "axios";
import GlobalStyles from "../styles/GlobalStyles";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from '@react-native-picker/picker';
const screenWidth = Dimensions.get("window").width;

// Słownik krótkich nazw miesięcy
const MONTH_NAMES = {
  "01": "Sty",
  "02": "Lut",
  "03": "Mar",
  "04": "Kwi",
  "05": "Maj",
  "06": "Cze",
  "07": "Lip",
  "08": "Sie",
  "09": "Wrz",
  "10": "Paź",
  "11": "Lis",
  "12": "Gru",
};

export default function EkranHistoriiKursow() {
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState([]);

  const currentYear = new Date().getFullYear();
  const today = new Date().toISOString().split("T")[0];
  const years = Array.from({ length: currentYear - 2002 + 1 }, (_, i) =>
    (currentYear - i).toString()
  );

  const fetchCurrencies = async () => {
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
      console.error("Błąd podczas pobierania walut:", error);
      Alert.alert(
        "Błąd",
        "Nie udało się pobrać dostępnych walut. Spróbuj ponownie później."
      );
    }
  };

  const fetchHistoricalRates = async (currencyCode, year) => {
    setLoading(true);
    try {
      const startDate = `${year}-01-01`;
      const endDate =
        year === currentYear.toString() ? today : `${year}-12-31`;

      const response = await axios.get(
        `https://api.nbp.pl/api/exchangerates/rates/a/${currencyCode}/${startDate}/${endDate}/?format=json`
      );

      const rates = response.data.rates.map((rate) => ({
        date: rate.effectiveDate, // format: YYYY-MM-DD
        value: rate.mid,
      }));

      setHistoricalData(rates);
    } catch (error) {
      console.error("Błąd pobierania danych historycznych:", error);
      Alert.alert(
        "Błąd",
        "Nie udało się pobrać danych historycznych. Spróbuj ponownie później."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  useEffect(() => {
    if (selectedCurrency && selectedYear) {
      fetchHistoricalRates(selectedCurrency, selectedYear);
    }
  }, [selectedCurrency, selectedYear]);

  const renderChart = () => {
    if (historicalData.length === 0) return null;

    // Przygotowanie danych osi X (dat) i Y (wartości)
    const labels = historicalData.map((data) => data.date);
    const values = historicalData.map((data) => data.value);

    // 1. Dla każdego miesiąca (MM) znajdujemy indeks najwcześniejszej daty
    const earliestIndexForMonth = {};
    labels.forEach((dateStr, i) => {
      const [yyyy, mm, dd] = dateStr.split("-");
      // Jeśli jeszcze nie mamy zapisanego indeksu dla danego miesiąca, zapisujemy aktualny
      // (pierwsze napotkane "mm" w sorted data jest najwcześniejsze)
      if (earliestIndexForMonth[mm] === undefined) {
        earliestIndexForMonth[mm] = i;
      }
    });

    // 2. Tworzymy tablicę xLabels, która ma nazwę miesiąca tylko przy earliestIndexForMonth,
    //    w przeciwnym wypadku pusty string
    const xLabels = labels.map((dateStr, i) => {
      const [yyyy, mm] = dateStr.split("-");
      const earliestIdx = earliestIndexForMonth[mm];
      if (earliestIdx === i) {
        // To pierwszy dzień notowany w danym miesiącu
        return MONTH_NAMES[mm] || mm;
      }
      return "";
    });

    // Obliczenie min i max do rysowania własnej osi Y
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    return (
      <View style={styles.chartContainer}>
        {/* Zamrożona oś Y */}
        <View style={styles.yAxis}>
          {Array.from({ length: 6 }, (_, i) => {
            const value = maxValue - (i * (maxValue - minValue)) / 5;
            return (
              <Text key={i} style={styles.yAxisLabel}>
                {value.toFixed(2)}
              </Text>
            );
          })}
        </View>

        {/* Wykres w poziomym ScrollView */}
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <LineChart
            data={{
              labels: xLabels,
              datasets: [{ data: values }],
            }}
            width={Math.max(labels.length * 50, screenWidth)} // Szerokość wykresu
            height={300}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: "#006466",
              backgroundGradientFrom: "#006466",
              backgroundGradientTo: "#4d194d",
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 8,
              },
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: "#ffa726",
              },
            }}
            style={{
              marginVertical: 8,
              borderRadius: 8,
            }}
            withVerticalLabels // Etykiety osi X
            withHorizontalLabels={false} // Wyłączone wbudowane etykiety osi Y
          />
        </ScrollView>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={["#006466", "#4d194d"]}
      style={GlobalStyles.gradientContainer}
    >
      <View style={GlobalStyles.container}>
        <Text style={GlobalStyles.title}>Historia Kursów Walut</Text>

        {/* Picker waluty */}
        <Picker
          selectedValue={selectedCurrency}
          style={GlobalStyles.picker}
          onValueChange={(itemValue) => setSelectedCurrency(itemValue)}
        >
          {rates.map((rate) => (
            <Picker.Item
              key={rate.code}
              label={`${rate.currency} (${rate.code})`}
              value={rate.code}
            />
          ))}
        </Picker>

        {/* Picker roku */}
        <Picker
          selectedValue={selectedYear}
          style={GlobalStyles.picker}
          onValueChange={(itemValue) => setSelectedYear(itemValue)}
        >
          {years.map((year) => (
            <Picker.Item key={year} label={year} value={year} />
          ))}
        </Picker>

        {loading ? (
          <ActivityIndicator size="large" color="#1E90FF" />
        ) : (
          renderChart()
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  yAxis: {
    marginRight: 8,
    justifyContent: "space-between",
    height: 300,
  },
  yAxisLabel: {
    color: "#fff",
    fontSize: 12,
  },
});
