import { Bell, Settings, HelpCircle, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { useUser } from "../Context/UserContext";
import { useUserData } from "../Context/UserData";

export const Navbar = () => {
  const { currentPreset, changeThemePreset, presets } = useTheme();
  const { logout, user } = useUser();
  const { employeeData } = useUserData();

  const displayName = employeeData?.profile?.name || user?.name || "Admin User";
  const userInitials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "AU";

  return (
    <nav className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6">
      {/* Left Section: Contextual Title */}
      <div className="flex items-center gap-4">
        <div className="text-[13px] font-bold text-slate-700 tracking-tight flex items-center gap-2.5">
          <Link to="/" className="hover:opacity-85 transition-opacity flex items-center shrink-0">
            <img src="/tibos logo.png" alt="Tibos Logo" className="h-30 w-auto object-contain" />
          </Link> 
          <span className="text-slate-200 font-normal">/</span> 
          <span className="text-slate-400 font-semibold tracking-wider text-[11px] uppercase">Manager / TEAM Lead Hub</span>
        </div>
      </div>

      {/* Right Section: Actions & Profile */}
      <div className="flex items-center gap-4">

        {/* Global Theme Preset Picker */}
        <div className="flex items-center gap-1.5 border-r border-gray-100 pr-3 mr-1">
          {presets.map((preset) => (
            <button
              key={preset.id}
              title={preset.name}
              onClick={() => changeThemePreset(preset.id)}
              className={`w-4 h-4 rounded-full border transition-all flex items-center justify-center cursor-pointer ${
                currentPreset.id === preset.id
                  ? "border-slate-800 scale-110 shadow-sm animate-pulse"
                  : "border-transparent hover:scale-110"
              }`}
              style={{ backgroundColor: preset.primaryHex }}
            >
              {currentPreset.id === preset.id && (
                <Check size={8} className="text-white font-black" />
              )}
            </button>
          ))}
        </div>

        {/* Utility Icons */}
        <div className="flex items-center gap-1 border-r border-gray-100 pr-3 mr-1">
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <HelpCircle size={18} />
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <Settings size={18} />
          </button>
        </div>

        {/* User Profile Dropdown Toggle */}
        <button 
          onClick={() => {
            if (confirm("Are you sure you want to sign out?")) {
              logout();
            }
          }}
          className="flex items-center gap-2.5 pl-2 hover:bg-slate-50 p-1.5 rounded-xl transition-all border border-transparent hover:border-slate-100 group cursor-pointer"
        >
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-slate-700 leading-tight">{displayName}</span>
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{user?.role || "Online"}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform text-xs font-black tracking-wider">
            {userInitials}
          </div>
        </button>
      </div>
    </nav>
  );
};