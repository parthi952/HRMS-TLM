import React, { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
  clockedIn: boolean;
  setClockedIn: (status: boolean) => void;
  clockTime: string | null;
  setClockTime: (time: string | null) => void;
  userName: string;
  empId: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark" || saved === "light" ? saved : "light";
  });

  const [clockedIn, setClockedInState] = useState<boolean>(() => {
    return localStorage.getItem("clockedIn") === "true";
  });

  const [clockTime, setClockTimeState] = useState<string | null>(() => {
    return localStorage.getItem("clockTime");
  });

  const userName = "Ravi Mohan";
  const empId = "EMP - 001";

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setClockedIn = (status: boolean) => {
    setClockedInState(status);
    localStorage.setItem("clockedIn", String(status));
  };

  const setClockTime = (time: string | null) => {
    setClockTimeState(time);
    if (time) {
      localStorage.setItem("clockTime", time);
    } else {
      localStorage.removeItem("clockTime");
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        clockedIn,
        setClockedIn,
        clockTime,
        setClockTime,
        userName,
        empId,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
