import React, { useState, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import axios from "axios";
import { backendURL } from "../services/config";
import { UserContext } from "../services/UserContext";

export default function EkranLogowania({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setCurrentUser } = useContext(UserContext);

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${backendURL}/login/`, {
        email,
        password,
      });

      if (response.status === 200) {
        const userData = response.data.user; // Pobieramy dane użytkownika
        console.log("Odpowiedź z backendu:", response.data); // Debug
        console.log("ID użytkownika:", userData.id); // Debug
        setCurrentUser(userData); // Ustawiamy użytkownika w kontekście

        // Przekazujemy userId do Strona Główna
        navigation.navigate("App", { screen: "Strona Główna", params: { userId: userData.id } });
      }
    } catch (error) {
      console.error("Błąd logowania:", error);
      Alert.alert("Błąd", error.response?.data?.detail || "Nie udało się zalogować");
    }
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
