import React, { createContext, useContext, useState } from "react";
import { getCookie } from "./UserContext";

import { Api_URL } from "../APILINK";

export interface EmployeePayrollOverview {
  Emp_id: string;
  name: string;
  designation: string;
  annualSalary: number;
  payType: string;
  payFrequency: string;
}

interface PayrollContextType {
  teamSalaries: EmployeePayrollOverview[];
  loadingTeam: boolean;
  errorPayroll: string | null;
  fetchTeamSalaries: (department: string) => Promise<void>;
}

const PayrollContext = createContext<PayrollContextType | undefined>(undefined);

export const PayrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teamSalaries, setTeamSalaries] = useState<EmployeePayrollOverview[]>([]);
  const [loadingTeam, setLoadingTeam] = useState<boolean>(false);
  const [errorPayroll, setErrorPayroll] = useState<string | null>(null);

  const fetchTeamSalaries = async (department: string) => {
    if (!department) {
      setTeamSalaries([]);
      return;
    }
    setLoadingTeam(true);
    setErrorPayroll(null);
    try {
      const token = getCookie("auth_access_token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const response = await fetch(`${Api_URL}/employee/`, { headers });
      if (response.ok) {
        const allEmployees = await response.json();
        // Filter to manager's department
        const filtered = allEmployees
          .filter(
            (emp: any) =>
              emp.Department &&
              emp.Department.toLowerCase().trim() === department.toLowerCase().trim()
          )
          .map((emp: any) => ({
            Emp_id: emp.Emp_id,
            name: emp.name,
            designation: emp.designation || "Staff Member",
            annualSalary: emp.annualSalary || 0,
            payType: emp.payType || "Salary",
            payFrequency: emp.payFrequency || "Monthly",
          }));
        setTeamSalaries(filtered);
      } else {
        throw new Error("Failed to load department payroll records.");
      }
    } catch (err: any) {
      console.error("PayrollContext Fetch Error:", err);
      setErrorPayroll(err.message || "An error occurred while loading team salaries.");
    } finally {
      setLoadingTeam(false);
    }
  };

  return (
    <PayrollContext.Provider
      value={{
        teamSalaries,
        loadingTeam,
        errorPayroll,
        fetchTeamSalaries,
      }}
    >
      {children}
    </PayrollContext.Provider>
  );
};

export const usePayroll = () => {
  const context = useContext(PayrollContext);
  if (!context) {
    throw new Error("usePayroll must be used within a PayrollProvider");
  }
  return context;
};
