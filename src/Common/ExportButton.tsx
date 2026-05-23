import React from "react";
import { buttonTheme } from "../Themes/ComponentsThems/ButtonTheme";

interface Column<T> {
  header: string;
  accessor?: keyof T;
}

interface ExportButtonProps<T> {
  data: T[];
  columns: Column<T>[];
  filename?: string;
  children?: React.ReactNode;
  className?: string;
}

export const ExportCSVButton = <T,>({ 
  data, 
  columns, 
  filename = "export.csv",
  children,
  className
}: ExportButtonProps<T>) => {
  const exportToCSV = () => {
    if (!data.length) return;

    // Create CSV header
    const headers = columns.map(col => col.header);
    // Create CSV rows
    const rows = data.map(row =>
      columns.map(col => {
        const value = col.accessor ? row[col.accessor] : "";
        return `"${value}"`; // wrap in quotes to handle commas
      }).join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");

    // Create a blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={exportToCSV}
      className={className || `flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all active:scale-95 ${buttonTheme.primary}`}
    >
      {children || "Export CSV"}
    </button>
  );
};
