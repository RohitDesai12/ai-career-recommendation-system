import * as React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { API_BASE_URL, getApiUrl } from "../config/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Enable sending cookies with cross-site requests if same-site or CORS credentials allowed
axios.defaults.withCredentials = true;

// Configure axios global interceptor immediately on module evaluation
axios.interceptors.request.use(
  (config) => {
    // Dynamically remap hardcoded localhost:5000 to API_BASE_URL
    if (config.url && config.url.startsWith("http://localhost:5000")) {
      config.url = config.url.replace("http://localhost:5000", API_BASE_URL);
    } else if (config.url && config.url.startsWith("http://127.0.0.1:5000")) {
      config.url = config.url.replace("http://127.0.0.1:5000", API_BASE_URL);
    }

    const token = localStorage.getItem("token");
    if (token) {
      config.headers["x-auth-token"] = token;
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch expired / invalid tokens
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const msg = error.response?.data?.msg || "";
      if (msg === "Token is not valid" || msg === "No token, authorization denied") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete axios.defaults.headers.common["x-auth-token"];
        // Dispatch custom event for auth listeners
        window.dispatchEvent(new Event("auth-session-expired"));
      }
    }
    return Promise.reject(error);
  }
);

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
    };
    window.addEventListener("auth-session-expired", handleSessionExpired);
    return () => window.removeEventListener("auth-session-expired", handleSessionExpired);
  }, []);

  useEffect(() => {
    // Check for saved token on mount
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        axios.defaults.headers.common["x-auth-token"] = token;

        // Verify token with backend
        axios.get(getApiUrl("/api/auth/me"), {
          headers: { "x-auth-token": token }
        }).then((res) => {
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem("user", JSON.stringify(res.data.user));
          }
        }).catch((err) => {
          if (err.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            delete axios.defaults.headers.common["x-auth-token"];
            setUser(null);
          }
        });
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    axios.defaults.headers.common["x-auth-token"] = token;
    setUser(userData);
  };

  const logout = () => {
    // Notify server to clear HTTP-only auth cookies
    axios.post(getApiUrl("/api/auth/logout")).catch(() => {});

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("student_applied_jobs");
    localStorage.removeItem("student_saved_jobs");
    if (user?.id) {
      localStorage.removeItem(`student_applied_jobs_${user.id}`);
      localStorage.removeItem(`student_saved_jobs_${user.id}`);
    }
    if (user?.email) {
      localStorage.removeItem(`student_applied_jobs_${user.email}`);
      localStorage.removeItem(`student_saved_jobs_${user.email}`);
    }
    delete axios.defaults.headers.common["x-auth-token"];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
