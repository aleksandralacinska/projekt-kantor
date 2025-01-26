import axios from "axios";

export const backendURL = "http://172.31.0.1:8000"; // Tutaj ustaw swój IPv4

export const axiosInstance = axios.create({
  baseURL: backendURL,
  timeout: 10000,
});
