import { useState } from "react";
import type { CourseDto } from "@/features/courses";
import { type AssignmentDto } from "@/features/assignments";
import { CreateAssignmentForm } from "@/features/assignments/components/CreateAssignmentForm";
import { AssignmentFormPanel } from "@/features/assignments/components/AssignmentFormPanel";
import { Button } from "@/shared/components/Button";
import { Popover } from "@/shared/components/Popover";
import { Modal } from "@/shared/components/Modal";
import { DeleteConfirmation } from "@/shared/components/DeleteConfirmation";
import { PlusIcon } from "@/features/calendar/components/icons";
import { MODAL_HEIGHT, MODAL_WIDTH } from "@/shared/lib/formConstants";
import { useAssignmentGroups } from "../hooks/useAssignmentGroups";
import { useAssignmentActions } from "../hooks/useAssignmentActions";
import { AssignmentListSection } from "./AssignmentListSection";

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
      <div className="flex justify-between items-center flex-wrap gap-2.5 mb-4">
        <div className="flex gap-1.5 flex-wrap">
          {courses.map((course) => {
            const active = courseFilterIds.has(course.id);
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => toggleFilter(course.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${active ? "text-slate-900" : "text-slate-600 bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                style={active ? { borderColor: course.color, backgroundColor: `${course.color}1a` } : undefined}
              >
                <span
                  className="w-2 h-2 rounded-sm shrink-0"
                  style={{ backgroundColor: course.color }}
                  aria-hidden="true"
                />
                {course.code}
              </button>
            );
          })}
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 shrink-0"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          Add assignment
        </Button>
      </div>

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

      {isAdding && (
        <Popover
          onClose={() => setIsAdding(false)}
          panelClassName="max-w-full max-h-full"
          panelStyle={{ width: MODAL_WIDTH, height: MODAL_HEIGHT }}
          headerClassName="px-10 py-3"
          header={<p className="text-sm font-bold text-slate-900">Add assignment</p>}
        >
          {(handleClose) => (
            <div className="px-10 py-4 overflow-hidden min-h-0 flex-1">
              <CreateAssignmentForm onCreated={handleClose} onBack={handleClose} />
            </div>
          )}
        </Popover>
      )}

      {editingAssignment && (
        <Popover
          onClose={() => setEditingAssignment(null)}
          panelClassName="max-w-full max-h-full"
          panelStyle={{ width: MODAL_WIDTH, height: MODAL_HEIGHT }}
          headerClassName="px-10 py-3"
          header={<p className="text-sm font-bold text-slate-900">Edit assignment</p>}
        >
          {(handleClose) => (
            <div className="px-10 py-4 overflow-hidden min-h-0 flex-1">
              <AssignmentFormPanel assignmentToEdit={editingAssignment} onClose={handleClose} />
            </div>
          )}
        </Popover>
      )}

      {reschedulingAssignment && (
        <Popover
          onClose={() => setReschedulingAssignment(null)}
          panelClassName="max-w-full max-h-full"
          panelStyle={{ width: MODAL_WIDTH, height: MODAL_HEIGHT }}
          headerClassName="px-10 py-3"
          header={<p className="text-sm font-bold text-slate-900">Reschedule assignment</p>}
        >
          {(handleClose) => (
            <div className="px-10 py-4 overflow-hidden min-h-0 flex-1">
              <AssignmentFormPanel
                assignmentToEdit={reschedulingAssignment}
                onClose={handleClose}
                intent="reschedule"
              />
            </div>
          )}
        </Popover>
      )}

      {deletingAssignment && (
        <Modal maxWidth="max-w-md">
          <DeleteConfirmation
            title="Delete assignment?"
            description={`"${deletingAssignment.name}" will be removed. This can't be undone.`}
            isLoading={actions.isDeletePending}
            onConfirm={handleDelete}
            onCancel={() => setDeletingAssignment(null)}
          />
        </Modal>
      )}
    </div>
  );
}
