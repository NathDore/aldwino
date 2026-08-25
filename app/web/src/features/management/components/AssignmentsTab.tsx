import { useState } from "react";
import type { CourseDto } from "@/features/courses";
import { type AssignmentDto } from "@/features/assignments";
import { useAssignmentList } from "../hooks/useAssignmentList";
import { useAssignmentActions } from "../hooks/useAssignmentActions";
import type { AssignmentStatusFilterValue } from "../utils/assignmentGrouping";
import { AssignmentList } from "./AssignmentList";
import { AssignmentFilterBar } from "./AssignmentFilterBar";
import { AssignmentDialogs } from "./AssignmentDialogs";

interface AssignmentsTabProps {
  assignments: AssignmentDto[];
  courses: CourseDto[];
}

export function AssignmentsTab({ assignments, courses }: AssignmentsTabProps) {
  const [courseFilterIds, setCourseFilterIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<AssignmentStatusFilterValue>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentDto | null>(null);
  const [reschedulingAssignment, setReschedulingAssignment] = useState<AssignmentDto | null>(null);
  const [deletingAssignment, setDeletingAssignment] = useState<AssignmentDto | null>(null);
  const actions = useAssignmentActions();

  const toggleCourseFilter = (id: string) => {
    setCourseFilterIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleStatusFilter = (value: AssignmentStatusFilterValue) => {
    setStatusFilter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const { rows, isEmpty } = useAssignmentList(assignments, courseFilterIds, statusFilter);

  const handleDelete = async () => {
    if (!deletingAssignment) return;
    await actions.delete(deletingAssignment);
    setDeletingAssignment(null);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <AssignmentFilterBar
        courses={courses}
        courseFilterIds={courseFilterIds}
        onToggleCourseFilter={toggleCourseFilter}
        statusFilter={statusFilter}
        onToggleStatusFilter={toggleStatusFilter}
        onAddClick={() => setIsAdding(true)}
      />

      {isEmpty ? (
        <p className="text-center py-16 text-slate-600 text-sm">No assignments match this filter.</p>
      ) : (
        <AssignmentList
          assignments={rows}
          courses={courses}
          actions={actions}
          onReschedule={setReschedulingAssignment}
          onEdit={setEditingAssignment}
          onDelete={setDeletingAssignment}
        />
      )}

      <AssignmentDialogs
        isAdding={isAdding}
        onCloseAdding={() => setIsAdding(false)}
        editingAssignment={editingAssignment}
        onCloseEditing={() => setEditingAssignment(null)}
        reschedulingAssignment={reschedulingAssignment}
        onCloseRescheduling={() => setReschedulingAssignment(null)}
        deletingAssignment={deletingAssignment}
        onCloseDeleting={() => setDeletingAssignment(null)}
        onConfirmDelete={handleDelete}
        isDeletePending={actions.isDeletePending}
      />
    </div>
  );
}
