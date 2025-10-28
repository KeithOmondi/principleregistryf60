// src/api/api.jsx
import axios from "axios";

// ✅ Create a reusable Axios instance
const api = axios.create({
  baseURL: "https://principle-registry.onrender.com/api/v1", // change to your backend URL
  withCredentials: true, // send cookies with every request
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Optional: Add request interceptor (attach token if needed)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // adjust based on your auth system
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Optional: Add response interceptor (handle common errors globally)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can handle common errors here, like 401 Unauthorized
    if (error.response?.status === 401) {
      console.warn("Unauthorized – logging out...");
      localStorage.removeItem("token");
      // Optionally redirect to login
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
