import { useState } from "react";
import type { CourseDto } from "@/features/courses";
import { type AssignmentDto } from "@/features/assignments";
import { useAssignmentGroups } from "../hooks/useAssignmentGroups";
import { useAssignmentActions } from "../hooks/useAssignmentActions";
import { AssignmentListSection } from "./AssignmentListSection";
import { AssignmentCourseFilterBar } from "./AssignmentCourseFilterBar";
import { AssignmentDialogs } from "./AssignmentDialogs";

interface AssignmentsTabProps {
  assignments: AssignmentDto[];
  courses: CourseDto[];
}

export function AssignmentsTab({ assignments, courses }: AssignmentsTabProps) {
  const [courseFilterIds, setCourseFilterIds] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentDto | null>(null);
  const [reschedulingAssignment, setReschedulingAssignment] = useState<AssignmentDto | null>(null);
  const [deletingAssignment, setDeletingAssignment] = useState<AssignmentDto | null>(null);
  const actions = useAssignmentActions();

  const toggleFilter = (id: string) => {
    setCourseFilterIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const { overdue, uncompleted, completed, isEmpty } = useAssignmentGroups(assignments, courseFilterIds);

  const handleDelete = async () => {
    if (!deletingAssignment) return;
    await actions.delete(deletingAssignment);
    setDeletingAssignment(null);
  };

  return (
    <div>
      <AssignmentCourseFilterBar
        courses={courses}
        courseFilterIds={courseFilterIds}
        onToggleFilter={toggleFilter}
        onAddClick={() => setIsAdding(true)}
      />

      {isEmpty ? (
        <p className="text-center py-16 text-slate-600 text-sm">No assignments match this filter.</p>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col gap-4">
          <AssignmentListSection
            title="Overdue"
            assignments={overdue}
            courses={courses}
            actions={actions}
            onReschedule={setReschedulingAssignment}
            onEdit={setEditingAssignment}
            onDelete={setDeletingAssignment}
          />
          <AssignmentListSection
            title="Uncompleted"
            assignments={uncompleted}
            courses={courses}
            actions={actions}
            onReschedule={setReschedulingAssignment}
            onEdit={setEditingAssignment}
            onDelete={setDeletingAssignment}
          />
          <AssignmentListSection
            title="Completed"
            assignments={completed}
            courses={courses}
            actions={actions}
            onReschedule={setReschedulingAssignment}
            onEdit={setEditingAssignment}
            onDelete={setDeletingAssignment}
          />
        </div>
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
