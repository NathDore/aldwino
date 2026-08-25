import type { AssignmentDto } from "@/features/assignments";
import type { CourseDto } from "@/features/courses";
import { useAssignmentActions } from "../hooks/useAssignmentActions";
import { AssignmentRow } from "./AssignmentRow";

interface AssignmentListSectionProps {
  title: string;
  assignments: AssignmentDto[];
  courses: CourseDto[];
  actions: ReturnType<typeof useAssignmentActions>;
  onReschedule: (assignment: AssignmentDto) => void;
  onEdit: (assignment: AssignmentDto) => void;
  onDelete: (assignment: AssignmentDto) => void;
}

export function AssignmentListSection({
  title,
  assignments,
  courses,
  actions,
  onReschedule,
  onEdit,
  onDelete,
}: AssignmentListSectionProps) {
  if (assignments.length === 0) return null;

  return (
    <div className="flex-1 min-h-0 flex flex-col border border-slate-200 rounded-lg bg-white overflow-hidden">
      <div className="shrink-0 px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-900">
        {title} <span className="text-slate-500 font-medium">{assignments.length}</span>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto styled-scrollbar">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-left text-slate-900 font-semibold text-xs sticky top-0 z-10">
              <th className="p-1.5">Assignment</th>
              <th className="p-1.5">Course</th>
              <th className="p-1.5">Due</th>
              <th className="p-1.5">Status</th>
              <th className="p-1.5" />
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <AssignmentRow
                key={assignment.id}
                assignment={assignment}
                course={courses.find((c) => c.id === assignment.courseId)}
                actions={actions}
                onReschedule={onReschedule}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
