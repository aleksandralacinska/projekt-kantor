import axios from "axios";

export const backendURL = "http://172.31.0.1:8000"; // Ustaw swój IPv4

export const axiosInstance = axios.create({
  baseURL: backendURL,
  timeout: 10000, // Czas w milisekundach (10 sekund)
});
