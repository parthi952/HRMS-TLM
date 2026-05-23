import { useState } from "react";
import { NavLink} from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  employeeNavigation,
} from "./PanalSidebar";
import { useUser } from "../Context/UserContext";
import { useUserData } from "../Context/UserData";

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useUser();
  const { employeeData } = useUserData();

  const userName = employeeData?.profile?.name || user?.name || "Ravi Mohan";
  const empId = employeeData?.profile?.Emp_id || user?.empId || "EMP - 001";
  const userInitials = userName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "RM";

  const currentNav = employeeNavigation;

  return (
    <aside
      className={`h-full bg-white border-r border-slate-200 flex flex-col relative overflow-hidden
      transition-all duration-300 ease-in-out
      ${isCollapsed ? "w-16" : "w-56"}`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-2.5 top-6 bg-white border border-slate-200 rounded-full p-1 shadow-sm hover:bg-primary/5 hover:text-primary transition-all z-20"
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Logo */}
      <div className="h-14 flex items-center px-4 mb-2">
        <div className="w-7 h-7 bg-primary rounded flex items-center justify-center text-white text-xs font-bold">
          G
        </div>
        {!isCollapsed && (
          <span className="ml-2.5 font-semibold text-sm text-slate-800">
            <span className="text-primary tracking-tight">HRMS</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1 overflow-y-auto no-scrollbar">
        {currentNav.map((item) => {
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                `flex items-center group relative h-10 rounded-xl transition-all duration-200
    ${isActive
                  ? "bg-primary/10 text-primary"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }
    ${isCollapsed ? "justify-center" : "px-3"}`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active Indicator Line */}
                  {isActive && !isCollapsed && (
                    <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full" />
                  )}

                  <item.icon
                    size={18}
                    className={
                      isActive
                        ? "text-primary"
                        : "text-slate-400 group-hover:text-slate-600"
                    }
                  />

                  {!isCollapsed && (
                    <span className="ml-3 text-xs font-medium">
                      {item.label}
                    </span>
                  )}

                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-slate-50 bg-slate-50/30">
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2"}`}
        >
          <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] text-primary font-black tracking-wider">
            {userInitials}
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-gray-700 truncate">
                {userName}
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                {empId}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
