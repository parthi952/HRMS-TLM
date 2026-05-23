export interface ThemePreset {
  id: string;
  name: string;
  primaryColor: string;
  bgColor: string;
  textColor: string;
  cardColor: string;
  cardBorderColor: string;
  mutedColor: string;
  primaryHex: string;
  bannerGradient: string;
  profileBg: string;
  sidebarBg: string;
  titleFont: string;
}

export const themePresets: ThemePreset[] = [
  {
    id: "classic-blue",
    name: "Classic Blue",
    primaryColor: "221.2 83.2% 53.3%",
    bgColor: "210 40% 95.5%",
    textColor: "222.2 47.4% 11.2%",
    cardColor: "0 0% 100%",
    cardBorderColor: "214.3 31.8% 86%",
    mutedColor: "215.4 16.3% 46.9%",
    primaryHex: "#2563eb",
    bannerGradient: "from-blue-500 via-indigo-500 to-indigo-700",
    profileBg: "rgba(224, 231, 255, 0.9)",
    sidebarBg: "rgba(203, 213, 225, 0.95)",
    titleFont: "Poppins, sans-serif"
  },
  {
    id: "emerald-mint",
    name: "Emerald Mint",
    primaryColor: "142.1 76.2% 36.3%",
    bgColor: "138 30% 95.5%",
    textColor: "143.8 61.2% 11.8%",
    cardColor: "0 0% 100%",
    cardBorderColor: "142.1 30% 86%",
    mutedColor: "142.4 14.1% 43.1%",
    primaryHex: "#16a34a",
    bannerGradient: "from-emerald-500 via-teal-500 to-teal-700",
    profileBg: "rgba(220, 252, 231, 0.9)",
    sidebarBg: "rgba(200, 230, 210, 0.95)",
    titleFont: "Outfit, sans-serif"
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    primaryColor: "262.1 83.3% 57.8%",
    bgColor: "260 25% 95.5%",
    textColor: "263.4 70% 12.2%",
    cardColor: "0 0% 100%",
    cardBorderColor: "262.2 20% 86%",
    mutedColor: "262.1 12.5% 48.2%",
    primaryHex: "#7c3aed",
    bannerGradient: "from-purple-500 via-violet-500 to-violet-700",
    profileBg: "rgba(243, 232, 255, 0.9)",
    sidebarBg: "rgba(220, 210, 235, 0.95)",
    titleFont: "Cinzel, serif"
  },
  {
    id: "sunset-amber",
    name: "Sunset Amber",
    primaryColor: "24.6 95% 53.1%",
    bgColor: "30 35% 95.5%",
    textColor: "22.4 80% 12.5%",
    cardColor: "0 0% 100%",
    cardBorderColor: "28 30% 86%",
    mutedColor: "25 15% 48%",
    primaryHex: "#ea580c",
    bannerGradient: "from-amber-400 via-orange-500 to-orange-700",
    profileBg: "rgba(255, 237, 213, 0.9)",
    sidebarBg: "rgba(235, 215, 195, 0.95)",
    titleFont: "Space Grotesk, sans-serif"
  },
  {
    id: "ocean-teal",
    name: "Ocean Teal",
    primaryColor: "174.7 83.9% 37.8%",
    bgColor: "180 25% 95.5%",
    textColor: "180 60% 12%",
    cardColor: "0 0% 100%",
    cardBorderColor: "180 20% 86%",
    mutedColor: "174.7 15% 45%",
    primaryHex: "#0d9488",
    bannerGradient: "from-teal-500 via-cyan-500 to-cyan-700",
    profileBg: "rgba(204, 251, 241, 0.9)",
    sidebarBg: "rgba(185, 225, 220, 0.95)",
    titleFont: "Montserrat, sans-serif"
  }
];
