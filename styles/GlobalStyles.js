import { StyleSheet, Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width; // Pobieramy szerokość ekranu

export default StyleSheet.create({
  // Gradientowe tło
  gradientContainer: {
    flex: 1,
  },

  // Bazowy kontener do większości ekranów
  container: {
    flex: 1,
    padding: 16,
  },

  // Duży tytuł używany na górze ekranu
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    fontFamily: "MontserratBold",
    color: "#ffffff",
  },

  // Uniwersalne pole tekstowe input
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
    fontFamily: "Montserrat",
    backgroundColor: "#ffffff",
    color: "#000000",
  },

  // Styl dla etykiet tekstowych w formularzach
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: "Montserrat",
    color: "#ffffff",
  },

  // Picker (np. do wyboru waluty)
  picker: {
    height: 50,
    marginBottom: 16,
  },

  // Przyciski
  button: {
    backgroundColor: "#1E90FF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    width: screenWidth * 0.6,
    alignSelf: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "MontserratBold",
  },

  backButton: {
    backgroundColor: "transparent",
    borderColor: "#ffffff",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    width: screenWidth * 0.6,
    alignSelf: "center",
    marginVertical: 8,
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "MontserratBold",
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
    color: "#ffffff",
  },
  balance: {
    fontSize: 18,
    color: "#ffffff",
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
    color: "#ffffff",
    fontFamily: "Montserrat",
  },

  // EkranLogowania – styl do tekstu rejestracyjnego/odnośnika
  registerText: {
    marginTop: 16,
    textAlign: "center",
    color: "#cccccc",
    fontFamily: "Montserrat",
  },
  registerLink: {
    color: "#00d4ff",
    fontWeight: "bold",
    fontFamily: "MontserratBold",
  },
});
