import React from "react";
import { Keyboard, TouchableWithoutFeedback, Platform } from "react-native";

export default function DismissKeyboard({ children }) {
  // W przeglądarce (Platform.OS === 'web') nie wywołujemy Keyboard.dismiss()
  if (Platform.OS === "web") {
    return <>{children}</>;
  }
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      {children}
    </TouchableWithoutFeedback>
  );
}
