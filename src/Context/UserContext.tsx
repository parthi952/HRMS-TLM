import React, { createContext, useContext, useState, useEffect } from "react";
import { Api_URL } from "../APILINK";

// --- Cookie Helper Functions ---
export const setCookie = (name: string, value: string, days?: number) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + encodeURIComponent(value || "") + expires + "; path=/; SameSite=Strict";
};

export const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
};

export const eraseCookie = (name: string) => {
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict";
};

// --- Formatter Utility ---
const formatEmailToName = (email: string): string => {
  if (!email) return "User Profile";
  const parts = email.split("@")[0].split(/[._-]/);
  return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
};

// --- Types & Interfaces ---
export interface User {
  email: string;
  role: string;
  empId: string;
  name: string;
}

interface UserContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const API_BASE_URL = `${Api_URL}`;

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize Auth State from Cookies
  useEffect(() => {
    const accessToken = getCookie("auth_access_token");
    const email = getCookie("auth_email");
    const role = getCookie("auth_role");
    const empId = getCookie("auth_emp_id");

    if (accessToken && email) {
      const userRole = (role || "").toLowerCase().trim();
      if (userRole === "manager" || userRole === "tl" || userRole === "team_lead" || userRole === "hr" || userRole === "admin") {
        setUser({
          email,
          role: role || "employee",
          empId: empId || "EMP - 001",
          name: formatEmailToName(email),
        });
        setIsAuthenticated(true);
      } else {
        // Not authorized, clear cookies
        eraseCookie("auth_access_token");
        eraseCookie("auth_refresh_token");
        eraseCookie("auth_email");
        eraseCookie("auth_role");
        eraseCookie("auth_emp_id");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/Auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const message = errData.detail || "Invalid email or password";
        throw new Error(message);
      }

      const data = await response.json(); // Schema of Token from backend
      
      const userRole = (data.role || "").toLowerCase().trim();
      if (userRole !== "manager" && userRole !== "tl" && userRole !== "team_lead" && userRole !== "hr" && userRole !== "admin") {
        throw new Error("Access denied. Only Team Leads, Managers, and HR/Admin are allowed to log in to this portal.");
      }

      // Store in cookies (valid for 1 day)
      setCookie("auth_access_token", data.access_token, 1);
      setCookie("auth_refresh_token", data.refresh_token, 1);
      setCookie("auth_email", data.email, 1);
      setCookie("auth_role", data.role, 1);
      setCookie("auth_emp_id", data.emp_id || "", 1);

      setUser({
        email: data.email,
        role: data.role || "employee",
        empId: data.emp_id || "EMP - 001",
        name: formatEmailToName(data.email),
      });
      setIsAuthenticated(true);
      return true;
    } catch (err: any) {
      console.error("Login API Error:", err);
      throw err;
    }
  };

  const logout = () => {
    eraseCookie("auth_access_token");
    eraseCookie("auth_refresh_token");
    eraseCookie("auth_email");
    eraseCookie("auth_role");
    eraseCookie("auth_emp_id");
    
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <UserContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
