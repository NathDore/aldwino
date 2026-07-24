import { useState } from "react";
import type { AssignmentDto } from "../types/assignment.types";
import type { CourseDto } from "@/features/courses";
import { useAssignmentDayGroups } from "../hooks/useAssignmentDayGroups";
import { DayAssignmentsPopover } from "./DayAssignmentsPopover";
import { Button } from "@/shared/components/Button";

interface AssignmentDayGridProps {
  assignments: AssignmentDto[];
  courses: CourseDto[];
  isLoading: boolean;
  onDeleteAssignment: (id: string) => void;
}

const DAYS_PER_PAGE = 12;

export function AssignmentDayGrid({
  assignments,
  courses,
  isLoading,
  onDeleteAssignment,
}: AssignmentDayGridProps) {
  const dayGroups = useAssignmentDayGroups(assignments);
  const [page, setPage] = useState(0);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  if (isLoading) {
    return <div className="text-slate-400">Loading assignments...</div>;
  }

  if (dayGroups.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600 text-sm">
          No study time scheduled yet — create your first assignment above.
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(dayGroups.length / DAYS_PER_PAGE);
  const currentPage = Math.min(page, totalPages - 1);
  const pageGroups = dayGroups.slice(currentPage * DAYS_PER_PAGE, currentPage * DAYS_PER_PAGE + DAYS_PER_PAGE);
  const selectedDayGroup = selectedDayKey ? dayGroups.find((g) => g.dayKey === selectedDayKey) ?? null : null;

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-3">Study Time</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {pageGroups.map((group) => (
          <button
            key={group.dayKey}
            onClick={() => setSelectedDayKey(group.dayKey)}
            className="text-left bg-slate-50 border border-slate-200 rounded p-4 hover:bg-slate-100 transition-colors"
          >
            <p className="text-sm font-semibold text-slate-900">{group.dayLabel}</p>
            <p className="text-xs text-slate-600 mt-1">
              {group.assignments.length} assignment{group.assignments.length === 1 ? "" : "s"}
            </p>
          </button>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          <span className="text-sm text-slate-600">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}

      {selectedDayGroup && (
        <DayAssignmentsPopover
          dayGroup={selectedDayGroup}
          courses={courses}
          onClose={() => setSelectedDayKey(null)}
          onDelete={onDeleteAssignment}
        />
      )}
    </div>
  );
}
