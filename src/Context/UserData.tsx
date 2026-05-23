import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useUser } from "./UserContext";
import { Api_URL } from "../APILINK";

// --- Types & Interfaces for Employee Data ---
export interface EmployeeProfile {
  Emp_id: string;
  f_name: string;
  l_name: string;
  name: string;
  gender: string;
  dob: string;
  phone: string;
  email: string;
  Department: string;
  designation: string;
  emp_type: string;
  DateOfJoining: string;
  Street: string;
  City: string;
  State: string;
  Pin_Code: string;
  p_Street: string;
  p_City: string;
  p_State: string;
  p_Pin_Code: string;
  provider: string;
  payType: string;
  currency: string;
  payFrequency: string;
  annualSalary: number;
  bonus_Type: string;
  bonus_CalculationMode: string;
  bonus_Value: number;
  apply_esi: boolean;
  uan_number: string;
  pf_id: string;
  insurance_no: string;
  aadhar_no: string;
  esi_no: string;
  esi_name: string;
  insurance_provider: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  panNumber: string;
}

export interface EducationDetail {
  id: number;
  emp_id: string;
  degree: string;
  institution: string;
  graduationYear: string;
}

export interface FamilyDetail {
  id: number;
  emp_id: string;
  person_name: string;
  relationship_type: string;
  contact: string;
  person_dob: string;
}

export interface WorkExperienceDetail {
  id: number;
  emp_id: string;
  company_name: string;
  position: string;
  FromDate: string;
  ToDate: string;
}

export interface EmployeeData {
  profile: EmployeeProfile | null;
  base_salary: number;
  total_earnings: number;
  total_deductions: number;
  net_salary: number;
  earnings_breakdown: any[];
  deductions_breakdown: any[];
  education: EducationDetail[];
  family: FamilyDetail[];
  experience: WorkExperienceDetail[];
}

interface UserDataContextType {
  employeeData: EmployeeData | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

const API_BASE_URL = `${Api_URL}`;

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useUser();
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    // If not authenticated or no empId is assigned yet, reset data
    if (!isAuthenticated || !user?.empId) {
      setEmployeeData(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Retrieve access token from cookies securely
    const token = document.cookie
      .split("; ")
      .find(row => row.startsWith("auth_access_token="))
      ?.split("=")[1];

    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${decodeURIComponent(token)}`;
    }

    try {
      // 1. Fetch employee details and payroll calculation
      const profileRes = await fetch(`${API_BASE_URL}/employee/${user.empId}`, { headers });
      if (!profileRes.ok) {
        throw new Error(`Failed to load employee profile details (Status: ${profileRes.status})`);
      }
      const profileResult = await profileRes.json();

      // 2. Fetch education history
      let education: EducationDetail[] = [];
      try {
        const eduRes = await fetch(`${API_BASE_URL}/employee/EmployeeEducation/${user.empId}`, { headers });
        if (eduRes.ok) {
          education = await eduRes.json();
        }
      } catch (e) {
        console.warn("Could not retrieve educational history:", e);
      }

      // 3. Fetch family and dependents info
      let family: FamilyDetail[] = [];
      try {
        const famRes = await fetch(`${API_BASE_URL}/employee/EmployeeFamilys/${user.empId}`, { headers });
        if (famRes.ok) {
          family = await famRes.json();
        }
      } catch (e) {
        console.warn("Could not retrieve family credentials:", e);
      }

      // 4. Fetch professional work experience
      let experience: WorkExperienceDetail[] = [];
      try {
        const expRes = await fetch(`${API_BASE_URL}/employee/EmployeeWorkExp/${user.empId}`, { headers });
        if (expRes.ok) {
          experience = await expRes.json();
        }
      } catch (e) {
        console.warn("Could not retrieve work experience:", e);
      }

      // Merge all datasets into one high-fidelity container
      setEmployeeData({
        profile: profileResult.Employee || null,
        base_salary: profileResult.base_salary || 0,
        total_earnings: profileResult.total_earnings || 0,
        total_deductions: profileResult.total_deductions || 0,
        net_salary: profileResult.net_salary || 0,
        earnings_breakdown: profileResult.earnings_breakdown || [],
        deductions_breakdown: profileResult.deductions_breakdown || [],
        education,
        family,
        experience,
      });

    } catch (err: any) {
      console.error("Employee Data Access Error:", err);
      setError(err.message || "Failed to load employee database records.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Synchronize dynamic updates when login state changes
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return (
    <UserDataContext.Provider
      value={{
        employeeData,
        loading,
        error,
        refreshData: fetchAllData,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
};
