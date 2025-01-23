import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function EkranWymiany({ navigation }) {
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState('');

  const handleExchange = () => {
    const exchangeAmount = parseFloat(amount);
    if (isNaN(exchangeAmount) || exchangeAmount <= 0) {
      Alert.alert('Błąd', 'Proszę wprowadzić poprawną kwotę');
      return;
    }

    // Symulacja przeliczenia waluty
    const exchangedValue = (exchangeAmount * 4.50).toFixed(2); // Przykładowy kurs

    Alert.alert(
      'Sukces',
      `Wymieniono ${exchangeAmount.toFixed(2)} PLN na ${exchangedValue} ${currency}`
    );
    // Poprawiona nawigacja
    navigation.navigate('App', { screen: 'Strona Główna' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wymiana Walut</Text>

      <TextInput
        style={styles.input}
        placeholder="Wprowadź kwotę w PLN"
        value={amount}
        onChangeText={(text) => setAmount(text)}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Wybierz walutę:</Text>
      <Picker
        selectedValue={currency}
        style={styles.picker}
        onValueChange={(itemValue) => setCurrency(itemValue)}
      >
        <Picker.Item label="USD (Dolar)" value="USD" />
        <Picker.Item label="EUR (Euro)" value="EUR" />
        <Picker.Item label="GBP (Funt)" value="GBP" />
      </Picker>

      <Button title="Wymień walutę" onPress={handleExchange} />

      <Button title="Powrót" onPress={() => navigation.goBack()} color="gray" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
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
