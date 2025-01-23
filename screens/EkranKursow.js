import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function EkranKursow() {
  return (
    <View style={styles.container}>
      <Text>Ekran Kursów Walut</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
