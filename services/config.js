import axios from "axios";

export const backendURL = "http://192.168.1.15:8000"; // Tutaj ustaw swój IPv4

export const axiosInstance = axios.create({
  baseURL: backendURL,
  timeout: 10000,
});
