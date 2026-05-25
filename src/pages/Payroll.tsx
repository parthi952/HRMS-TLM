import React, { useState, useEffect } from "react";
import { Download, Landmark, Wallet, ShieldAlert, CreditCard, CloudLightning, CheckCircle } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useUserData } from "../Context/UserData";
import { useUser } from "../Context/UserContext";
import { usePayroll } from "../Context/PayrollContext";
import { Api_URL } from "../APILINK";

export const Payroll: React.FC = () => {
  const { currentPreset } = useTheme();
  const { employeeData, loading: loadingMyPayroll } = useUserData();
  const { user } = useUser();

  const [activeTab, setActiveTab] = useState<"myPayroll" | "teamPayroll">("myPayroll");
  const { teamSalaries, loadingTeam, fetchTeamSalaries } = usePayroll();

  const [uploadingEmpId, setUploadingEmpId] = useState<string | null>(null);
  const [uploadedEmpIds, setUploadedEmpIds] = useState<Record<string, string>>({});

  const managerDept = employeeData?.profile?.Department || "";

  // Fetch Team Salary details for auditing via PayrollContext
  useEffect(() => {
    if (user && activeTab === "teamPayroll" && managerDept) {
      fetchTeamSalaries(managerDept);
    }
  }, [user, managerDept, activeTab]);

  // Format currency helper
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: employeeData?.profile?.currency || "USD"
    }).format(val);
  };

  // Generate dynamic slip history registry based on current salary
  const generatePayslips = () => {
    if (!employeeData) return [];
    const months = ["April 2026", "March 2026", "February 2026"];
    const base = employeeData.base_salary;
    const net = employeeData.net_salary;

    return months.map((m, idx) => {
      // Add slight variance to mock monthly bonuses or deductions
      const variance = idx === 0 ? 250 : idx === 2 ? -50 : 0;
      const actualNet = net + variance;
      return {
        month: m,
        basic: formatMoney(base),
        net: formatMoney(actualNet),
        bonus: variance > 0 ? formatMoney(variance) : formatMoney(0),
        deductions: variance < 0 ? formatMoney(Math.abs(variance)) : formatMoney(0)
      };
    });
  };

  const slips = generatePayslips();

  // Handle on-the-fly payslip compile and download fallback for own profile
  const handleOnTheFlyDownload = async (monthName: string) => {
    if (!user?.empId) return;
    try {
      const token = document.cookie
        .split("; ")
        .find(row => row.startsWith("auth_access_token="))
        ?.split("=")[1];

      const response = await fetch(`${Api_URL}/pdf/payslip/${user.empId}?month=${encodeURIComponent(monthName)}`, {
        headers: {
          ...(token ? { "Authorization": `Bearer ${decodeURIComponent(token)}` } : {})
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `payslip_${user.empId}_${monthName.replace(" ", "_")}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        alert("Failed to render and compile payslip PDF.");
      }
    } catch (err) {
      console.error(err);
      alert("Error initiating payslip generation.");
    }
  };

  // Compile and upload a team member's payslip to Azure Blob Container
  const handleGenerateAndUpload = async (empId: string) => {
    setUploadingEmpId(empId);
    try {
      const token = document.cookie
        .split("; ")
        .find(row => row.startsWith("auth_access_token="))
        ?.split("=")[1];

      const response = await fetch(`${Api_URL}/pdf/payslip/${empId}/generate-and-upload?month=May%202026`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${decodeURIComponent(token)}` } : {})
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUploadedEmpIds(prev => ({ ...prev, [empId]: data.url }));
        alert("Payslip compiled and successfully uploaded to Azure Blob Container!");
      } else {
        const err = await response.json().catch(() => ({}));
        alert(err.detail || "Failed to generate and upload payslip.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error during payslip compilation and storage upload.");
    } finally {
      setUploadingEmpId(null);
    }
  };

  return (
    <div className="p-8 bg-bg min-h-full font-sans overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="mb-8">
        <span
          className="px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest rounded-full"
          style={{ color: currentPreset.primaryHex, backgroundColor: `${currentPreset.primaryHex}15` }}
        >
          Salary & Compensation
        </span>
        <div
          className="text-3xl tracking-tight mt-2 leading-none"
          style={{ color: currentPreset.primaryHex, fontFamily: currentPreset.titleFont, fontWeight: 900 }}
        >
          Payroll Ledger
        </div>
        <p className="text-slate-400 text-xs font-semibold mt-1.5">
          Access your dynamic paychecks, allowances structures, and department compensation audits.
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-6 border-b border-slate-200/50 pb-3 mb-6">
        <button
          onClick={() => setActiveTab("myPayroll")}
          className="text-sm font-black transition-colors relative pb-3 -mb-[13px] cursor-pointer"
          style={{ color: activeTab === "myPayroll" ? currentPreset.primaryHex : "#94a3b8" }}
        >
          My Payslips & Breakdown
        </button>
        <button
          onClick={() => setActiveTab("teamPayroll")}
          className="text-sm font-black transition-colors relative pb-3 -mb-[13px] cursor-pointer"
          style={{ color: activeTab === "teamPayroll" ? currentPreset.primaryHex : "#94a3b8" }}
        >
          Team Compensation Audit
        </button>
      </div>

      {/* Tab A: My Payroll Details */}
      {activeTab === "myPayroll" && (
        <div className="space-y-8">
          {loadingMyPayroll ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-40 bg-slate-50 rounded-3xl" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-48 bg-slate-50 rounded-2xl" />
                <div className="h-48 bg-slate-50 rounded-2xl" />
              </div>
            </div>
          ) : !employeeData ? (
            <div className="bg-red-50 border border-red-150 p-6 rounded-2xl text-center max-w-md mx-auto py-12">
              <ShieldAlert className="text-red-500 mx-auto mb-3" size={32} />
              <h4 className="text-sm font-black text-slate-800">Compensation File Missing</h4>
              <p className="text-slate-555 text-[10px] mt-1 font-semibold">
                Could not retrieve active salary details for your profile. Please contact human resources.
              </p>
            </div>
          ) : (
            <>
              {/* Dynamic Summary Glass Card */}
              <div
                className={`bg-gradient-to-br ${currentPreset.bannerGradient} rounded-[32px] p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden`}
              >
                {/* Backdrop design sparkles */}
                <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center justify-center pointer-events-none pr-8">
                  <Landmark size={240} />
                </div>

                <div className="relative z-10">
                  <span className="text-[10px] text-white/80 font-extrabold uppercase tracking-wider block">
                    Calculated Monthly Net Pay
                  </span>
                  <h3 className="text-4xl font-black mt-2 mb-1.5">
                    {formatMoney(employeeData.net_salary)}
                  </h3>
                  <p className="text-white/85 text-[10px] font-bold flex items-center gap-1">
                    <Wallet size={12} />
                    Current Base: {formatMoney(employeeData.base_salary)}
                  </p>
                </div>

                <div className="relative z-10 space-y-2 text-[11px] font-bold text-white/80 border-t md:border-t-0 md:border-l border-white/20 pt-4 md:pt-0 md:pl-8 min-w-[200px]">
                  <div className="flex justify-between gap-6">
                    <span>Base monthly:</span>
                    <span className="text-white font-black">{formatMoney(employeeData.base_salary)}</span>
                  </div>
                  <div className="flex justify-between gap-6">
                    <span>Gross Earnings:</span>
                    <span className="text-emerald-300 font-black">+{formatMoney(employeeData.total_earnings)}</span>
                  </div>
                  <div className="flex justify-between gap-6 border-b border-white/10 pb-1.5">
                    <span>Deductions:</span>
                    <span className="text-red-300 font-black">-{formatMoney(employeeData.total_deductions)}</span>
                  </div>
                  <div className="flex justify-between gap-6 pt-0.5 text-xs">
                    <span className="text-white font-black">Take Home (Net):</span>
                    <span className="text-white font-black">{formatMoney(employeeData.net_salary)}</span>
                  </div>
                </div>
              </div>

              {/* Earnings & Deductions Breakdown Tables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Component A: Earnings / Allowances Breakdown */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-1.5">
                      <CreditCard size={14} className="text-emerald-500" />
                      Earnings & Allowances
                    </h4>
                    {employeeData.earnings_breakdown?.length === 0 ? (
                      <p className="text-[10px] text-slate-400 font-semibold text-center py-6">
                        No supplementary allowances registered in contract.
                      </p>
                    ) : (
                      <div className="space-y-3.5">
                        {employeeData.earnings_breakdown?.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center bg-slate-50/50 border border-slate-100 p-3 rounded-xl"
                          >
                            <div>
                              <p className="text-xs font-black text-slate-800">{item.name || item.component}</p>
                              <p className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">
                                Type: {item.calculation_type || "Flat"}
                              </p>
                            </div>
                            <span className="text-xs font-black text-emerald-600">
                              +{formatMoney(item.amount || item.value || 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="border-t border-slate-50 pt-4 mt-6 flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <span>Total Allowances:</span>
                    <span className="text-emerald-600 font-black text-xs">
                      +{formatMoney(employeeData.total_earnings)}
                    </span>
                  </div>
                </div>

                {/* Component B: Deductions Breakdown */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-1.5">
                      <Landmark size={14} className="text-red-500" />
                      Deductions & Offsets
                    </h4>
                    {employeeData.deductions_breakdown?.length === 0 ? (
                      <p className="text-[10px] text-slate-400 font-semibold text-center py-6">
                        No active deductions or offsets applied to salary.
                      </p>
                    ) : (
                      <div className="space-y-3.5">
                        {employeeData.deductions_breakdown?.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center bg-slate-50/50 border border-slate-100 p-3 rounded-xl"
                          >
                            <div>
                              <p className="text-xs font-black text-slate-800">{item.name || item.component}</p>
                              <p className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">
                                Type: {item.calculation_type || "Flat"}
                              </p>
                            </div>
                            <span className="text-xs font-black text-red-500">
                              -{formatMoney(item.amount || item.value || 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="border-t border-slate-50 pt-4 mt-6 flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <span>Total Deductions:</span>
                    <span className="text-red-500 font-black text-xs">
                      -{formatMoney(employeeData.total_deductions)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Salary Payslip Registry */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Salary Slip Registry
                  </h3>
                </div>
                <div className="divide-y divide-slate-50">
                  {slips.map((slip, idx) => (
                    <div
                      key={idx}
                      className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/30 transition-colors"
                    >
                      <div>
                        <p className="text-xs font-black text-slate-800">{slip.month}</p>
                        <p
                          className="text-[10px] font-semibold mt-0.5"
                          style={{ color: currentPreset.primaryHex }}
                        >
                          Net Deposited: {slip.net} (Basic: {slip.basic}
                          {parseFloat(slip.bonus.replace(/[^0-9.]/g, "")) > 0 && ` | Bonus: ${slip.bonus}`}
                          {parseFloat(slip.deductions.replace(/[^0-9.]/g, "")) > 0 && ` | Deductions: ${slip.deductions}`}
                          )
                        </p>
                      </div>
                      <button 
                        onClick={() => handleOnTheFlyDownload(slip.month)}
                        className="flex items-center gap-1.5 py-2 px-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors text-[10px] font-bold text-slate-650 bg-white shadow-sm cursor-pointer hover:border-slate-200"
                      >
                        <Download size={12} style={{ color: currentPreset.primaryHex }} />
                        Download PDF
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab B: Team Compensation (Manager Auditing) */}
      {activeTab === "teamPayroll" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Department Roster Salaries & Contracts
            </h3>
            <span className="bg-blue-100 text-blue-800 text-[8px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
              {managerDept || "Staff"}
            </span>
          </div>

          {loadingTeam ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-slate-50 rounded" />
              <div className="h-20 bg-slate-50 rounded" />
            </div>
          ) : teamSalaries.length === 0 ? (
            <p className="text-[10px] text-slate-400 font-semibold text-center py-6">
              No payroll accounts found in your department roster.
            </p>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-[10px] font-bold text-slate-650 border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[8px] font-extrabold uppercase tracking-widest text-left">
                    <th className="py-2.5 pr-4">Team Member</th>
                    <th className="py-2.5 px-4 text-center">Designation</th>
                    <th className="py-2.5 px-4 text-center">Frequency</th>
                    <th className="py-2.5 px-4 text-right">Annual Package</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {teamSalaries.map((emp) => {
                    const isUploading = uploadingEmpId === emp.Emp_id;
                    const blobUrl = uploadedEmpIds[emp.Emp_id];

                    return (
                      <tr key={emp.Emp_id} className="hover:bg-slate-50/20 transition-colors">
                        <td className="py-3 pr-4">
                          <p className="text-slate-800 font-black">{emp.name}</p>
                          <p className="text-[8px] text-slate-400 font-extrabold">{emp.Emp_id}</p>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-700 font-bold">{emp.designation}</td>
                        <td className="py-3 px-4 text-center text-slate-500 font-semibold">
                          {emp.payFrequency} ({emp.payType})
                        </td>
                        <td className="py-3 px-4 text-right text-slate-800 font-black text-xs">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: employeeData?.profile?.currency || "USD",
                            maximumFractionDigits: 0
                          }).format(emp.annualSalary)}{" "}
                          / yr
                        </td>
                        <td className="py-3 px-4 text-right">
                          {blobUrl ? (
                            <a
                              href={blobUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl shadow-sm border border-emerald-100 hover:bg-emerald-100 transition-colors"
                            >
                              <CheckCircle size={10} />
                              View Cloud Slip
                            </a>
                          ) : (
                            <button
                              onClick={() => handleGenerateAndUpload(emp.Emp_id)}
                              disabled={isUploading || uploadingEmpId !== null}
                              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-slate-100 shadow-sm text-[9px] font-extrabold cursor-pointer hover:bg-slate-50 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CloudLightning size={10} style={{ color: currentPreset.primaryHex }} />
                              {isUploading ? "Uploading..." : "Issue Payslip PDF"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
