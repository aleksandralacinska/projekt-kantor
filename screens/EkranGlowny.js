import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export default function EkranGlowny() {
  const [balances, setBalances] = useState({
    PLN: 1000,
    USD: 250,
    EUR: 300,
  });

  const renderBalanceItem = ({ item }) => {
    const [currency, balance] = item;
    return (
      <View style={styles.balanceItem}>
        <Text style={styles.currency}>{currency}</Text>
        <Text style={styles.balance}>{balance.toFixed(2)} {currency}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stan konta użytkownika</Text>

      <FlatList
        data={Object.entries(balances)}
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
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  currency: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  balance: {
    fontSize: 18,
    color: '#555',
  },
});
