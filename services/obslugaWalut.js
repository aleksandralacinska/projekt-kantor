import { backendURL } from "./config";
import axios from "axios";

export async function exchangeCurrency(targetCurrency, amount) {
  try {
    const response = await axios.post(`${backendURL}/exchange`, {
      target_currency: targetCurrency,
      amount: amount,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Błąd podczas wymiany walut");
  }
}
