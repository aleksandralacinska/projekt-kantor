import React, { useState, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { UserContext } from "../services/UserContext";

export default function EkranLogowania({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { users } = useContext(UserContext);

  const handleLogin = () => {
    if (!users || users.length === 0) {
      Alert.alert("Błąd", "Brak zarejestrowanych użytkowników");
      return;
    }

    const user = users.find((user) => user.email === email && user.password === password);
    if (!user) {
      Alert.alert("Błąd", "Nieprawidłowy e-mail lub hasło");
      return;
    }

    Alert.alert("Sukces", "Zalogowano pomyślnie");
    navigation.navigate("App", { screen: "Strona Główna" });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logowanie</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Hasło"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
      />

      <Button title="Zaloguj się" onPress={handleLogin} />

      <Text style={styles.registerText}>
        Nie masz konta?{" "}
        <Text
          style={styles.registerLink}
          onPress={() => navigation.navigate("EkranRejestracji")}
        >
          Zarejestruj się
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  registerText: {
    marginTop: 16,
    textAlign: "center",
    color: "#666",
  },
  registerLink: {
    color: "#1E90FF",
    fontWeight: "bold",
  },
});
