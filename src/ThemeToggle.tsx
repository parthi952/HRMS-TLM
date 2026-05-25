import { useState } from "react";
import { useTheme } from "./ThemeContext";
import { Palette, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const THEMES = [
  {
    name: "Slate",
    primary: "215 20% 65%",
    bg: "215 20% 98%",
    text: "215 25% 18%",
    card: "215 25% 100%",
    cardBorder: "215 20% 90%",
    muted: "215 16% 47%",
  },

  {
    name: "Gray",
    primary: "220 9% 46%",
    bg: "220 14% 96%",
    text: "220 15% 20%",
    card: "0 0% 100%",
    cardBorder: "220 13% 91%",
    muted: "220 9% 46%",
  },

  {
    name: "Zinc",
    primary: "240 5% 50%",
    bg: "240 5% 96%",
    text: "240 10% 18%",
    card: "0 0% 100%",
    cardBorder: "240 6% 90%",
    muted: "240 4% 46%",
  },

  {
    name: "Stone",
    primary: "25 5% 45%",
    bg: "25 10% 97%",
    text: "25 15% 18%",
    card: "0 0% 100%",
    cardBorder: "25 10% 90%",
    muted: "25 5% 45%",
  },

  {
    name: "Red",
    primary: "0 84% 60%",
    bg: "0 100% 98%",
    text: "0 70% 20%",
    card: "0 100% 100%",
    cardBorder: "0 70% 90%",
    muted: "0 40% 50%",
  },

  {
    name: "Orange",
    primary: "24 95% 53%",
    bg: "24 100% 97%",
    text: "24 80% 18%",
    card: "0 0% 100%",
    cardBorder: "24 80% 90%",
    muted: "24 40% 50%",
  },

  {
    name: "Amber",
    primary: "38 92% 50%",
    bg: "48 100% 96%",
    text: "38 80% 18%",
    card: "0 0% 100%",
    cardBorder: "38 80% 90%",
    muted: "38 45% 50%",
  },

  {
    name: "Yellow",
    primary: "48 96% 53%",
    bg: "55 100% 96%",
    text: "48 85% 18%",
    card: "0 0% 100%",
    cardBorder: "48 80% 90%",
    muted: "48 40% 50%",
  },

  {
    name: "Lime",
    primary: "84 81% 44%",
    bg: "84 100% 96%",
    text: "84 70% 18%",
    card: "0 0% 100%",
    cardBorder: "84 60% 88%",
    muted: "84 35% 45%",
  },

  {
    name: "Green",
    primary: "142 71% 45%",
    bg: "142 76% 97%",
    text: "142 70% 18%",
    card: "0 0% 100%",
    cardBorder: "142 60% 88%",
    muted: "142 35% 45%",
  },

  {
    name: "Emerald",
    primary: "160 84% 39%",
    bg: "152 81% 96%",
    text: "160 70% 18%",
    card: "0 0% 100%",
    cardBorder: "160 60% 88%",
    muted: "160 35% 45%",
  },

  {
    name: "Teal",
    primary: "173 80% 40%",
    bg: "173 80% 97%",
    text: "173 70% 18%",
    card: "0 0% 100%",
    cardBorder: "173 55% 88%",
    muted: "173 35% 45%",
  },

  {
    name: "Cyan",
    primary: "189 94% 43%",
    bg: "189 100% 97%",
    text: "189 80% 18%",
    card: "0 0% 100%",
    cardBorder: "189 60% 88%",
    muted: "189 35% 45%",
  },

  {
    name: "Sky",
    primary: "199 89% 48%",
    bg: "199 100% 97%",
    text: "199 80% 20%",
    card: "0 0% 100%",
    cardBorder: "199 60% 88%",
    muted: "199 35% 45%",
  },

  {
    name: "Blue",
    primary: "221 83% 53%",
    bg: "214 100% 97%",
    text: "221 70% 20%",
    card: "0 0% 100%",
    cardBorder: "221 60% 88%",
    muted: "221 35% 45%",
  },

  {
    name: "Indigo",
    primary: "239 84% 67%",
    bg: "239 100% 98%",
    text: "239 60% 20%",
    card: "0 0% 100%",
    cardBorder: "239 60% 88%",
    muted: "239 35% 45%",
  },

  {
    name: "Violet",
    primary: "262 83% 58%",
    bg: "262 100% 98%",
    text: "262 70% 20%",
    card: "0 0% 100%",
    cardBorder: "262 60% 88%",
    muted: "262 35% 45%",
  },

  {
    name: "Purple",
    primary: "271 91% 65%",
    bg: "271 100% 98%",
    text: "271 70% 20%",
    card: "0 0% 100%",
    cardBorder: "271 60% 88%",
    muted: "271 35% 45%",
  },

  {
    name: "Fuchsia",
    primary: "292 84% 61%",
    bg: "292 100% 98%",
    text: "292 70% 20%",
    card: "0 0% 100%",
    cardBorder: "292 60% 88%",
    muted: "292 35% 45%",
  },

  {
    name: "Pink",
    primary: "330 81% 60%",
    bg: "330 100% 98%",
    text: "330 70% 20%",
    card: "0 100% 100%",
    cardBorder: "330 60% 88%",
    muted: "330 35% 45%",
  },

  {
    name: "Rose",
    primary: "346 84% 61%",
    bg: "346 100% 98%",
    text: "346 70% 20%",
    card: "0 0% 100%",
    cardBorder: "346 60% 88%",
    muted: "346 35% 45%",
  },
];
export const ThemeToggle = () => {
  const { currentPreset, changeThemePreset } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentTheme = THEMES.find(t => t.name === currentPreset.id) || THEMES[0];

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 bg-white border border-slate-200 pl-3 pr-2 py-1.5 rounded-xl shadow-sm hover:border-primary/50 transition-all active:scale-95 group"
      >
        <div
          className="w-4 h-4 rounded-full shadow-inner"
          style={{ backgroundColor: currentPreset.primaryHex }}
        />
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          {currentTheme.name}
        </span>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for closing */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 origin-top-right"
            >
              <div className="px-3 py-2 border-b border-slate-50 mb-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Palette size={10} />
                  Select Theme
                </p>
              </div>

              <div className="space-y-0.5">
                {THEMES.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => {
                      changeThemePreset(t.name.toLowerCase());
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl transition-all group ${currentPreset.id === t.name.toLowerCase()
                        ? "bg-primary/5 text-primary"
                        : "hover:bg-slate-50 text-slate-600"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: `hsl(${t.primary})` }}
                      />
                      <span className="text-[12px] font-bold">{t.name}</span>
                    </div>
                    {currentPreset.id === t.name.toLowerCase() && (
                      <Check size={14} className="text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
