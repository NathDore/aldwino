import { useState } from "react";
import { type CourseDto, EditCourseForm, useDeleteCourseMutation } from "@/features/courses";
import { InlineCourseForm } from "@/features/courses/components/InlineCourseForm";
import type { AssignmentDto } from "@/features/assignments";
import { Button } from "@/shared/components/Button";
import { Popover } from "@/shared/components/Popover";
import { Modal } from "@/shared/components/Modal";
import { DeleteConfirmation } from "@/shared/components/DeleteConfirmation";
import { PlusIcon, PencilIcon, TrashIcon } from "@/features/calendar/components/icons";
import { MODAL_HEIGHT, MODAL_WIDTH } from "@/shared/lib/formConstants";

interface CoursesTabProps {
  courses: CourseDto[];
  assignments: AssignmentDto[];
}

export function CoursesTab({ courses, assignments }: CoursesTabProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseDto | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<CourseDto | null>(null);
  const deleteMutation = useDeleteCourseMutation();

  const handleDelete = async () => {
    if (!deletingCourse) return;
    await deleteMutation.mutateAsync(deletingCourse.id);
    setDeletingCourse(null);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="secondary" size="sm" onClick={() => setIsAdding(true)} className="flex items-center gap-1.5">
          <PlusIcon className="w-3.5 h-3.5" />
          Add course
        </Button>
      </div>

      {courses.length === 0 ? (
        <p className="text-center py-16 text-slate-600 text-sm">No courses yet. Add your first course to get started.</p>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {courses.map((course) => {
            const count = assignments.filter((a) => a.courseId === course.id).length;
            return (
              <div
                key={course.id}
                className="bg-white border border-slate-200 rounded-lg p-4 flex justify-between items-start gap-2"
                style={{ borderLeft: `4px solid ${course.color}` }}
              >
                <div className="min-w-0 flex flex-col gap-1">
                  <div className="text-xs font-bold text-slate-600 uppercase tracking-wide">{course.code}</div>
                  <div className="text-base font-semibold text-slate-900 leading-tight">{course.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {count} assignment{count === 1 ? "" : "s"}
                  </div>
                </div>
                <div className="flex gap-0.5 shrink-0">
                  <button
                    type="button"
                    aria-label="Edit course"
                    onClick={() => setEditingCourse(course)}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-slate-700 hover:bg-slate-100"
                  >
                    <PencilIcon />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete course"
                    onClick={() => setDeletingCourse(course)}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-slate-700 hover:bg-red-50 hover:text-red-600"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isAdding && (
        <Popover
          onClose={() => setIsAdding(false)}
          panelClassName="max-w-full max-h-full"
          panelStyle={{ width: MODAL_WIDTH, height: MODAL_HEIGHT }}
          headerClassName="px-10 py-3"
          header={<p className="text-sm font-bold text-slate-900">Add course</p>}
        >
          {(handleClose) => (
            <div className="px-10 py-4 overflow-hidden min-h-0 flex-1">
              <InlineCourseForm onCreated={handleClose} onBack={handleClose} />
            </div>
          )}
        </Popover>
      )}

      {editingCourse && (
        <Popover
          onClose={() => setEditingCourse(null)}
          panelClassName="max-w-full max-h-full"
          panelStyle={{ width: MODAL_WIDTH, height: MODAL_HEIGHT }}
          headerClassName="px-10 py-3"
          header={<p className="text-sm font-bold text-slate-900">Edit course</p>}
        >
          {(handleClose) => (
            <div className="px-10 py-4 overflow-hidden min-h-0 flex-1">
              <EditCourseForm courseToEdit={editingCourse} onSaved={handleClose} onCancel={handleClose} />
            </div>
          )}
        </Popover>
      )}

      {deletingCourse && (
        <Modal maxWidth="max-w-md">
          <DeleteConfirmation
            title="Delete course?"
            description={`"${deletingCourse.title}" and its ${assignments.filter((a) => a.courseId === deletingCourse.id).length} assignment(s) will be removed. This can't be undone.`}
            isLoading={deleteMutation.isPending}
            onConfirm={handleDelete}
            onCancel={() => setDeletingCourse(null)}
          />
        </Modal>
      )}
    </div>
  );
}
