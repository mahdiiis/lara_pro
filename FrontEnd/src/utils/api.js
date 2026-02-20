import axios from "axios";

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: true, // Important for cookies/CSRF
});

// Function to get CSRF cookie before making authenticated requests
const getCsrfToken = async () => {
  try {
    await axios.get("http://localhost:8000/sanctum/csrf-cookie", {
      withCredentials: true,
    });
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    throw error;
  }
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Check both localStorage and sessionStorage for token
    const localToken = localStorage.getItem("token");
    const sessionToken = sessionStorage.getItem("token");
    const token = localToken || sessionToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Export the api instance and helper functions
export { api, getCsrfToken };

// Authentication utilities
export const authApi = {
  login: async (credentials) => {
    await getCsrfToken();
    return api.post("/login", credentials);
  },

  register: async (userData) => {
    await getCsrfToken();
    return api.post("/register", userData);
  },

  logout: async () => {
    return api.post("/logout");
  },

  getUser: async () => {
    return api.get("/user");
  },
  
  forgotPassword: async (email) => {
    await getCsrfToken();
    console.log("Calling forgotPassword API with email:", email);
    
    try {
      // Print out the full URL being used
      console.log("API URL for forgot password:", `${import.meta.env.VITE_API_URL}/forgot-password`);
      
      // Make the request with detailed error handling
      return await api.post("/forgot-password", { email });
    } catch (error) {
      console.error("Error in forgotPassword API call:", error);
      console.error("Error response:", error.response?.data);
      throw error; // Re-throw so the component can handle it
    }
  },
  
  resetPassword: async (data) => {
    await getCsrfToken();
    return api.post("/reset-password", data);
  },
};

export default api;
