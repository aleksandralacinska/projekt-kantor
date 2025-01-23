import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

export default function EkranWplaty({ navigation }) {
  const [amount, setAmount] = useState('');

  const handleDeposit = () => {
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      Alert.alert('Błąd', 'Proszę wprowadzić poprawną kwotę');
      return;
    }

    Alert.alert('Sukces', `Twoje konto zostało zasilone o ${depositAmount.toFixed(2)} PLN`);
    // Poprawiona nawigacja
    navigation.navigate('App', { screen: 'Strona Główna' });
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
});
