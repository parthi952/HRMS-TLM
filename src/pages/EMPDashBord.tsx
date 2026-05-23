import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Calendar,
  Plus,
  Bell
} from "lucide-react";

import { useTheme } from "../ThemeContext";
import { useUser, getCookie } from "../Context/UserContext";
import CalendarView from "../Common/Calander/CalendarView";
import { getGlassmorphicStyle } from "../Themes/PageThemes/SideMenu";
import { TaskItem } from "./components/TaskItem";
import { useTasks } from "../Context/TaskContext";
import { useUserData } from "../Context/UserData";

export const EMPDashBord: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const userName = user?.name || "Ravi Mohan";
  const empId = user?.empId || "EMP - 001";

  const {
    clockedIn,
    setClockedIn,
    setClockTime,
    currentPreset,
  } = useTheme();
  const [activeTab, setActiveTab] = useState<"task" | "calendar">("task");
  const [checkedOutToday, setCheckedOutToday] = useState<boolean>(false);

  // ── Live elapsed timer ─────────────────────────────────────────────────────

  // Compute elapsed seconds from checkIn time string (HH:MM / HH:MM:SS / 12h AM/PM / ISO)
  const getElapsedFromCheckIn = (checkIn: string): number => {
    try {
      if (!checkIn) return 0;
      const now = new Date();
      let startDate: Date;

      if (checkIn.includes("T") || checkIn.length > 11) {
        startDate = new Date(checkIn);
      } else {
        // Clean AM/PM format e.g. "10:30 AM" or "04:12 PM"
        let isPM = false;
        let cleaned = checkIn.trim().toUpperCase();
        
        if (cleaned.includes("PM")) {
          isPM = true;
          cleaned = cleaned.replace("PM", "").trim();
        } else if (cleaned.includes("AM")) {
          cleaned = cleaned.replace("AM", "").trim();
        }

        const parts = cleaned.split(":");
        let h = parseInt(parts[0], 10);
        let m = parseInt(parts[1], 10);
        let s = parts[2] ? parseInt(parts[2], 10) : 0;

        if (isNaN(h) || isNaN(m)) {
          return 0;
        }

        // Adjust hours for 12-hour clock
        if (isPM && h < 12) {
          h += 12;
        } else if (!isPM && h === 12) {
          h = 0;
        }

        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, s);
      }

      const elapsed = Math.floor((now.getTime() - startDate.getTime()) / 1000);
      return isNaN(elapsed) ? 0 : Math.max(0, elapsed);
    } catch {
      return 0;
    }
  };

  // Lazy initializer: reads localStorage so the timer is correct IMMEDIATELY on page open
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    const isClocked = localStorage.getItem("clockedIn") === "true";
    const storedCheckIn = localStorage.getItem("clockTime");
    if (isClocked && storedCheckIn) {
      // Calculate true elapsed from the stored check-in timestamp
      return getElapsedFromCheckIn(storedCheckIn);
    }
    return 0;
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Format seconds → HH:MM:SS string
  const formatElapsed = (secs: number): string => {
    const h = Math.floor(secs / 3600).toString().padStart(2, "0");
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // Start / stop the interval based on clockedIn state
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (clockedIn) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clockedIn]);

  const API_BASE_URL = "http://localhost:8000";

  const getAuthHeaders = () => {
    const token = getCookie("auth_access_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
  };

  React.useEffect(() => {
    if (!user) return;
    
    const fetchAttendanceStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/employee-attendance/status`, {
          headers: getAuthHeaders(),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.check_in) {
            setClockTime(data.check_in);
            if (data.check_out) {
              setClockedIn(false);
              setCheckedOutToday(true);
            } else {
              setClockedIn(true);
              setCheckedOutToday(false);
            }
          } else {
            setClockedIn(false);
            setClockTime(null);
            setCheckedOutToday(false);
          }
        }
      } catch (err) {
        console.error("Failed to fetch today's attendance status:", err);
      }
    };

    fetchAttendanceStatus();
    fetchTasks();
  }, [user, setClockedIn, setClockTime]);

  // Seed elapsedSeconds from server check_in time on first load
  const { clockTime } = useTheme();
  useEffect(() => {
    // Re-sync when the API responds with the authoritative check_in time
    if (clockedIn && clockTime) {
      setElapsedSeconds(getElapsedFromCheckIn(clockTime));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clockTime]);

  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Real-time Heartbeat to track session status
  useEffect(() => {
    if (!user) {
      setIsOnline(false);
      return;
    }

    const sendHeartbeat = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/employee-session/heartbeat`, {
          method: "POST",
          headers: getAuthHeaders(),
        });
        if (response.ok) {
          setIsOnline(true);
        } else if (response.status === 401) {
          setIsOnline(false);
        }
      } catch (err) {
        console.error("Heartbeat error:", err);
        setIsOnline(false);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 20000);

    return () => clearInterval(interval);
  }, [user]);

  const { tasks: dbTasks, loadingTasks, fetchTasks, assignTask, updateTaskStatus } = useTasks();
  const { employeeData } = useUserData();
  const empDept = employeeData?.profile?.Department || "";
  const empIdReal = employeeData?.profile?.Emp_id || empId;

  // Filter tasks assigned to self individually or department-wide
  const myTasksList = dbTasks.filter(
    (t) =>
      t.Emp_id === empIdReal ||
      (t.Department && empDept && t.Department.toLowerCase().trim() === empDept.toLowerCase().trim())
  );

  // Map to layout needed for TaskItem component and sidebar
  const mappedTasks = myTasksList.map((t) => ({
    id: t.id || t.ID || 0,
    title: t.Task_Name,
    priority: t.Priority,
    due: t.End_Date,
    status: t.Status,
  }));

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");
  const [newTaskDue, setNewTaskDue] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const events = [
    { title: "Monthly All-Hands Meeting", date: "May 25, 2026", time: "10:00 AM", type: "Corporate", loc: "Main Conference Hall" },
    { title: "React 19 Tech Workshop", date: "May 29, 2026", time: "02:00 PM", type: "Training", loc: "Virtual Room A" },
    { title: "Memorial Day Holiday", date: "May 31, 2026", time: "All Day", type: "Holiday", loc: "Office Closed" },
    { title: "Q3 Project Kick-off", date: "June 02, 2026", time: "11:00 AM", type: "Strategic", loc: "Management Boardroom" }
  ];

  const notifications = [
    { title: "Q3 Performance Review Schedule", date: "May 24", imp: true },
    { title: "Office Renovation on 2nd Floor", date: "May 28", imp: false }
  ];

  const handlePunch = async () => {
    if (checkedOutToday) {
      alert("You have already checked out for today!");
      return;
    }

    try {
      if (!clockedIn) {
        // Checking in
        const response = await fetch(`${API_BASE_URL}/employee-attendance/check-in`, {
          method: "POST",
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || "Failed to check in");
        }
        const data = await response.json();
        setClockTime(data.check_in);
        setClockedIn(true);
      } else {
        // Checking out
        const response = await fetch(`${API_BASE_URL}/employee-attendance/check-out`, {
          method: "POST",
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || "Failed to check out");
        }
        await response.json();
        setClockedIn(false);
        setClockTime(null);
        setCheckedOutToday(true);
      }
    } catch (err: any) {
      console.error("Punch Error:", err);
      alert(err.message || "An error occurred while communicating with the server.");
    }
  };

  const toggleTask = async (taskId: number) => {
    const task = dbTasks.find((t) => (t.id || t.ID) === taskId);
    if (!task) return;
    const newStatus = task.Status === "Completed" ? "Pending" : "Completed";
    await updateTaskStatus(taskId, newStatus);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const payload = {
        Emp_id: empIdReal,
        Department: undefined,
        Task_Name: newTaskTitle,
        Task_Description: "Self-created task via Employee Dashboard",
        Start_Date: new Date().toISOString().split("T")[0],
        End_Date: newTaskDue || new Date().toISOString().split("T")[0],
        Priority: newTaskPriority,
        Status: "Pending"
      };

      await assignTask(payload);

      setNewTaskTitle("");
      setNewTaskPriority("Medium");
      setNewTaskDue("");
      setShowAddModal(false);
    } catch (err) {
      console.error("Failed to assign self task:", err);
      alert("Failed to assign self task.");
    }
  };

  return (
    <div className="p-5 font-sans h-[calc(100vh-3.5rem)] flex flex-col bg-bg overflow-hidden">

      {/* 1. TOP PROFILE BANNER - Styled dynamically to match preset colors */}
      <div 
        className="rounded-[32px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6 border border-slate-200/50 shadow-sm relative overflow-hidden shrink-0"
        style={getGlassmorphicStyle(currentPreset.primaryHex, "12", 16)}
      >
        <div className="flex items-center gap-5">
          {/* Avatar frame */}
          <div className="relative">
            <div
              className="w-18 h-18 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-inner"
              style={{ backgroundColor: currentPreset.primaryHex }}
            >
              {userName.split(' ').map(n => n[0]).join('')}
            </div>
            {/* Online/Offline Indicator Dot */}
            <span className={`w-4 h-4 rounded-full absolute bottom-0.5 right-0.5 border-2 border-white shadow-sm transition-all duration-300 ${isOnline ? 'bg-[#00ff00] animate-pulse' : 'bg-slate-400'}`} />
          </div>

          <div>
            <div 
              className="text-2xl tracking-tight leading-none mb-1.5"
              style={{ color: "#1e293b", fontFamily: currentPreset.titleFont, fontWeight: 900 }}
            >
              {userName}
            </div>
            <p className="text-xs font-bold text-slate-500 mb-1">
              {empId}
            </p>
            <p 
              className="text-[10px] font-black tracking-wider uppercase transition-colors duration-300" 
              style={{ color: isOnline ? '#10b981' : '#64748b' }}
            >
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Check In / Out Button + live timer */}
        <div className="flex flex-col items-end gap-2">
          {/* Live elapsed timer — shown while clocked in or after clocking out */}
          {(clockedIn || checkedOutToday) && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 border border-white/50 shadow-inner">
              <Clock size={11} className="shrink-0" style={{ color: currentPreset.primaryHex }} />
              <span
                className="font-black tabular-nums text-sm tracking-wider"
                style={{ color: currentPreset.primaryHex }}
              >
                {formatElapsed(elapsedSeconds)}
              </span>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                {clockedIn ? "elapsed" : "total"}
              </span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/profile")}
              className="px-6 py-3 rounded-full text-xs font-black tracking-wider uppercase transition-all shadow-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer active:scale-95"
            >
              View Profile
            </button>
            <button
              onClick={handlePunch}
              disabled={checkedOutToday}
              className="px-7 py-3 rounded-full text-xs font-black tracking-wider uppercase transition-all shadow-md active:scale-95 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: checkedOutToday ? '#10b981' : (clockedIn ? '#f43f5e' : currentPreset.primaryHex) }}
            >
              {checkedOutToday ? "Shift Completed" : (clockedIn ? "Check Out" : "Check In")}
            </button>
          </div>
        </div>
      </div>

      {/* 2. BODY CONTENT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0 mb-2">

        {/* LEFT COLUMN: Tab System (Task & Calendar) */}
        <div className="lg:col-span-2 flex flex-col min-h-0 space-y-4">

          {/* Tabs Selector */}
          <div className="flex items-center gap-8 border-b border-slate-200/60 pb-3 mb-2">
            <button
              onClick={() => setActiveTab("task")}
              className="text-xl transition-colors relative pb-3 -mb-[15px] focus:outline-none cursor-pointer"
              style={{ 
                color: activeTab === "task" ? currentPreset.primaryHex : "#94a3b8",
                fontFamily: currentPreset.titleFont,
                fontWeight: 900
              }}
            >
              Task
              {activeTab === "task" && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: currentPreset.primaryHex }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className="text-xl transition-colors relative pb-3 -mb-[15px] focus:outline-none cursor-pointer"
              style={{ 
                color: activeTab === "calendar" ? currentPreset.primaryHex : "#94a3b8",
                fontFamily: currentPreset.titleFont,
                fontWeight: 900
              }}
            >
              Calendar
              {activeTab === "calendar" && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: currentPreset.primaryHex }}
                />
              )}
            </button>
          </div>

          {/* Dynamic Tab Body */}
          <div className="flex-1 mt-5 min-h-0">
            {activeTab === "task" ? (
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full min-h-0 overflow-hidden">
                <div className="flex items-center justify-between mb-2 shrink-0">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Task Manager</h3>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-white font-bold text-[10px] cursor-pointer hover:opacity-90 transition-all"
                    style={{ backgroundColor: currentPreset.primaryHex }}
                  >
                    <Plus size={12} />
                    New Task
                  </button>
                </div>

                <div className="divide-y divide-slate-50 flex-1 overflow-y-auto no-scrollbar pr-1">
                  {loadingTasks ? (
                    <div className="flex items-center justify-center py-12 text-slate-400 font-semibold text-xs gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                      <span>Syncing objectives...</span>
                    </div>
                  ) : mappedTasks.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 font-semibold text-xs">
                      No active operational objectives assigned.
                    </div>
                  ) : (
                    mappedTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        primaryHex={currentPreset.primaryHex}
                        onToggle={toggleTask}
                      />
                    ))
                  )}
                </div>
              </div>
            ) : (
              <CalendarView
                events={[
                  { title: "Monthly All-Hands Meeting", start: "2026-05-25" },
                  { title: "React 19 Tech Workshop", start: "2026-05-29" },
                  { title: "Memorial Day Holiday", start: "2026-05-31" },
                  { title: "Q3 Project Kick-off", start: "2026-06-02" }
                ]}
                handleDateClick={(arg: any) => console.log("Date clicked: " + arg.dateStr)}
                EventColor={currentPreset.primaryHex}
              />
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar - Dynamic glassmorphic styled widget */}
        <div className="flex flex-col min-h-0">
          <div 
            className="rounded-[32px] p-6 space-y-6 border border-slate-200/50 shadow-lg text-slate-800 flex flex-col h-full min-h-0 overflow-y-auto no-scrollbar"
            style={getGlassmorphicStyle(currentPreset.primaryHex, "1C", 16)}
          >

            {/* Section A: Notification */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-800/15 mb-3 flex items-center gap-1.5">
                <Bell size={12} style={{ color: currentPreset.primaryHex }} />
                Notification :
              </h3>
              <div className="space-y-3">
                {notifications.map((not, idx) => (
                  <div key={idx} className="bg-white/45 border border-white/30 p-3 rounded-xl hover:bg-white/60 transition-all shadow-sm">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-[11px] font-bold text-slate-800 leading-snug">{not.title}</p>
                      {not.imp && (
                        <span className="bg-red-500 text-white text-[7px] font-black uppercase px-1 py-0.5 rounded tracking-widest shrink-0">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-[8px] text-slate-650 font-bold mt-1 uppercase tracking-wider">{not.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section B: Task List */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-800/15 mb-3">
                Task List :
              </h3>
              <div className="space-y-2">
                {loadingTasks ? (
                  <p className="text-[9px] text-slate-500 font-semibold italic text-center py-2">Syncing...</p>
                ) : mappedTasks.filter(t => t.status !== "Completed").length === 0 ? (
                  <p className="text-[9px] text-slate-500 font-semibold italic text-center py-2">No pending objectives</p>
                ) : (
                  mappedTasks.filter(t => t.status !== "Completed").slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center gap-2 bg-white/45 border border-white/30 p-2.5 rounded-xl shadow-sm animate-fadeIn">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentPreset.primaryHex }} />
                      <span className="text-[10px] font-bold text-slate-800 truncate flex-1">{task.title}</span>
                      <span 
                        className="text-[7px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider text-white"
                        style={{ backgroundColor: currentPreset.primaryHex }}
                      >
                        {task.priority}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Section C: Upcoming Event */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-800/15 mb-3">
                Up Coming Event :
              </h3>
              <div className="space-y-2.5">
                {events.slice(0, 2).map((ev, idx) => (
                  <div key={idx} className="bg-white/45 border border-white/30 p-3 rounded-xl flex items-start gap-2.5 shadow-sm">
                    <div 
                      className="p-1.5 rounded-lg shrink-0 mt-0.5"
                      style={{ color: currentPreset.primaryHex, backgroundColor: `${currentPreset.primaryHex}15` }}
                    >
                      <Calendar size={12} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-800 truncate leading-snug">{ev.title}</p>
                      <p className="text-[8px] text-slate-650 font-bold mt-0.5 tracking-wide">{ev.date} at {ev.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Add Task Dialog Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-100 w-full max-w-md p-8 relative shadow-2xl"
            >
              <h3 className="text-lg font-black text-slate-800 mb-2">Create New Task</h3>
              <p className="text-slate-400 text-xs font-medium mb-6">Complete the fields below to add a new task to your ledger.</p>

              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Task Title</label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Enter task description..."
                    className="w-full px-3.5 py-2 border border-slate-100 rounded-xl focus:border-primary focus:outline-none text-xs font-semibold bg-slate-50/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Priority</label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-100 rounded-xl focus:border-primary focus:outline-none text-xs font-semibold bg-slate-50/50"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Due Date</label>
                    <input
                      type="text"
                      placeholder="e.g. Tomorrow"
                      value={newTaskDue}
                      onChange={(e) => setNewTaskDue(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-100 rounded-xl focus:border-primary focus:outline-none text-xs font-semibold bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-8 pt-4 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 text-[10px] font-bold text-slate-500 bg-slate-50 rounded-xl hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 text-[10px] font-bold text-white rounded-xl hover:opacity-90 cursor-pointer"
                    style={{ backgroundColor: currentPreset.primaryHex }}
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
