import axios from "axios";
import { backendURL } from "./config";

export async function fetchUserBalance(userId) {
  try {
    const response = await axios.get(`${backendURL}/balance/`, {
      params: { user_id: userId }, // Przekazujemy user_id jako parametr GET
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Błąd podczas pobierania salda");
  }
}
