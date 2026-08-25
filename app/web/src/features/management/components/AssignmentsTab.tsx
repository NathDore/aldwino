import { useState } from "react";
import type { CourseDto } from "@/features/courses";
import {
  type AssignmentDto,
  isAssignmentCompleted,
  isAssignmentOverdue,
  isAssignmentCompletedOverdue,
  useDeleteAssignmentMutation,
  useCompleteAssignmentMutation,
  useUncompleteAssignmentMutation,
  useWrapUpAssignmentMutation,
  useWrapUpLateAssignmentMutation,
} from "@/features/assignments";
import { CreateAssignmentForm } from "@/features/assignments/components/CreateAssignmentForm";
import { AssignmentFormPanel } from "@/features/assignments/components/AssignmentFormPanel";
import { Button } from "@/shared/components/Button";
import { Popover } from "@/shared/components/Popover";
import { Modal } from "@/shared/components/Modal";
import { DeleteConfirmation } from "@/shared/components/DeleteConfirmation";
import { PlusIcon } from "@/features/calendar/components/icons";
import { MODAL_HEIGHT, MODAL_WIDTH } from "@/shared/lib/formConstants";
import { showToast } from "@/shared/store/toastStore";
import { getAssignmentStatusBadge, formatAssignmentDueDate } from "../utils/assignmentDisplay";
import { useAssignmentGroups } from "../hooks/useAssignmentGroups";
import { AssignmentRowMenu } from "./AssignmentRowMenu";

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
  const deleteMutation = useDeleteAssignmentMutation();
  const completeMutation = useCompleteAssignmentMutation();
  const uncompleteMutation = useUncompleteAssignmentMutation();
  const wrapUpMutation = useWrapUpAssignmentMutation();
  const wrapUpLateMutation = useWrapUpLateAssignmentMutation();

  const toggleFilter = (id: string) => {
    setCourseFilterIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const { overdue, uncompleted, completed, isEmpty } = useAssignmentGroups(assignments, courseFilterIds);

  const groupedRows = [overdue, uncompleted, completed]
    .filter((group) => group.length > 0)
    .flatMap((group) => group.map((assignment, index) => ({ assignment, isGroupStart: index === 0 })));

  const handleDelete = async () => {
    if (!deletingAssignment) return;
    await deleteMutation.mutateAsync(deletingAssignment.id);
    setDeletingAssignment(null);
  };

  const handleComplete = async (assignment: AssignmentDto) => {
    try {
      await completeMutation.mutateAsync(assignment.id);
    } catch (error) {
      if (error instanceof Error) showToast(error.message, "error");
    }
  };

  const handleUncomplete = async (assignment: AssignmentDto) => {
    try {
      await uncompleteMutation.mutateAsync(assignment.id);
    } catch (error) {
      if (error instanceof Error) showToast(error.message, "error");
    }
  };

  const handleWrapUp = async (assignment: AssignmentDto) => {
    try {
      await wrapUpMutation.mutateAsync(assignment.id);
    } catch (error) {
      if (error instanceof Error) showToast(error.message, "error");
    }
  };

  const handleWrapUpLate = async (assignment: AssignmentDto) => {
    try {
      await wrapUpLateMutation.mutateAsync(assignment.id);
    } catch (error) {
      if (error instanceof Error) showToast(error.message, "error");
    }
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
        <div className="border border-slate-200 rounded-lg bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-left text-slate-900 font-semibold text-xs">
                <th className="p-3">Assignment</th>
                <th className="p-3">Course</th>
                <th className="p-3">Due</th>
                <th className="p-3">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {groupedRows.map(({ assignment, isGroupStart }, rowIndex) => {
                const course = courses.find((c) => c.id === assignment.courseId);
                const status = getAssignmentStatusBadge(assignment);
                const dividerClassName = isGroupStart && rowIndex !== 0 ? "border-t-2 border-t-slate-300" : "";
                return (
                  <tr
                    key={assignment.id}
                    className={`border-b border-slate-200 last:border-b-0 hover:bg-slate-50 ${dividerClassName}`}
                  >
                    <td className="p-3 font-medium text-slate-900">{assignment.name}</td>
                    <td className="p-3 text-slate-700">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-sm shrink-0"
                          style={{ backgroundColor: course?.color ?? "#cbd5e1" }}
                          aria-hidden="true"
                        />
                        {course?.code ?? "—"}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{formatAssignmentDueDate(assignment.dueDate)}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="grid grid-cols-[6rem_1.75rem] items-center gap-1.5">
                        <div className="flex justify-end">
                          {isAssignmentCompletedOverdue(assignment) ? (
                            <Button
                              variant="success"
                              size="xs"
                              className="w-full"
                              onClick={() => handleWrapUp(assignment)}
                              disabled={wrapUpMutation.isPending}
                            >
                              Wrap up
                            </Button>
                          ) : isAssignmentCompleted(assignment) ? (
                            <Button
                              variant="primary"
                              size="xs"
                              className="w-full"
                              onClick={() => handleUncomplete(assignment)}
                              disabled={uncompleteMutation.isPending}
                            >
                              Uncomplete
                            </Button>
                          ) : isAssignmentOverdue(assignment) ? (
                            <Button
                              variant="warning"
                              size="xs"
                              className="w-full"
                              onClick={() => setReschedulingAssignment(assignment)}
                            >
                              Reschedule
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              size="xs"
                              className="w-full"
                              onClick={() => handleComplete(assignment)}
                              disabled={completeMutation.isPending}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                        <div className="flex justify-end">
                          {isAssignmentCompletedOverdue(assignment) ? null : isAssignmentCompleted(assignment) ? (
                            <AssignmentRowMenu
                              assignmentName={assignment.name}
                              items={[{ label: "Wrap up", onClick: () => handleWrapUp(assignment) }]}
                            />
                          ) : isAssignmentOverdue(assignment) ? (
                            <AssignmentRowMenu
                              assignmentName={assignment.name}
                              items={[{ label: "Wrap up - late", onClick: () => handleWrapUpLate(assignment) }]}
                            />
                          ) : (
                            <AssignmentRowMenu
                              assignmentName={assignment.name}
                              items={[
                                { label: "Edit", onClick: () => setEditingAssignment(assignment) },
                                {
                                  label: "Delete",
                                  onClick: () => setDeletingAssignment(assignment),
                                  variant: "danger",
                                },
                              ]}
                            />
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
            isLoading={deleteMutation.isPending}
            onConfirm={handleDelete}
            onCancel={() => setDeletingAssignment(null)}
          />
        </Modal>
      )}
    </div>
  );
}
