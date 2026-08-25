import type { AssignmentStatusFilterValue } from "../utils/assignmentGrouping";

interface StatusOption {
  value: AssignmentStatusFilterValue;
  label: string;
  activeClassName: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  { value: "overdue", label: "Overdue", activeClassName: "bg-amber-50 text-amber-700 border-amber-300" },
  { value: "uncompleted", label: "Uncompleted", activeClassName: "bg-slate-100 text-slate-900 border-slate-300" },
  { value: "completed", label: "Completed", activeClassName: "bg-emerald-50 text-emerald-700 border-emerald-300" },
];

interface AssignmentStatusFilterPillsProps {
  value: Set<AssignmentStatusFilterValue>;
  onToggle: (value: AssignmentStatusFilterValue) => void;
}

export function AssignmentStatusFilterPills({ value, onToggle }: AssignmentStatusFilterPillsProps) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {STATUS_OPTIONS.map((option) => {
        const active = value.has(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onToggle(option.value)}
            className={`px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${active ? option.activeClassName : "text-slate-600 bg-white border-slate-200 hover:bg-slate-50"
              }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
