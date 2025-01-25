import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, Keyboard, TouchableWithoutFeedback } from "react-native";
import { axiosInstance } from "../services/config";
import GlobalStyles from "../styles/GlobalStyles";

export default function EkranRejestracji({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !name || !surname) {
      Alert.alert("Błąd", "Proszę wypełnić wszystkie pola");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Błąd", "Hasła nie są zgodne");
      return;
    }

    try {
      const response = await axiosInstance.post("/register/", {
        email,
        password,
        name,
        surname,
      });

      if (response.status === 200) {
        Alert.alert("Sukces", "Konto zostało zarejestrowane");
        navigation.navigate("EkranLogowania");
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data) {
        Alert.alert("Błąd", error.response.data.detail || "Wystąpił problem");
      } else if (error.code === "ECONNABORTED") {
        Alert.alert(
          "Błąd",
          "Czas oczekiwania na odpowiedź serwera został przekroczony."
        );
      } else {
        Alert.alert("Błąd", "Nie udało się zarejestrować konta");
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={GlobalStyles.container}>
        <Text style={GlobalStyles.title}>Rejestracja</Text>

        <TextInput
          style={GlobalStyles.input}
          placeholder="Imię"
          value={name}
          onChangeText={(text) => setName(text)}
        />

        <TextInput
          style={GlobalStyles.input}
          placeholder="Nazwisko"
          value={surname}
          onChangeText={(text) => setSurname(text)}
        />

        <TextInput
          style={GlobalStyles.input}
          placeholder="E-mail"
          value={email}
          onChangeText={(text) => setEmail(text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={GlobalStyles.input}
          placeholder="Hasło"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry
        />

        <TextInput
          style={GlobalStyles.input}
          placeholder="Potwierdź hasło"
          value={confirmPassword}
          onChangeText={(text) => setConfirmPassword(text)}
          secureTextEntry
        />

        <Button title="Zarejestruj się" onPress={handleRegister} />

        <Button title="Powrót" onPress={() => navigation.goBack()} color="gray" />
      </View>
    </TouchableWithoutFeedback>
  );
}
