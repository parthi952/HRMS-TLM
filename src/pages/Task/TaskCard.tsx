import React, { useState } from "react";
import { Calendar, User, ChevronDown, Loader2, Award, Users } from "lucide-react";
import { getCookie } from "../../Context/UserContext";
import { Api_URL } from "../../APILINK";

interface AssignedTask {
  id?: number;
  ID?: number;
  Emp_id?: string;
  Department?: string;
  Task_Name: string;
  Task_Description: string;
  Start_Date: string;
  End_Date: string;
  Priority: string;
  Status: string;
  Assigned_By: string;
  Employee_Name?: string;
}

interface TaskCardProps {
  task: AssignedTask;
  primaryHex: string;
  currentUserEmpId?: string;
  onStatusUpdate?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  primaryHex,
  currentUserEmpId,
  onStatusUpdate,
}) => {
  const taskId = task.id || task.ID;
  const [updating, setUpdating] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Status visual configurations
  const statusConfig: { [key: string]: { bg: string; text: string; dot: string } } = {
    Completed: {
      bg: "bg-emerald-50 border-emerald-100/80",
      text: "text-emerald-600",
      dot: "bg-emerald-500",
    },
    "In Progress": {
      bg: "bg-sky-50 border-sky-100/80",
      text: "text-sky-650",
      dot: "bg-sky-500",
    },
    Pending: {
      bg: "bg-amber-50 border-amber-100/80",
      text: "text-amber-600",
      dot: "bg-amber-500",
    },
  };

  const currentStatus = task.Status || "Pending";
  const { bg = "bg-slate-50", text = "text-slate-500", dot = "bg-slate-400" } =
    statusConfig[currentStatus] || {};

  // Priority color sets
  const priorityConfig: { [key: string]: { bg: string; border: string; text: string } } = {
    High: { bg: "bg-red-50", border: "border-red-100", text: "text-red-500" },
    Medium: { bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-500" },
    Low: { bg: "bg-slate-50", border: "border-slate-100", text: "text-slate-400" },
  };
  const { bg: pBg = "bg-slate-50", border: pBorder = "border-slate-100", text: pText = "text-slate-400" } =
    priorityConfig[task.Priority] || {};

  const handleUpdateStatus = async (newStatus: string) => {
    if (newStatus === currentStatus) {
      setDropdownOpen(false);
      return;
    }

    setUpdating(true);
    setDropdownOpen(false);
    try {
      const token = getCookie("auth_access_token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch(`${Api_URL}/daily-tasks/task/${taskId}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ Status: newStatus }),
      });

      if (res.ok) {
        if (onStatusUpdate) {
          onStatusUpdate();
        }
      } else {
        console.error("Failed to update status");
      }
    } catch (e) {
      console.error("Error updating status:", e);
    } finally {
      setUpdating(false);
    }
  };

  // Determine if this task is assigned to the current employee
  const isAssignedToMe = task.Emp_id === currentUserEmpId;

  return (
    <div
      className="group relative bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md hover:border-slate-200/80 transition-all duration-300 flex flex-col justify-between gap-5 overflow-visible"
    >
      {/* Decorative vertical bar representing priority */}
      <div
        className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-md transition-all duration-300 group-hover:scale-y-110 ${
          task.Priority === "High"
            ? "bg-red-400"
            : task.Priority === "Medium"
            ? "bg-blue-400"
            : "bg-slate-300"
        }`}
      />

      <div className="space-y-3 min-w-0">
        {/* Title, Priority, Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <h4 className="text-[13px] font-black text-slate-800 tracking-tight leading-snug break-words">
              {task.Task_Name}
            </h4>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Priority badge */}
              <span
                className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-widest border ${pBg} ${pBorder} ${pText}`}
              >
                {task.Priority} Priority
              </span>

              {/* Assignment category badge */}
              {task.Department ? (
                <span className="bg-purple-50 border border-purple-100 text-purple-650 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-widest flex items-center gap-1">
                  <Users size={8} /> Dept Goal
                </span>
              ) : (
                <span className="bg-slate-50 border border-slate-100 text-slate-550 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-widest flex items-center gap-1">
                  <User size={8} /> Individual
                </span>
              )}

              {/* Context indicator */}
              {isAssignedToMe && (
                <span
                  className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-widest border"
                  style={{
                    color: primaryHex,
                    borderColor: `${primaryHex}30`,
                    backgroundColor: `${primaryHex}10`,
                  }}
                >
                  My Task
                </span>
              )}
            </div>
          </div>

          {/* Interactive Status Dropdown Selector */}
          <div className="relative shrink-0 overflow-visible">
            <button
              onClick={() => !updating && setDropdownOpen(!dropdownOpen)}
              disabled={updating}
              className={`px-3 py-1.5 rounded-xl text-[9px] font-extrabold uppercase tracking-wider border flex items-center gap-1.5 cursor-pointer select-none transition-all duration-300 ${bg} ${text} hover:opacity-90 active:scale-95 disabled:cursor-not-allowed`}
            >
              {updating ? (
                <Loader2 size={10} className="animate-spin" />
              ) : (
                <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
              )}
              {currentStatus}
              {!updating && <ChevronDown size={10} className="transition-transform group-hover:translate-y-0.5" />}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-32 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 z-[999] animate-fadeIn">
                {["Pending", "In Progress", "Completed"].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleUpdateStatus(s)}
                    className="w-full px-3 py-2 text-[9px] font-extrabold uppercase tracking-wider text-left text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        s === "Completed"
                          ? "bg-emerald-500"
                          : s === "In Progress"
                          ? "bg-sky-500"
                          : "bg-amber-500"
                      }`}
                    />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Task description */}
        <p className="text-[10px] text-slate-550 leading-relaxed font-semibold break-words">
          {task.Task_Description}
        </p>
      </div>

      {/* Footer details: timeline, assignee, and author */}
      <div className="border-t border-slate-50 pt-4 flex flex-col gap-3">
        {/* Timeline dates */}
        <div className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-400">
          <Calendar size={11} className="shrink-0" />
          <span className="tracking-wide">
            {task.Start_Date} to {task.End_Date}
          </span>
        </div>

        {/* Dynamic Assignment Information */}
        <div className="flex flex-col gap-1.5 bg-slate-50/40 p-2.5 rounded-xl border border-slate-100/50">
          {/* Assigned To */}
          <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-semibold truncate">
            <Award size={11} className="shrink-0 text-slate-400" />
            <span>
              Assigned To:{" "}
              <strong className="font-extrabold text-slate-650">
                {task.Department
                  ? `Department (${task.Department})`
                  : task.Employee_Name || task.Emp_id || "Unassigned"}
              </strong>
            </span>
          </div>

          {/* Assigned By */}
          <div className="flex items-center gap-1.5 text-[8.5px] text-slate-400 font-medium truncate">
            <User size={10} className="shrink-0" />
            <span>
              Delegated By: <strong className="font-bold">{task.Assigned_By}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
