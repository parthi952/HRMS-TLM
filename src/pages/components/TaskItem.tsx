import React from "react";
import { Check, Clock } from "lucide-react";

interface Task {
  id: number;
  title: string;
  priority: string;
  due: string;
  status: string;
}

interface TaskItemProps {
  task: Task;
  primaryHex: string;
  onToggle: (id: number) => void;
}

/**
 * TaskItem — a single row in the Task Manager list.
 * Renders the toggle button, title, priority badge, and due date.
 */
export const TaskItem: React.FC<TaskItemProps> = ({ task, primaryHex, onToggle }) => {
  const isCompleted = task.status === "Completed";

  return (
    <div className="py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {/* Toggle completion circle button */}
        <button
          onClick={() => onToggle(task.id)}
          className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
            isCompleted
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-slate-350 bg-white"
          }`}
        >
          {isCompleted && <Check size={10} />}
        </button>

        <div>
          {/* Task title */}
          <p
            className={`text-xs font-bold ${
              isCompleted ? "text-slate-400 line-through font-semibold" : "text-slate-700"
            }`}
          >
            {task.title}
          </p>

          {/* Priority badge + due date */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              className="px-2 py-0.5 rounded text-[7px] font-extrabold uppercase tracking-wider"
              style={{
                color:
                  task.priority === "High"
                    ? "#ef4444"
                    : task.priority === "Medium"
                    ? primaryHex
                    : "#64748b",
                backgroundColor:
                  task.priority === "High"
                    ? "#fef2f2"
                    : task.priority === "Medium"
                    ? `${primaryHex}10`
                    : "#f1f5f9",
              }}
            >
              {task.priority} Priority
            </span>

            <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1">
              <Clock size={8} className="shrink-0" />
              Due {task.due}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
