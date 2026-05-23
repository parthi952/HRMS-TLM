import React, { useState, useEffect } from "react";
import { ShieldAlert, Briefcase, FileText, Send, CheckCircle2, ListFilter, RefreshCw } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useUser, getCookie } from "../Context/UserContext";
import { useUserData } from "../Context/UserData";
import { useTasks } from "../Context/TaskContext";

// Import premium sub-components
import StatCard from "../Common/StatCard";
import { TaskCard } from "./Task/TaskCard";
import { ReportCard } from "./Task/ReportCard";

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

interface TeamMemberRecord {
  Emp_id: string;
  name: string;
  Department: string;
  designation: string;
}

interface DailyProgressReport {
  id: number;
  Emp_id: string;
  Date: string;
  Category: string;
  Description: string;
  Hours_Spent: number;
  employee_name?: string; // Stitched during load
}

export const Tasks: React.FC = () => {
  const { currentPreset } = useTheme();
  const { user } = useUser();
  const { employeeData } = useUserData();

  const [activeTab, setActiveTab] = useState<"myTasks" | "assign" | "teamReports">("myTasks");
  const [taskFilter, setTaskFilter] = useState<"all" | "toMe" | "byMe">("all");

  // Roster listing state to load members in assign dropdown
  const [teamMembers, setTeamMembers] = useState<TeamMemberRecord[]>([]);

  // Tasks states via TaskContext
  const {
    tasks: myTasksList,
    loadingTasks,
    errorTasks,
    fetchTasks: fetchMyTasks,
    assignTask
  } = useTasks();

  // Assign Task form states
  const [taskName, setTaskName] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [assignType, setAssignType] = useState<"department" | "individual">("individual");
  const [assigneeEmpId, setAssigneeEmpId] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [assignSubmitted, setAssignSubmitted] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Daily Progress reports states
  const [progressReports, setProgressReports] = useState<DailyProgressReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  const managerDept = employeeData?.profile?.Department || "";
  const currentUserEmpId = employeeData?.profile?.Emp_id || "";

  // Helper to determine if a task was assigned by the current user
  const isAssignedByMe = (task: AssignedTask) => {
    const assignedBy = task.Assigned_By || "";
    const myName = employeeData?.profile
      ? employeeData.profile.name || `${employeeData.profile.f_name} ${employeeData.profile.l_name}`.trim()
      : "";
    const myEmail = user?.email || "";

    return (
      (myName && assignedBy.toLowerCase().trim() === myName.toLowerCase().trim()) ||
      (myEmail && assignedBy.toLowerCase().trim() === myEmail.toLowerCase().trim())
    );
  };

  // 1. Fetch manager's department roster (employees)
  const fetchRoster = async () => {
    try {
      const token = getCookie("auth_access_token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      };

      // Try dedicated endpoint for fetching department members first
      const res = await fetch("http://localhost:8000/daily-tasks/team-members", { headers });
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data);
        return data;
      }

      // Fallback roster retrieval
      if (managerDept) {
        const fallbackRes = await fetch("http://localhost:8000/employee/", { headers });
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          const roster = data.filter(
            (emp: any) => emp.Department && emp.Department.toLowerCase().trim() === managerDept.toLowerCase().trim()
          );
          setTeamMembers(roster);
          return roster;
        }
      }
    } catch (e) {
      console.error("Roster retrieval error:", e);
    }
    return [];
  };

  // 2. Fetch Tasks is handled globally by useTasks context hook.

  // 3. Fetch progress reports and filter by department members
  const fetchTeamReports = async (roster: TeamMemberRecord[]) => {
    setLoadingReports(true);
    try {
      const token = getCookie("auth_access_token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      };

      const res = await fetch("http://localhost:8000/daily-tasks/all-reports", { headers });
      if (res.ok) {
        const data: DailyProgressReport[] = await res.json();
        // Filter reports to department members
        const deptReports = data
          .filter((rep) => roster.some((member) => member.Emp_id === rep.Emp_id))
          .map((rep) => {
            const memberObj = roster.find((m) => m.Emp_id === rep.Emp_id);
            return {
              ...rep,
              employee_name: memberObj?.name || rep.Emp_id
            };
          });
        setProgressReports(deptReports);
      }
    } catch (err) {
      console.error("Failed to load department task progress logs:", err);
    } finally {
      setLoadingReports(false);
    }
  };

  const loadAllData = async () => {
    const roster = await fetchRoster();
    await fetchMyTasks();
    await fetchTeamReports(roster || []);
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user, managerDept]);

  // Handle task assignment
  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignError(null);

    if (!taskName.trim()) {
      setAssignError("Please specify a task title.");
      return;
    }
    if (assignType === "individual" && !assigneeEmpId) {
      setAssignError("Please choose a team member to assign the task.");
      return;
    }

    try {
      const payload = {
        Emp_id: assignType === "individual" ? assigneeEmpId : null,
        Department: assignType === "department" ? managerDept : null,
        Task_Name: taskName,
        Task_Description: taskDesc,
        Start_Date: startDate || new Date().toISOString().split("T")[0],
        End_Date: endDate || new Date().toISOString().split("T")[0],
        Priority: priority,
      };

      await assignTask(payload);

      setAssignSubmitted(true);

      setTimeout(() => {
        setAssignSubmitted(false);
        setTaskName("");
        setTaskDesc("");
        setAssigneeEmpId("");
        setStartDate("");
        setEndDate("");
      }, 1500);

    } catch (err: any) {
      console.error("Task assignment error:", err);
      setAssignError(err.message || "An unexpected database refusal occurred.");
    }
  };

  // Filter logic for Tasks Tab
  const getFilteredTasks = () => {
    if (taskFilter === "toMe") {
      return myTasksList.filter(
        (t) =>
          (t.Emp_id === currentUserEmpId ||
            (t.Department && t.Department.toLowerCase().trim() === managerDept.toLowerCase().trim())) &&
          !isAssignedByMe(t)
      );
    }
    if (taskFilter === "byMe") {
      return myTasksList.filter(isAssignedByMe);
    }
    return myTasksList;
  };

  const filteredTasks = getFilteredTasks();

  // Metric counts
  const activeCount = myTasksList.filter(t => t.Status !== "Completed").length;
  const highPriorityCount = myTasksList.filter(t => t.Status !== "Completed" && t.Priority === "High").length;
  const completedCount = myTasksList.filter(t => t.Status === "Completed").length;

  // Filter counters
  const assignedToMeCount = myTasksList.filter(
    (t) =>
      (t.Emp_id === currentUserEmpId ||
        (t.Department && t.Department.toLowerCase().trim() === managerDept.toLowerCase().trim())) &&
      !isAssignedByMe(t)
  ).length;

  const assignedByMeCount = myTasksList.filter(isAssignedByMe).length;

  return (
    <div className="p-8 bg-bg min-h-full font-sans overflow-y-auto no-scrollbar">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span
            className="px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest rounded-full"
            style={{ color: currentPreset.primaryHex, backgroundColor: `${currentPreset.primaryHex}15` }}
          >
            Project Operations
          </span>
          <div
            className="text-3xl tracking-tight mt-2 leading-none"
            style={{ color: currentPreset.primaryHex, fontFamily: currentPreset.titleFont, fontWeight: 900 }}
          >
            Task Planner
          </div>
          <p className="text-slate-400 text-xs font-semibold mt-1.5">
            Delegate objectives, assign targets to team members, and audit real-time progress reports.
          </p>
        </div>

        {/* Sync Button */}
        <button
          onClick={loadAllData}
          className="self-start md:self-auto px-4 py-2.5 text-[10px] font-black uppercase tracking-wider bg-white border border-slate-100 hover:border-slate-200 text-slate-600 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          <RefreshCw size={12} className={loadingTasks || loadingReports ? "animate-spin" : ""} />
          Refresh Dashboard
        </button>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-6 border-b border-slate-200/50 pb-3 mb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("myTasks")}
          className="text-sm font-black transition-colors relative pb-3 -mb-[13px] cursor-pointer whitespace-nowrap"
          style={{ color: activeTab === "myTasks" ? currentPreset.primaryHex : "#94a3b8" }}
        >
          My Task Board
          {activeTab === "myTasks" && (
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
              style={{ backgroundColor: currentPreset.primaryHex }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("assign")}
          className="text-sm font-black transition-colors relative pb-3 -mb-[13px] cursor-pointer whitespace-nowrap"
          style={{ color: activeTab === "assign" ? currentPreset.primaryHex : "#94a3b8" }}
        >
          Assign Objective
          {activeTab === "assign" && (
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
              style={{ backgroundColor: currentPreset.primaryHex }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("teamReports")}
          className="text-sm font-black transition-colors relative pb-3 -mb-[13px] cursor-pointer whitespace-nowrap"
          style={{ color: activeTab === "teamReports" ? currentPreset.primaryHex : "#94a3b8" }}
        >
          Team Accomplishment Logs
          {activeTab === "teamReports" && (
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
              style={{ backgroundColor: currentPreset.primaryHex }}
            />
          )}
        </button>
      </div>

      {/* Tab A: My Tasks */}
      {activeTab === "myTasks" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Summary Stats Grid (Using Reusable Common StatCard Component) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              label="Active Goals"
              value={`${activeCount} Objectives`}
              icon={Briefcase}
              iconBgClass="bg-slate-50 border border-slate-100"
              iconColorClass="text-slate-650"
              valueColorClass="text-slate-800"
            />
            <StatCard
              label="High Priority Targets"
              value={`${highPriorityCount} Objectives`}
              icon={ShieldAlert}
              iconBgClass="bg-red-50 border border-red-100"
              iconColorClass="text-red-500"
              valueColorClass="text-red-500"
            />
            <StatCard
              label="Completed Milestones"
              value={`${completedCount} Objectives`}
              icon={CheckCircle2}
              iconBgClass="bg-emerald-50 border border-emerald-100"
              iconColorClass="text-emerald-500"
              valueColorClass="text-emerald-500"
            />
          </div>

          {/* Active Tasks ledger */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-50">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ListFilter size={14} style={{ color: currentPreset.primaryHex }} />
                Task Board Listings
              </h3>

              {/* Task filters for Managers */}
              <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100">
                {[
                  { id: "all", label: "All Tasks", count: myTasksList.length },
                  { id: "toMe", label: "Assigned to Me", count: assignedToMeCount },
                  { id: "byMe", label: "Assigned by Me", count: assignedByMeCount }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setTaskFilter(f.id as any)}
                    className="px-3 py-1.5 text-[8.5px] font-extrabold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    style={{
                      backgroundColor: taskFilter === f.id ? "#ffffff" : "transparent",
                      color: taskFilter === f.id ? currentPreset.primaryHex : "#64748b",
                      boxShadow: taskFilter === f.id ? "0 1px 3px 0 rgba(0,0,0,0.05)" : "none"
                    }}
                  >
                    {f.label}
                    <span
                      className="px-1.5 py-0.5 text-[7.5px] rounded-md font-black"
                      style={{
                        backgroundColor: taskFilter === f.id ? `${currentPreset.primaryHex}15` : "#f1f5f9",
                        color: taskFilter === f.id ? currentPreset.primaryHex : "#64748b"
                      }}
                    >
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {loadingTasks ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                <div className="h-44 bg-slate-50 rounded-3xl" />
                <div className="h-44 bg-slate-50 rounded-3xl" />
              </div>
            ) : errorTasks ? (
              <p className="text-[10px] text-slate-400 font-semibold text-center py-6">{errorTasks}</p>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-12 bg-slate-50/40 border border-dashed border-slate-200 rounded-2xl">
                <Briefcase size={28} className="text-slate-350 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">No Objectives Found</p>
                <p className="text-[10px] text-slate-400 mt-1">There are no tasks matching your selected filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id || task.ID}
                    task={task}
                    primaryHex={currentPreset.primaryHex}
                    currentUserEmpId={currentUserEmpId}
                    onStatusUpdate={fetchMyTasks}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab B: Assign Task Form */}
      {activeTab === "assign" && (
        <div className="max-w-xl mx-auto bg-white border border-slate-100 rounded-3xl p-8 shadow-sm animate-fadeIn">
          <h3 className="text-base font-black text-slate-800 mb-1">Delegate Department Target</h3>
          <p className="text-slate-400 text-xs font-medium mb-6">File a structured objective target to team members or department.</p>

          {assignError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-650 text-[10px] font-extrabold flex items-center gap-2 animate-shake">
              <ShieldAlert size={14} className="shrink-0" />
              <span>{assignError}</span>
            </div>
          )}

          {assignSubmitted ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4 animate-bounce">
                <CheckCircle2 size={26} />
              </div>
              <h4 className="text-sm font-black text-slate-800">Objective Dispatched!</h4>
              <p className="text-[10px] text-slate-400 font-medium mt-1">The task assignment has been broadcasted to database files.</p>
            </div>
          ) : (
            <form onSubmit={handleAssignTask} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Objective Title</label>
                <input
                  type="text"
                  required
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="e.g. Code database index fixes..."
                  className="w-full px-3.5 py-2.5 border border-slate-100 focus:border-slate-200 rounded-xl focus:outline-none text-xs font-semibold bg-slate-50/50"
                  style={{ caretColor: currentPreset.primaryHex }}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Detailed Requirements</label>
                <textarea
                  rows={3}
                  required
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Elaborate details, requirements, and deliverables..."
                  className="w-full px-3.5 py-2.5 border border-slate-100 focus:border-slate-200 rounded-xl focus:outline-none text-xs font-semibold bg-slate-50/50"
                  style={{ caretColor: currentPreset.primaryHex }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Assignment Scope</label>
                  <select
                    value={assignType}
                    onChange={(e) => setAssignType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 border border-slate-100 rounded-xl focus:outline-none text-xs font-semibold bg-slate-50/50 cursor-pointer"
                  >
                    <option value="individual">Assign Department Staff</option>
                    <option value="department">Assign Entire Department</option>
                  </select>
                </div>

                <div>
                  {assignType === "individual" ? (
                    <>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Roster Assignee</label>
                      <select
                        required
                        value={assigneeEmpId}
                        onChange={(e) => setAssigneeEmpId(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-100 rounded-xl focus:outline-none text-xs font-semibold bg-slate-50/50 cursor-pointer"
                      >
                        <option value="">Choose Staff...</option>
                        {teamMembers.map((member) => (
                          <option key={member.Emp_id} value={member.Emp_id}>
                            {member.name} ({member.Emp_id})
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Target Department</label>
                      <input
                        type="text"
                        disabled
                        value={managerDept || "Not Configured"}
                        className="w-full px-3.5 py-2.5 border border-slate-100 rounded-xl bg-slate-100 text-slate-450 text-xs font-semibold cursor-not-allowed uppercase"
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Priority Scale</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-100 rounded-xl focus:outline-none text-xs font-semibold bg-slate-50/50 cursor-pointer"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Launch Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-100 rounded-xl focus:outline-none text-xs font-semibold bg-slate-50/50 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Deadline Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-100 rounded-xl focus:outline-none text-xs font-semibold bg-slate-50/50 cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 mt-4 text-[10px] font-extrabold uppercase tracking-widest text-white rounded-xl hover:opacity-90 cursor-pointer shadow-sm active:scale-98 transition-all flex items-center justify-center gap-1.5 hover:shadow-md"
                style={{ backgroundColor: currentPreset.primaryHex }}
              >
                <Send size={12} />
                Delegate Objective
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tab C: Team Progress Reports Logs */}
      {activeTab === "teamReports" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 overflow-hidden animate-fadeIn">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Department Daily Accomplishment Timeline
            </h3>
            <span className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[8.5px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
              {progressReports.length} Reports
            </span>
          </div>

          {loadingReports ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-16 bg-slate-50 rounded-2xl" />
              <div className="h-16 bg-slate-50 rounded-2xl" />
            </div>
          ) : progressReports.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/40 rounded-2xl border border-dashed border-slate-200">
              <FileText size={32} className="text-slate-350 mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-600">No Progress Logs Submitted</p>
              <p className="text-[10px] text-slate-400 mt-1">There are no daily task reports logged by your team members yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {progressReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  primaryHex={currentPreset.primaryHex}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

