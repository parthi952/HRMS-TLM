import React, { createContext, useContext, useState } from "react";
import { getCookie } from "./UserContext";
import { Api_URL } from "../APILINK";

export interface AssignedTask {
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

interface TaskContextType {
  tasks: AssignedTask[];
  loadingTasks: boolean;
  errorTasks: string | null;
  fetchTasks: () => Promise<void>;
  assignTask: (taskData: Omit<AssignedTask, "Assigned_By" | "Status">) => Promise<boolean>;
  updateTaskStatus: (taskId: number, newStatus: string) => Promise<boolean>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const API_BASE_URL = `${Api_URL}`;

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(true);
  const [errorTasks, setErrorTasks] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoadingTasks(true);
    setErrorTasks(null);
    try {
      const token = getCookie("auth_access_token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch(`${API_BASE_URL}/daily-tasks/all-tasks`, { headers });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      } else {
        // Fallback to my-tasks
        const fallbackRes = await fetch(`${API_BASE_URL}/daily-tasks/my-tasks`, { headers });
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          setTasks(data);
        } else {
          throw new Error("Failed to retrieve operational objectives.");
        }
      }
    } catch (err: any) {
      console.error("TaskContext Fetch Error:", err);
      setErrorTasks(err.message || "An error occurred while loading tasks.");
    } finally {
      setLoadingTasks(false);
    }
  };

  const assignTask = async (taskData: any): Promise<boolean> => {
    try {
      const token = getCookie("auth_access_token");
      const res = await fetch(`${API_BASE_URL}/daily-tasks/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(taskData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Task parameters rejected by core planner.");
      }

      await fetchTasks(); // automatically reload
      return true;
    } catch (err) {
      console.error("TaskContext Assign Error:", err);
      throw err;
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: string): Promise<boolean> => {
    try {
      const token = getCookie("auth_access_token");
      const res = await fetch(`${API_BASE_URL}/daily-tasks/task/${taskId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ Status: newStatus }),
      });

      if (res.ok) {
        // Optimistically update the status locally to make the UI instant
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            (t.id || t.ID) === taskId ? { ...t, Status: newStatus } : t
          )
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error("TaskContext Update Status Error:", err);
      return false;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loadingTasks,
        errorTasks,
        fetchTasks,
        assignTask,
        updateTaskStatus,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};
