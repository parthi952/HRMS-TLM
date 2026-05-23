import React, { createContext, useContext, useState, useEffect } from "react";
import { themePresets, type ThemePreset } from "./Themes/PageThemes/PageThemes";

interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
  clockedIn: boolean;
  setClockedIn: (status: boolean) => void;
  clockTime: string | null;
  setClockTime: (time: string | null) => void;
  currentPreset: ThemePreset;
  changeThemePreset: (presetId: string) => void;
  presets: ThemePreset[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark" || saved === "light" ? saved : "light";
  });

  const [currentPreset, setCurrentPreset] = useState<ThemePreset>(() => {
    const savedId = localStorage.getItem("themePresetId") || "classic-blue";
    return themePresets.find((p) => p.id === savedId) || themePresets[0];
  });

  const [clockedIn, setClockedInState] = useState<boolean>(() => {
    return localStorage.getItem("clockedIn") === "true";
  });

  const [clockTime, setClockTimeState] = useState<string | null>(() => {
    return localStorage.getItem("clockTime");
  });

  // Effect to apply theme preset (light/dark or custom colors) on document root
  useEffect(() => {
    localStorage.setItem("theme", theme);
    localStorage.setItem("themePresetId", currentPreset.id);

    const root = window.document.documentElement;

    // Apply basic dark/light class
    if (theme === "dark" || currentPreset.id === "midnight-obsidian") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Dynamic HSL injection for full theme customization!
    root.style.setProperty("--primary-hsl", currentPreset.primaryColor);
    root.style.setProperty("--bg-hsl", currentPreset.bgColor);
    root.style.setProperty("--text-hsl", currentPreset.textColor);
    root.style.setProperty("--card-hsl", currentPreset.cardColor);
    root.style.setProperty("--card-border-hsl", currentPreset.cardBorderColor);
    root.style.setProperty("--muted-hsl", currentPreset.mutedColor);

    // Apply primary hex code directly for custom CSS style items
    root.style.setProperty("--primary-color", currentPreset.primaryHex);
    root.style.setProperty("--accent", currentPreset.primaryHex);

  }, [theme, currentPreset]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const changeThemePreset = (presetId: string) => {
    const found = themePresets.find((p) => p.id === presetId);
    if (found) {
      setCurrentPreset(found);
    }
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
        currentPreset,
        changeThemePreset,
        presets: themePresets,
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
