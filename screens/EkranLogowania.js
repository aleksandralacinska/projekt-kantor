import React, { useState, useContext } from "react";
import { View, Text, TextInput, Button, Alert, Keyboard, TouchableWithoutFeedback } from "react-native";
import axios from "axios";
import { backendURL } from "../services/config";
import { UserContext } from "../services/UserContext";
import GlobalStyles from "../styles/GlobalStyles";


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
        const userData = response.data.user;
        console.log("Odpowiedź z backendu:", response.data);
        console.log("Przekazywane userId:", userData.id);

        setCurrentUser(userData);
        navigation.navigate("App", {
          userId: userData.id,
        });
      }
    } catch (error) {
      console.error("Błąd logowania:", error);
      Alert.alert(
        "Błąd",
        error.response?.data?.detail || "Nie udało się zalogować"
      );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={GlobalStyles.container}>
        <Text style={GlobalStyles.title}>Logowanie</Text>

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

        <Button title="Zaloguj się" onPress={handleLogin} />

        <Text style={GlobalStyles.registerText}>
          Nie masz konta?{" "}
          <Text
            style={GlobalStyles.registerLink}
            onPress={() => navigation.navigate("EkranRejestracji")}
          >
            Zarejestruj się
          </Text>
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
}
