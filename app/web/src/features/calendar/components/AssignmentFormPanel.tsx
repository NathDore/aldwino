import { useState } from "react";
import type { AssignmentDto } from "@/features/assignments/types/assignment.types";
import type { CourseDto } from "@/features/courses";
import { QuickAssignmentForm } from "./QuickAssignmentForm";
import { InlineCourseForm } from "./InlineCourseForm";

interface AssignmentFormPanelProps {
  onClose: () => void;
  assignmentToEdit?: AssignmentDto | null;
  date?: string;
  hour?: number;
}

type Mode = "assignment" | "create-course";

export function AssignmentFormPanel({ date, hour, onClose, assignmentToEdit }: AssignmentFormPanelProps) {
  const [mode, setMode] = useState<Mode>("assignment");
  const [pendingCourseId, setPendingCourseId] = useState<string | undefined>(undefined);

  const handleCourseCreated = (course: CourseDto) => {
    setPendingCourseId(course.id);
    setMode("assignment");
  };

  return (
    <>
      <div className={mode === "create-course" ? "hidden" : undefined}>
        <QuickAssignmentForm
          date={date}
          hour={hour}
          onClose={onClose}
          assignmentToEdit={assignmentToEdit}
          onRequestCreateCourse={() => setMode("create-course")}
          pendingCourseId={pendingCourseId}
        />
      </div>
      {mode === "create-course" && (
        <InlineCourseForm onCreated={handleCourseCreated} onBack={() => setMode("assignment")} />
      )}
    </>
  );
}
