
import {
  CalendarDays,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  ReceiptIndianRupee,
 
} from "lucide-react";



export const employeeNavigation = [
  { label: "Dashboard", path: "/EmployeeManagement", icon: LayoutDashboard },
 
  {
    label: "Leaves",
    path: "/leaves",
    icon: FileSpreadsheet,
  },
  { label: "Event", path: "/events", icon: CalendarDays },
  {
    label: "Payroll",
    path: "/payroll",
    icon: ReceiptIndianRupee,
  },
  {
    label: "Task",
    path: "/tasks",
    icon: FileText,
  }
];
