// src/api/api.js
import axios from "axios";

const rawBase =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const baseURL = rawBase.replace(/\/+$/, "");

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 60000,
});

export default api;
