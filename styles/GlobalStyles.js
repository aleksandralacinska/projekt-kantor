import { StyleSheet } from "react-native";

export default StyleSheet.create({
  // Bazowy kontener do większości ekranów
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },

  // Duży tytuł używany na wielu ekranach
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    fontFamily: "MontserratBold",
  },

  // Uniwersalne pole tekstowe
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
    fontFamily: "Montserrat",
  },

  // Styl dla etykiet tekstowych w formularzach
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: "Montserrat",
  },

  // Picker (np. do wyboru waluty)
  picker: {
    height: 50,
    marginBottom: 16,
  },

  // EkranGlowny – style dla listy sald
  balanceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  currency: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "MontserratBold",
  },
  balance: {
    fontSize: 18,
    color: "#555",
    fontFamily: "Montserrat",
  },

  // EkranKursow – style dla listy kursów walut
  rateItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  rate: {
    fontSize: 18,
    color: "#555",
  },

  // EkranLogowania – styl do tekstu rejestracyjnego/odnośnika
  registerText: {
    marginTop: 16,
    textAlign: "center",
    color: "#666",
    fontFamily: "Montserrat",
  },
  registerLink: {
    color: "#1E90FF",
    fontWeight: "bold",
    fontFamily: "MontserratBold",
  },
});
