import React from "react";
import { Calendar, FolderGit2 } from "lucide-react";

interface DailyProgressReport {
  id: number;
  Emp_id: string;
  Date: string;
  Category: string;
  Description: string;
  Hours_Spent: number;
  employee_name?: string;
}

interface ReportCardProps {
  report: DailyProgressReport;
  primaryHex: string;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, primaryHex }) => {
  // Generate random gradient for user initials placeholder avatar
  const initials = (report.employee_name || report.Emp_id || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      className="group relative p-5 border border-slate-100 bg-white rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md hover:border-slate-200/60 transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* Accent glow on hover */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all duration-300 group-hover:h-full group-hover:rounded-l-2xl"
        style={{ backgroundColor: primaryHex, height: "40%" }}
      />

      <div className="flex items-start gap-4 min-w-0 flex-1">
        {/* Employee Avatar Badge */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-inner shrink-0 text-white select-none bg-gradient-to-tr"
          style={{
            backgroundImage: `linear-gradient(135deg, ${primaryHex}bb, ${primaryHex})`,
          }}
        >
          {initials}
        </div>

        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-xs font-black text-slate-800 tracking-tight">
              {report.employee_name || "Department Staff"}
            </h4>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
              • {report.Emp_id}
            </span>
          </div>

          <p className="text-[10px] text-slate-550 font-medium leading-relaxed italic bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50 mt-1.5 block">
            "{report.Description}"
          </p>

          <div className="flex items-center gap-3.5 text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mt-3 flex-wrap">
            <span className="bg-slate-50 border border-slate-100 text-slate-650 px-2 py-0.5 rounded-md flex items-center gap-1 font-black">
              <FolderGit2 size={9} style={{ color: primaryHex }} />
              Category: {report.Category}
            </span>
            <span className="flex items-center gap-1 text-[9px] font-semibold text-slate-400">
              <Calendar size={9} />
              Logged: {report.Date}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Hour badge indicator */}
      <div
        className="shrink-0 border border-slate-100 p-2.5 rounded-2xl text-center bg-slate-50/20 shadow-inner min-w-[90px] self-end md:self-center flex flex-col items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:shadow-sm"
      >
        <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest block">
          Hours Logged
        </span>
        <strong
          className="text-lg font-black mt-0.5 block tracking-tight"
          style={{ color: primaryHex }}
        >
          {report.Hours_Spent} hrs
        </strong>
      </div>
    </div>
  );
};
