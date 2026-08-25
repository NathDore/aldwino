import type { AssignmentDto } from "@/features/assignments";
import type { CourseDto } from "@/features/courses";
import { useAssignmentActions } from "../hooks/useAssignmentActions";
import { AssignmentRow } from "./AssignmentRow";
import { ASSIGNMENT_ROW_GRID, getAssignmentListBodyHeightPx } from "../utils/assignmentRowLayout";

interface AssignmentListProps {
  assignments: AssignmentDto[];
  courses: CourseDto[];
  actions: ReturnType<typeof useAssignmentActions>;
  onReschedule: (assignment: AssignmentDto) => void;
  onEdit: (assignment: AssignmentDto) => void;
  onDelete: (assignment: AssignmentDto) => void;
}

export function AssignmentList({ assignments, courses, actions, onReschedule, onEdit, onDelete }: AssignmentListProps) {
  return (
    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
      <div className={`${ASSIGNMENT_ROW_GRID} bg-slate-100 border-b border-slate-300 text-left text-slate-900 font-semibold text-xs`}>
        <div className="p-1.5">Assignment</div>
        <div className="p-1.5">Course</div>
        <div className="p-1.5">Due</div>
        <div className="p-1.5">Status</div>
        <div className="p-1.5" />
      </div>
      <div
        className="overflow-y-auto overflow-x-auto styled-scrollbar"
        style={{ maxHeight: getAssignmentListBodyHeightPx() }}
      >
        <div className="divide-y divide-slate-200">
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
        </div>
      </div>
    </div>
  );
}
