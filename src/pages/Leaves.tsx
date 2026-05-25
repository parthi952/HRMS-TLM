import React, { useState, useEffect } from "react";
import { Plus, Check, AlertCircle, CalendarDays, HeartPulse, Award, UserCheck, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../ThemeContext";
import { useUser, getCookie } from "../Context/UserContext";
import { useUserData } from "../Context/UserData";
import StatCard from "../Common/StatCard";
import { Api_URL } from "../APILINK";

interface LeaveHistoryEntry {
  id: number; // Leave request PK in DB
  Emp_id: string;
  employee_name: string;
  Duration: string;
  from_date: string;
  to_date: string;
  applayDate: string;
  Reason: string;
  Days: number;
  leave_type: string;
  status: string;
}

interface TeamMemberBalance {
  Emp_id: string;
  employee_name: string;
  Total_Leave: number;
  Used: number;
  Available: number;
}

interface EmployeeRecord {
  Emp_id: string;
  name: string;
  Department: string;
  designation: string;
}

export const Leaves: React.FC = () => {
  const { currentPreset } = useTheme();
  const { user } = useUser();
  const { employeeData, refreshData } = useUserData();

  const [activeTab, setActiveTab] = useState<"approvals" | "myLeaves">("approvals");

  // Modal / Leave application state for manager themselves
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveType, setLeaveType] = useState("Casual");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Department data states
  const [pendingRequests, setPendingRequests] = useState<LeaveHistoryEntry[]>([]);
  const [teamBalances, setTeamBalances] = useState<TeamMemberBalance[]>([]);
  const [loadingApprovals, setLoadingApprovals] = useState(true);
  const [errorApprovals, setErrorApprovals] = useState<string | null>(null);

  // Manager's own leave details
  const [myHistory, setMyHistory] = useState<LeaveHistoryEntry[]>([]);
  const [myBalances, setMyBalances] = useState<{ total: number; used: number; available: number }>({
    total: 36,
    used: 0,
    available: 36
  });

  const managerDept = employeeData?.profile?.Department || "";
  const managerEmpId = user?.empId || "";

  // 1. Fetch manager's own leave history & balance
  const fetchMyLeaves = async () => {
    if (!managerEmpId) return;
    try {
      const token = getCookie("auth_access_token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      };

      const response = await fetch(`${Api_URL}/leave/history/${managerEmpId}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setMyBalances({
          total: data.total_leave ?? 36,
          used: data.Used ?? 0,
          available: data.available_leaves ?? 36
        });
        if (data.leave_history) {
          setMyHistory(data.leave_history);
        }
      }
    } catch (err) {
      console.error("Failed to load manager's leave history:", err);
    }
  };

  // 2. Fetch team's leaves and pending requests
  const fetchTeamLeavesAndApprovals = async () => {
    if (!managerDept) {
      setLoadingApprovals(false);
      return;
    }
    setLoadingApprovals(true);
    setErrorApprovals(null);

    try {
      const token = getCookie("auth_access_token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      };

      // A. Get all employees to filter department roster
      const empRes = await fetch(`${Api_URL}/employee/`, { headers });
      if (!empRes.ok) throw new Error("Could not fetch corporate employees registry.");
      const allEmployees: EmployeeRecord[] = await empRes.json();

      const role = (user?.role || "").toLowerCase();
      const isHR = role === "hr" || role === "admin";
      const deptRoster = isHR
        ? allEmployees
        : allEmployees.filter(
            (emp) => emp.Department && emp.Department.toLowerCase().trim() === managerDept.toLowerCase().trim()
          );

      // B. Fetch all leave balances (to display team balances table)
      const balancesRes = await fetch(`${Api_URL}/leave/all-balances`, { headers });
      if (balancesRes.ok) {
        const allBalances: TeamMemberBalance[] = await balancesRes.json();
        // Filter balances to our department roster
        const deptBalances = allBalances.filter((bal) =>
          deptRoster.some((member) => member.Emp_id === bal.Emp_id)
        );
        setTeamBalances(deptBalances);
      }

      // C. Query individual histories of all department members to compile active/pending leaves
      const historiesPromise = deptRoster.map(async (member) => {
        try {
          const res = await fetch(`${Api_URL}/leave/history/${member.Emp_id}`, { headers });
          if (res.ok) {
            const data = await res.json();
            // Stitch name & ID onto each leave history entry for identification in approvals list
            return (data.leave_history || []).map((h: any, idx: number) => ({
              ...h,
              id: h.id ?? idx + Date.now(), // Fallback PK
              Emp_id: member.Emp_id,
              employee_name: member.name
            }));
          }
        } catch (e) {
          console.warn(`Failed to fetch history for ${member.name}:`, e);
        }
        return [];
      });

      const resolvedHistories = await Promise.all(historiesPromise);
      const allDeptLeaves: LeaveHistoryEntry[] = resolvedHistories.flat();

      const isManagerOrTL = ["manager", "tl", "team_lead", "teamlead", "lead"].includes(role);
      // Only display leaves requiring action based on role
      const pending = allDeptLeaves.filter((l) => {
        const statusLower = (l.status || "").toLowerCase();
        if (isManagerOrTL) {
          return statusLower === "pending";
        } else {
          return statusLower === "pending" || statusLower === "recommended";
        }
      });
      setPendingRequests(pending);

    } catch (err: any) {
      console.error("Team Approvals Fetch Error:", err);
      setErrorApprovals(err.message || "An error occurred while compiling team approvals.");
    } finally {
      setLoadingApprovals(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyLeaves();
      fetchTeamLeavesAndApprovals();
    }
  }, [user, managerDept, managerEmpId]);

  // Handle leave approval, recommendation or rejection
  const handleUpdateStatus = async (leaveId: number, newStatus: "Approved" | "Recommended" | "Rejected") => {
    try {
      const token = getCookie("auth_access_token");
      const response = await fetch(`${Api_URL}/leave/update-status/${leaveId}?status=${newStatus}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Failed to update request to ${newStatus}`);
      }

      // Reload team balances and pending requests
      await fetchTeamLeavesAndApprovals();
    } catch (err: any) {
      console.error("Status Update Error:", err);
      alert(err.message || "Could not complete authorization operation.");
    }
  };

  // Submit leave application for Manager themselves
  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError(null);

    if (!start || !end) {
      setApplyError("Please specify both start and end dates.");
      return;
    }

    try {
      const token = getCookie("auth_access_token");
      const durationStr = `${start} to ${end}`;

      const payload = {
        Emp_id: managerEmpId,
        employee_name: user?.name || "Manager",
        Duration: durationStr,
        leave_type: leaveType,
        Reason: reason
      };

      const response = await fetch(`${Api_URL}/leave/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Insufficient balance or invalid date range.");
      }

      setSubmitted(true);
      await fetchMyLeaves(); // Reload my logs
      refreshData(); // Refresh global payroll/allowance details if linked

      setTimeout(() => {
        setSubmitted(false);
        setShowApplyModal(false);
        setStart("");
        setEnd("");
        setReason("");
      }, 1500);

    } catch (err: any) {
      console.error("Leave apply error:", err);
      setApplyError(err.message || "An unexpected error occurred during submission.");
    }
  };

  return (
    <div className="p-8 bg-bg min-h-full font-sans overflow-y-auto no-scrollbar">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span
            className="px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest rounded-full"
            style={{ color: currentPreset.primaryHex, backgroundColor: `${currentPreset.primaryHex}15` }}
          >
            Time-Off Administration
          </span>
          <div
            className="text-3xl tracking-tight mt-2 leading-none"
            style={{ color: currentPreset.primaryHex, fontFamily: currentPreset.titleFont, fontWeight: 900 }}
          >
            Leaves Center
          </div>
          <p className="text-slate-400 text-xs font-semibold mt-1.5">
            Approve team leaves, audit staff balances, and manage your own time-off planner.
          </p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-white font-black text-xs transition-transform hover:scale-102 active:scale-98 cursor-pointer shadow-sm"
          style={{ backgroundColor: currentPreset.primaryHex }}
        >
          <Plus size={14} />
          Request Leave
        </button>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-6 border-b border-slate-200/50 pb-3 mb-6">
        <button
          onClick={() => setActiveTab("approvals")}
          className="text-sm font-black transition-colors relative pb-3 -mb-[13px] cursor-pointer"
          style={{ color: activeTab === "approvals" ? currentPreset.primaryHex : "#94a3b8" }}
        >
          Team Leave Approvals
          {activeTab === "approvals" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: currentPreset.primaryHex }} />
          )}
        </button>
        <button
          onClick={() => setActiveTab("myLeaves")}
          className="text-sm font-black transition-colors relative pb-3 -mb-[13px] cursor-pointer"
          style={{ color: activeTab === "myLeaves" ? currentPreset.primaryHex : "#94a3b8" }}
        >
          My Leave Records
          {activeTab === "myLeaves" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: currentPreset.primaryHex }} />
          )}
        </button>
      </div>

      {/* Tab A: Team Leave Approvals */}
      {activeTab === "approvals" && (
        <div className="space-y-8">
          {/* Section 1: Pending Leave Applications */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Pending Department Requests
              </h3>
              <span className="bg-amber-100 text-amber-800 text-[8px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                {pendingRequests.length} Pending
              </span>
            </div>

            {loadingApprovals ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-16 bg-slate-50 rounded-xl" />
                <div className="h-16 bg-slate-50 rounded-xl" />
              </div>
            ) : errorApprovals ? (
              <div className="text-center py-8 text-slate-400 font-semibold text-xs flex flex-col items-center">
                <ShieldAlert size={28} className="text-red-500 mb-2" />
                <span>Failed to compile pending approvals.</span>
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 bg-slate-50/40 rounded-2xl border border-dashed border-slate-200">
                <AlertCircle size={32} className="text-slate-400 mb-2.5" />
                <p className="text-xs font-bold text-slate-700">No Pending Team Requests</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">
                  All leave requests from your department members have been resolved.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:shadow-sm transition-shadow"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black text-slate-400 uppercase">{request.Emp_id}</span>
                        <h4 className="text-xs font-black text-slate-800">{request.employee_name}</h4>
                        {request.status === "Recommended" && (
                          <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full animate-pulse">
                            Recommended by Manager
                          </span>
                        )}
                      </div>
                      <h5 className="text-[11px] font-bold text-slate-650 mt-1 flex items-center gap-2">
                        Type: <span className="text-slate-800 font-black">{request.leave_type}</span> | Duration:{" "}
                        <span className="text-slate-800 font-black">{request.Duration}</span> ({request.Days} Days)
                      </h5>
                      <p className="text-[10px] text-slate-400 font-medium mt-2 leading-relaxed italic bg-white border border-slate-100 p-2 rounded-xl">
                        "{request.Reason}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
                      <button
                        onClick={() => handleUpdateStatus(request.id, "Rejected")}
                        className="px-4 py-2 bg-white border border-red-200 text-red-500 rounded-xl text-[10px] font-extrabold uppercase tracking-wider hover:bg-red-50 cursor-pointer shadow-sm active:scale-95 transition-all"
                      >
                        Reject
                      </button>
                      
                      {["manager", "tl", "team_lead", "teamlead", "lead"].includes((user?.role || "").toLowerCase()) ? (
                        <button
                          onClick={() => handleUpdateStatus(request.id, "Recommended")}
                          className="px-4 py-2 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider hover:opacity-90 cursor-pointer shadow-sm active:scale-95 transition-all flex items-center gap-1"
                          style={{ backgroundColor: currentPreset.primaryHex }}
                        >
                          <UserCheck size={11} />
                          Recommend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(request.id, "Approved")}
                          className="px-4 py-2 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider hover:opacity-90 cursor-pointer shadow-sm active:scale-95 transition-all flex items-center gap-1"
                          style={{ backgroundColor: currentPreset.primaryHex }}
                        >
                          <UserCheck size={11} />
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Department Roster Leave Balances */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 overflow-hidden">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-4">
              Department Leave Quotas (Auditing)
            </h3>
            
            {loadingApprovals ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-8 bg-slate-50 rounded" />
                <div className="h-20 bg-slate-50 rounded" />
              </div>
            ) : teamBalances.length === 0 ? (
              <p className="text-[10px] text-slate-400 font-semibold text-center py-6">
                No leave quota entries found for your department roster.
              </p>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-[10px] font-bold text-slate-650 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[8px] font-extrabold uppercase tracking-widest text-left">
                      <th className="py-2.5 pr-4">Staff Member</th>
                      <th className="py-2.5 px-4 text-center">Allowed</th>
                      <th className="py-2.5 px-4 text-center">Used</th>
                      <th className="py-2.5 px-4 text-center">Available Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {teamBalances.map((bal) => (
                      <tr key={bal.Emp_id} className="hover:bg-slate-50/20 transition-colors">
                        <td className="py-3 pr-4">
                          <p className="text-slate-800 font-black">{bal.employee_name}</p>
                          <p className="text-[8px] text-slate-400 font-extrabold">{bal.Emp_id}</p>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-700">{bal.Total_Leave} Days</td>
                        <td className="py-3 px-4 text-center text-red-500 font-black">{bal.Used} Days</td>
                        <td className="py-3 px-4 text-center text-emerald-600 font-black text-xs">
                          {bal.Available} Days
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab B: Manager's Own Leaves */}
      {activeTab === "myLeaves" && (
        <div className="space-y-8">
          {/* Leave Balance Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={CalendarDays}
              label="Allocated Leaves"
              value={`${myBalances.total} Days`}
              subText="Standard Annual Credit"
              cardBgClass="bg-blue-50/50"
              iconBgClass="bg-blue-50"
              iconColorClass="text-blue-500"
              valueColorClass="text-blue-600"
            />
            <StatCard
              icon={HeartPulse}
              label="Utilized Credit"
              value={`${myBalances.used} Days`}
              subText="Absences check-offs approved"
              cardBgClass="bg-red-50/50"
              iconBgClass="bg-red-50"
              iconColorClass="text-red-500"
              valueColorClass="text-red-600"
            />
            <StatCard
              icon={Award}
              label="Available Balance"
              value={`${myBalances.available} Days`}
              subText="Current remaining balance"
              cardBgClass="bg-emerald-50/50"
              iconBgClass="bg-emerald-50"
              iconColorClass="text-emerald-500"
              valueColorClass="text-emerald-600"
            />
          </div>

          {/* Manager History logs */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-4">My Leave Ledger</h3>
            {myHistory.length === 0 ? (
              <div className="text-center py-10 bg-slate-50/40 border border-dashed border-slate-200 rounded-2xl">
                <AlertCircle size={30} className="text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No Personal Leave History</p>
                <p className="text-[10px] text-slate-400 mt-1">You haven't requested any time-off through this portal yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {myHistory.map((item, idx) => (
                  <div key={idx} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:bg-slate-50/20 transition-colors px-2 rounded-xl">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 flex items-center gap-2">
                        {item.leave_type} Leave
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                          item.status === "Approved" ? "bg-emerald-50 text-emerald-500" :
                          item.status === "Rejected" ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500"
                        }`}>
                          {item.status}
                        </span>
                      </h4>
                      <p className="text-[9px] font-bold text-slate-400 mt-1">
                        Applied on {item.applayDate} | Duration: <span className="text-slate-700">{item.Duration}</span> ({item.Days} Days)
                      </p>
                      <p className="text-[10px] text-slate-500 italic mt-1.5 font-semibold">"{item.Reason}"</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-100 w-full max-w-md p-8 relative shadow-2xl"
            >
              <h3 className="text-lg font-black text-slate-800 mb-2">Request Time Off</h3>
              <p className="text-slate-400 text-xs font-medium mb-6">
                Complete this form to submit your personal leave request to administration.
              </p>

              {applyError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-650 text-[10px] font-extrabold flex items-center gap-2">
                  <ShieldAlert size={14} className="shrink-0" />
                  <span>{applyError}</span>
                </div>
              )}

              {submitted ? (
                <div className="py-12 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4 animate-bounce">
                    <Check size={24} />
                  </div>
                  <h4 className="text-sm font-black text-slate-800">Application Submitted!</h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">
                    Your request has been successfully filed in the ledger system.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleApplyLeave} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Leave Type</label>
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-100 rounded-xl focus:border-primary focus:outline-none text-xs font-semibold bg-slate-50/50"
                    >
                      <option value="Casual">Casual Leave</option>
                      <option value="Medical">Medical Leave</option>
                      <option value="Earned">Earned Leave</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Start Date</label>
                      <input
                        type="date"
                        required
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-100 rounded-xl focus:border-primary focus:outline-none text-xs font-semibold bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">End Date</label>
                      <input
                        type="date"
                        required
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-100 rounded-xl focus:border-primary focus:outline-none text-xs font-semibold bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Reason for Absence</label>
                    <textarea
                      required
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Provide details about your absence request..."
                      className="w-full px-3.5 py-2 border border-slate-100 rounded-xl focus:border-primary focus:outline-none text-xs font-semibold bg-slate-50/50"
                    />
                  </div>

                  <div className="flex gap-3 mt-8 pt-4 border-t border-slate-50">
                    <button
                      type="button"
                      onClick={() => setShowApplyModal(false)}
                      className="flex-1 py-3 text-[10px] font-bold text-slate-500 bg-slate-50 rounded-xl hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 text-[10px] font-bold text-white rounded-xl hover:opacity-90 cursor-pointer"
                      style={{ backgroundColor: currentPreset.primaryHex }}
                    >
                      Submit
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
